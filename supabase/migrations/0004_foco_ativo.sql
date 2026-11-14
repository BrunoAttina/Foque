-- Foque · 0004 · Status "Focando agora"
-- Como aplicar: cole este arquivo inteiro no SQL Editor do painel do Supabase e clique em Run.
-- Depende de 0001_usuarios_e_seguidores.sql e 0002_sessoes_e_pontos.sql.
-- Pode rodar mais de uma vez sem erro.
-- Ver Documentacao/status-de-foco.md.

-- ---------------------------------------------------------------------------
-- Focos ativos: a sessão de foco em andamento de cada pessoa. Uma linha por usuário.
-- Linha com fim_previsto no passado conta como encerrada; o próximo foco a sobrescreve.
-- ---------------------------------------------------------------------------
create table if not exists public.focos_ativos (
  user_id uuid primary key,
  tarefa text not null check (char_length(tarefa) between 1 and 60),
  duracao_minutos integer not null check (duracao_minutos between 1 and 240),
  -- Horário do servidor, não do celular.
  inicio timestamptz not null,
  fim_previsto timestamptz not null,
  atualizado_em timestamptz not null default now(),
  -- Nome fixo: o app usa este nome no embed do PostgREST (profiles!focos_ativos_user_id_fkey).
  constraint focos_ativos_user_id_fkey
    foreign key (user_id) references public.profiles (id) on delete cascade,
  check (fim_previsto > inicio)
);

-- As consultas filtram fim_previsto > now() e ordenam por ele.
create index if not exists focos_ativos_fim_previsto_idx on public.focos_ativos (fim_previsto);

alter table public.focos_ativos enable row level security;

-- Vê o próprio foco e o de quem segue. Mesma regra de progress.
drop policy if exists "Ver o próprio foco e o de quem sigo" on public.focos_ativos;
create policy "Ver o próprio foco e o de quem sigo"
  on public.focos_ativos for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.follows f
      where f.follower_id = (select auth.uid())
        and f.following_id = focos_ativos.user_id
    )
  );

-- Sem política de escrita: só as funções abaixo alteram a tabela.
revoke all on public.focos_ativos from anon;
revoke insert, update, delete on public.focos_ativos from authenticated;
grant select on public.focos_ativos to authenticated;

-- ---------------------------------------------------------------------------
-- Publica que o usuário logado começou a focar. Sobrescreve a linha anterior, se houver.
-- ---------------------------------------------------------------------------
create or replace function public.iniciar_foco(
  p_tarefa text,
  p_duracao_minutos integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  v_tarefa text := trim(p_tarefa);
  v_agora timestamptz := now();
begin
  if uid is null then
    raise exception 'Não autenticado' using errcode = '42501';
  end if;

  -- Validações (errcode 22023 = dado inválido).
  if v_tarefa is null or char_length(v_tarefa) not between 1 and 60 then
    raise exception 'Tarefa inválida' using errcode = '22023';
  end if;
  if p_duracao_minutos is null or p_duracao_minutos not between 1 and 240 then
    raise exception 'Duração inválida' using errcode = '22023';
  end if;

  insert into public.focos_ativos (user_id, tarefa, duracao_minutos, inicio, fim_previsto, atualizado_em)
  values (
    uid,
    v_tarefa,
    p_duracao_minutos,
    v_agora,
    v_agora + make_interval(mins => p_duracao_minutos),
    v_agora
  )
  on conflict (user_id) do update
  set tarefa = excluded.tarefa,
      duracao_minutos = excluded.duracao_minutos,
      inicio = excluded.inicio,
      fim_previsto = excluded.fim_previsto,
      atualizado_em = excluded.atualizado_em;
end;
$$;

revoke execute on function public.iniciar_foco(text, integer) from public, anon;
grant execute on function public.iniciar_foco(text, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Remove o status do usuário logado. Sem linha, não faz nada.
-- ---------------------------------------------------------------------------
create or replace function public.encerrar_foco()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Não autenticado' using errcode = '42501';
  end if;

  delete from public.focos_ativos where user_id = uid;
end;
$$;

revoke execute on function public.encerrar_foco() from public, anon;
grant execute on function public.encerrar_foco() to authenticated;

-- ---------------------------------------------------------------------------
-- registrar_sessao (da 0002): mesmo comportamento, e passa a apagar também o status
-- de foco do usuário, como garantia extra.
-- ---------------------------------------------------------------------------
create or replace function public.registrar_sessao(
  p_id uuid,
  p_tarefa text,
  p_duracao_minutos integer,
  p_inicio timestamptz,
  p_fim timestamptz,
  p_status text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  v_pontos integer := 0;
  v_existente integer;
begin
  if uid is null then
    raise exception 'Não autenticado' using errcode = '42501';
  end if;

  -- Apaga o status de foco, mas só o de um foco que começou até o fim desta sessão.
  -- Uma sessão antiga, enviada pela fila offline, não apaga o status do foco atual.
  -- Fica antes do retorno abaixo para valer também no reenvio da mesma sessão.
  -- Se a sessão for inválida, a exceção desfaz este delete junto com o resto.
  delete from public.focos_ativos
  where user_id = uid and inicio <= p_fim;

  -- Mesma sessão enviada de novo: devolve o que já foi registrado.
  select pontos into v_existente
  from public.focus_sessions
  where id = p_id and user_id = uid;
  if found then
    return v_existente;
  end if;

  -- Validações (errcode 22023 = dado inválido; o app descarta e não reenvia).
  if p_status not in ('concluida', 'cancelada') then
    raise exception 'Status inválido' using errcode = '22023';
  end if;
  if p_duracao_minutos not between 1 and 240 then
    raise exception 'Duração inválida' using errcode = '22023';
  end if;
  if p_fim < p_inicio or p_fim > now() + interval '5 minutes' then
    raise exception 'Horário inválido' using errcode = '22023';
  end if;
  -- A fila offline guarda sessões por até 48 horas.
  if p_inicio < now() - interval '48 hours' then
    raise exception 'Sessão antiga demais' using errcode = '22023';
  end if;

  if p_status = 'concluida' then
    -- O tempo decorrido precisa cobrir a duração (5 s de tolerância).
    if p_fim - p_inicio < make_interval(mins => p_duracao_minutos) - interval '5 seconds' then
      raise exception 'Sessão mais curta que a duração' using errcode = '22023';
    end if;
    -- Não pode haver duas sessões concluídas ao mesmo tempo.
    if exists (
      select 1 from public.focus_sessions s
      where s.user_id = uid
        and s.status = 'concluida'
        and tstzrange(s.inicio, s.fim) && tstzrange(p_inicio, p_fim)
    ) then
      raise exception 'Sessão sobreposta a outra' using errcode = '22023';
    end if;
    -- Regra: 1 ponto por minuto completo.
    v_pontos := p_duracao_minutos;
  end if;

  insert into public.focus_sessions (id, user_id, tarefa, duracao_minutos, inicio, fim, status, pontos)
  values (p_id, uid, left(trim(p_tarefa), 60), p_duracao_minutos, p_inicio, p_fim, p_status, v_pontos);

  if v_pontos > 0 then
    update public.progress
    set pontos_totais = pontos_totais + v_pontos,
        updated_at = now()
    where user_id = uid;
  end if;

  return v_pontos;
end;
$$;

revoke execute on function public.registrar_sessao(uuid, text, integer, timestamptz, timestamptz, text) from public, anon;
grant execute on function public.registrar_sessao(uuid, text, integer, timestamptz, timestamptz, text) to authenticated;

-- Faz a API (PostgREST) enxergar a tabela nova e a relação com profiles na hora.
notify pgrst, 'reload schema';
