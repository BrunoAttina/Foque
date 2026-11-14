-- Foque · 0005 · Loja e moedas
-- Como aplicar: cole este arquivo inteiro no SQL Editor do painel do Supabase e clique em Run.
-- Depende de 0001, 0002 e 0004. Pode rodar mais de uma vez sem erro.
-- Ver Documentacao/loja.md.

-- ---------------------------------------------------------------------------
-- Carteira: o saldo de moedas de cada pessoa. Só o dono vê.
-- Os pontos (progress) só acumulam e definem o nível; as moedas são gastas na loja.
-- ---------------------------------------------------------------------------
create table if not exists public.carteiras (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  moedas integer not null default 0 check (moedas >= 0),
  updated_at timestamptz not null default now()
);

alter table public.carteiras enable row level security;

drop policy if exists "Ver a própria carteira" on public.carteiras;
create policy "Ver a própria carteira"
  on public.carteiras for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Sem política de escrita: só as funções abaixo alteram o saldo.
revoke all on public.carteiras from anon;
revoke insert, update, delete on public.carteiras from authenticated;
grant select on public.carteiras to authenticated;

-- Saldo inicial: quem já tem pontos começa com o mesmo número de moedas.
-- Só cria a carteira de quem ainda não tem; rodar de novo não soma outra vez.
insert into public.carteiras (user_id, moedas)
select user_id, pontos_totais from public.progress
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Itens da loja e seus preços. Qualquer usuário logado lê; ninguém altera pelo app.
-- Para mudar um preço: update public.loja_itens set preco = ... where id = '...';
-- ---------------------------------------------------------------------------
create table if not exists public.loja_itens (
  id text primary key,
  tipo text not null check (tipo in ('aparencia', 'acessorio')),
  preco integer not null check (preco >= 0),
  ordem integer not null default 0,
  ativo boolean not null default true
);

alter table public.loja_itens enable row level security;

drop policy if exists "Ver os itens da loja" on public.loja_itens;
create policy "Ver os itens da loja"
  on public.loja_itens for select
  to authenticated
  using (true);

revoke all on public.loja_itens from anon;
revoke insert, update, delete on public.loja_itens from authenticated;
grant select on public.loja_itens to authenticated;

-- Aparências à venda. A Clássica ('padrao') é de graça e não entra na loja.
-- Os ids são os mesmos de src/domain/aparencias.ts.
insert into public.loja_itens (id, tipo, preco, ordem) values
  ('bebe', 'aparencia', 30, 1),
  ('careca', 'aparencia', 60, 2),
  ('ninja', 'aparencia', 100, 3),
  ('princesa', 'aparencia', 100, 4)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Compras: o que cada pessoa já comprou. Só o dono vê.
-- ---------------------------------------------------------------------------
create table if not exists public.compras (
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id text not null references public.loja_itens (id),
  preco_pago integer not null check (preco_pago >= 0),
  comprado_em timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.compras enable row level security;

drop policy if exists "Ver as próprias compras" on public.compras;
create policy "Ver as próprias compras"
  on public.compras for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.compras from anon;
revoke insert, update, delete on public.compras from authenticated;
grant select on public.compras to authenticated;

-- ---------------------------------------------------------------------------
-- Compra um item com moedas. Devolve o saldo depois da compra.
-- Erros: 22023 item inválido · 23505 já comprado · P0001 moedas insuficientes.
-- ---------------------------------------------------------------------------
create or replace function public.comprar_item(p_item_id text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  v_preco integer;
  v_saldo integer;
begin
  if uid is null then
    raise exception 'Não autenticado' using errcode = '42501';
  end if;

  select preco into v_preco
  from public.loja_itens
  where id = p_item_id and ativo;
  if not found then
    raise exception 'Item inválido' using errcode = '22023';
  end if;

  if exists (select 1 from public.compras where user_id = uid and item_id = p_item_id) then
    raise exception 'Item já comprado' using errcode = '23505';
  end if;

  -- Garante a carteira e trava a linha: duas compras ao mesmo tempo não gastam o mesmo saldo.
  insert into public.carteiras (user_id) values (uid) on conflict (user_id) do nothing;
  select moedas into v_saldo from public.carteiras where user_id = uid for update;

  if v_saldo < v_preco then
    raise exception 'Moedas insuficientes' using errcode = 'P0001';
  end if;

  update public.carteiras
  set moedas = moedas - v_preco, updated_at = now()
  where user_id = uid;

  insert into public.compras (user_id, item_id, preco_pago) values (uid, p_item_id, v_preco);

  return v_saldo - v_preco;
end;
$$;

revoke execute on function public.comprar_item(text) from public, anon;
grant execute on function public.comprar_item(text) to authenticated;

-- ---------------------------------------------------------------------------
-- registrar_sessao (da 0002, atualizada na 0004): mesmo comportamento,
-- e cada ponto ganho passa a valer também 1 moeda.
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

    -- 1 moeda por ponto. Cria a carteira se ainda não existir.
    insert into public.carteiras (user_id, moedas) values (uid, v_pontos)
    on conflict (user_id) do update
    set moedas = public.carteiras.moedas + excluded.moedas,
        updated_at = now();
  end if;

  return v_pontos;
end;
$$;

revoke execute on function public.registrar_sessao(uuid, text, integer, timestamptz, timestamptz, text) from public, anon;
grant execute on function public.registrar_sessao(uuid, text, integer, timestamptz, timestamptz, text) to authenticated;

-- Faz a API (PostgREST) enxergar as tabelas e a função novas na hora.
notify pgrst, 'reload schema';
