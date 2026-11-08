-- Foque · 0002 · Sessões de foco e cálculo de pontos no servidor
-- Como aplicar: cole este arquivo inteiro no SQL Editor do painel do Supabase e clique em Run.
-- Depende de 0001_usuarios_e_seguidores.sql.

-- ---------------------------------------------------------------------------
-- Sessões de foco: histórico de cada sessão concluída ou cancelada.
-- ---------------------------------------------------------------------------
create table public.focus_sessions (
  -- Gerado no aparelho: reenviar a mesma sessão (fila offline) não duplica pontos.
  id uuid primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  tarefa text not null check (char_length(tarefa) between 1 and 60),
  duracao_minutos integer not null check (duracao_minutos between 1 and 240),
  inicio timestamptz not null,
  fim timestamptz not null,
  status text not null check (status in ('concluida', 'cancelada')),
  pontos integer not null default 0 check (pontos >= 0),
  created_at timestamptz not null default now(),
  check (fim >= inicio)
);

create index focus_sessions_user_inicio_idx on public.focus_sessions (user_id, inicio desc);

alter table public.focus_sessions enable row level security;

-- Cada pessoa vê só o próprio histórico.
create policy "Ver as próprias sessões"
  on public.focus_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Sem política de escrita: sessões entram só pela função registrar_sessao.
revoke all on public.focus_sessions from anon;
revoke insert, update, delete on public.focus_sessions from authenticated;
grant select on public.focus_sessions to authenticated;

-- ---------------------------------------------------------------------------
-- Registra uma sessão, calcula os pontos e soma no progresso.
-- Retorna os pontos ganhos. Chamar de novo com o mesmo id não soma de novo.
-- ---------------------------------------------------------------------------
create function public.registrar_sessao(
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
