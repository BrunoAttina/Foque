-- Foque · 0010 · Conquistas de Foco (fixas e personalizadas)
-- Como aplicar: cole este arquivo inteiro no SQL Editor do painel do Supabase e clique em Run.
-- Depende de 0001, 0002, 0005 e 0009. Pode rodar mais de uma vez sem erro.
-- Ver Documentacao/conquistas.md.
--
-- Regras:
-- - Quem calcula é o servidor: gatilhos em focus_sessions e compras chamam avaliar_conquistas.
-- - Toda conquista dá 10 moedas (fixa ou nível de personalizada), pagas uma vez.
-- - Qualquer usuário logado vê as conquistas obtidas de qualquer pessoa.
-- - Retroativo: no fim do arquivo, todos os usuários são avaliados uma vez.

-- ---------------------------------------------------------------------------
-- Catálogo das conquistas fixas
-- categoria: pontos (pontos de foco), focos (focos concluídos), variedade (tarefas
-- diferentes concluídas), compras (itens comprados), gasto (moedas gastas),
-- colecao (aparências compradas; a meta é ter todas as que estão à venda).
-- ---------------------------------------------------------------------------
create table if not exists public.conquistas (
  id text primary key,
  categoria text not null check (categoria in ('pontos', 'focos', 'variedade', 'compras', 'gasto', 'colecao')),
  titulo text not null,
  descricao text not null,
  -- Valor a alcançar. Na categoria colecao é ignorado: vale ter todas as aparências.
  meta integer not null check (meta >= 0),
  icone text not null,
  ordem integer not null default 0,
  ativa boolean not null default true
);

insert into public.conquistas (id, categoria, titulo, descricao, meta, icone, ordem) values
  ('foca_iniciante',     'pontos',    'Foca Iniciante',     'Chegou a 50 pontos de foco',          50,   'star-outline',      10),
  ('foca_experiente',    'pontos',    'Foca Experiente',    'Chegou a 150 pontos de foco',         150,  'star-half',         11),
  ('foca_veterana',      'pontos',    'Foca Veterana',      'Chegou a 500 pontos de foco',         500,  'star',              12),
  ('foca_lendaria',      'pontos',    'Foca Lendária',      'Chegou a 1.000 pontos de foco',       1000, 'auto-awesome',      13),
  ('primeiro_mergulho',  'focos',     'Primeiro Mergulho',  'Concluiu o primeiro foco',            1,    'pool',              20),
  ('pegando_o_ritmo',    'focos',     'Pegando o Ritmo',    'Concluiu 10 focos',                   10,   'waves',             21),
  ('foca_dedicada',      'focos',     'Foca Dedicada',      'Concluiu 50 focos',                   50,   'workspace-premium', 22),
  ('centenario_de_gelo', 'focos',     'Centenário de Gelo', 'Concluiu 100 focos',                  100,  'ac-unit',           23),
  ('foca_versatil',      'variedade', 'Foca Versátil',      'Concluiu focos de 5 tarefas diferentes', 5, 'category',          30),
  ('primeira_compra',    'compras',   'Primeira Compra',    'Comprou o primeiro item na loja',     1,    'shopping-bag',      40),
  ('foca_gastadora',     'gasto',     'Foca Gastadora',     'Gastou 100 moedas na loja',           100,  'paid',              41),
  ('colecionadora',      'colecao',   'Colecionadora',      'Tem todas as aparências do Foque',    0,    'collections',       42)
on conflict (id) do nothing;

alter table public.conquistas enable row level security;
drop policy if exists "Ler o catálogo de conquistas" on public.conquistas;
create policy "Ler o catálogo de conquistas"
  on public.conquistas for select to authenticated using (true);
revoke all on public.conquistas from anon;
revoke insert, update, delete on public.conquistas from authenticated;
grant select on public.conquistas to authenticated;

-- ---------------------------------------------------------------------------
-- Níveis das conquistas personalizadas (por foco)
-- ---------------------------------------------------------------------------
create table if not exists public.niveis_conquista_foco (
  nivel integer primary key check (nivel between 1 and 20),
  meta integer not null unique check (meta > 0),
  -- Vem antes do nome do foco: "Bom em ler livros".
  titulo text not null,
  cor text not null
);

insert into public.niveis_conquista_foco (nivel, meta, titulo, cor) values
  (1, 5,   'Primeiros Mergulhos em', 'gelo'),
  (2, 10,  'Iniciante em',           'bronze'),
  (3, 25,  'Bom em',                 'prata'),
  (4, 50,  'Focado em',              'ouro'),
  (5, 100, 'Mestre em',              'diamante'),
  (6, 200, 'Lenda em',               'aurora'),
  (7, 365, 'Foca Suprema em',        'arco-iris')
on conflict (nivel) do nothing;

alter table public.niveis_conquista_foco enable row level security;
drop policy if exists "Ler os níveis das conquistas por foco" on public.niveis_conquista_foco;
create policy "Ler os níveis das conquistas por foco"
  on public.niveis_conquista_foco for select to authenticated using (true);
revoke all on public.niveis_conquista_foco from anon;
revoke insert, update, delete on public.niveis_conquista_foco from authenticated;
grant select on public.niveis_conquista_foco to authenticated;

-- ---------------------------------------------------------------------------
-- Conquistas fixas obtidas
-- ---------------------------------------------------------------------------
create table if not exists public.conquistas_obtidas (
  user_id uuid not null references public.profiles (id) on delete cascade,
  conquista_id text not null references public.conquistas (id) on delete cascade,
  obtida_em timestamptz not null default now(),
  moedas integer not null default 0,
  -- false até o app mostrar o destaque "Conquista desbloqueada".
  vista boolean not null default false,
  primary key (user_id, conquista_id)
);

alter table public.conquistas_obtidas enable row level security;
drop policy if exists "Ver conquistas de qualquer pessoa" on public.conquistas_obtidas;
create policy "Ver conquistas de qualquer pessoa"
  on public.conquistas_obtidas for select to authenticated using (true);
revoke all on public.conquistas_obtidas from anon;
revoke insert, update, delete on public.conquistas_obtidas from authenticated;
grant select on public.conquistas_obtidas to authenticated;

-- ---------------------------------------------------------------------------
-- Conquistas personalizadas: uma linha por foco (nome normalizado) de cada pessoa
-- ---------------------------------------------------------------------------
create table if not exists public.conquistas_foco (
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Nome normalizado: minúsculas, sem acentos e sem espaços sobrando.
  chave text not null,
  -- Nome como a pessoa escreveu na sessão mais recente.
  nome text not null,
  -- Focos concluídos (de 15 min ou mais) com esse nome.
  quantidade integer not null default 0,
  -- 0 = ainda sem conquista; 1 a 7 = nível em niveis_conquista_foco.
  nivel integer not null default 0,
  -- Quando o nível atual foi alcançado.
  nivel_em timestamptz,
  atualizada_em timestamptz not null default now(),
  vista boolean not null default true,
  primary key (user_id, chave)
);

alter table public.conquistas_foco enable row level security;
-- Os outros veem só as que já viraram conquista; o dono vê também o progresso.
drop policy if exists "Ver conquistas por foco" on public.conquistas_foco;
create policy "Ver conquistas por foco"
  on public.conquistas_foco for select to authenticated
  using (nivel >= 1 or (select auth.uid()) = user_id);
revoke all on public.conquistas_foco from anon;
revoke insert, update, delete on public.conquistas_foco from authenticated;
grant select on public.conquistas_foco to authenticated;

-- ---------------------------------------------------------------------------
-- Nome normalizado de um foco. "Ler Livros " e "ler livros" viram a mesma chave.
-- ---------------------------------------------------------------------------
create or replace function public.chave_do_foco(p_nome text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    translate(
      lower(trim(p_nome)),
      'áàâãäéèêëíìîïóòôõöúùûüç',
      'aaaaaeeeeiiiiooooouuuuc'
    ),
    '\s+', ' ', 'g'
  );
$$;

-- ---------------------------------------------------------------------------
-- Valores que as conquistas fixas usam, de uma pessoa.
-- ---------------------------------------------------------------------------
create or replace function public.valores_de_conquista(p_uid uuid)
returns table (
  pontos integer,
  focos integer,
  variedade integer,
  compras integer,
  gasto integer,
  aparencias integer,
  aparencias_total integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce((select p.pontos_totais from public.progress p where p.user_id = p_uid), 0),
    (select count(*)::integer from public.focus_sessions s where s.user_id = p_uid and s.status = 'concluida'),
    (select count(distinct public.chave_do_foco(s.tarefa))::integer
       from public.focus_sessions s where s.user_id = p_uid and s.status = 'concluida'),
    (select count(*)::integer from public.compras c where c.user_id = p_uid),
    (select coalesce(sum(c.preco_pago), 0)::integer from public.compras c where c.user_id = p_uid),
    (select count(*)::integer from public.compras c
       join public.loja_itens i on i.id = c.item_id
       where c.user_id = p_uid and i.tipo = 'aparencia'),
    (select count(*)::integer from public.loja_itens i where i.tipo = 'aparencia' and i.ativo);
$$;

revoke execute on function public.valores_de_conquista(uuid) from public, anon, authenticated;

-- Progresso do usuário logado nas conquistas fixas (para a tela Conquistas).
create or replace function public.meu_progresso_conquistas()
returns table (
  pontos integer,
  focos integer,
  variedade integer,
  compras integer,
  gasto integer,
  aparencias integer,
  aparencias_total integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.valores_de_conquista(auth.uid()) where auth.uid() is not null;
$$;

revoke execute on function public.meu_progresso_conquistas() from public, anon;
grant execute on function public.meu_progresso_conquistas() to authenticated;

-- ---------------------------------------------------------------------------
-- Confere todas as conquistas de uma pessoa, registra as novas e paga as moedas.
-- p_ja_vistas = true no retroativo: as conquistas antigas não viram destaque.
-- Interna: o app não chama. Devolve quantas conquistas (ou níveis) foram ganhos.
-- ---------------------------------------------------------------------------
create or replace function public.avaliar_conquistas(p_uid uuid, p_ja_vistas boolean default false)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Moedas por conquista. Mudar aqui muda para todas.
  c_moedas constant integer := 10;
  v record;
  v_novas integer := 0;
  v_qtd integer;
  r record;
  v_nivel_novo integer;
  v_nivel_antigo integer;
begin
  if p_uid is null then
    return 0;
  end if;

  select * into v from public.valores_de_conquista(p_uid);

  -- Fixas: insere as que bateram a meta e ainda não tinham sido ganhas.
  with ganhas as (
    insert into public.conquistas_obtidas (user_id, conquista_id, moedas, vista)
    select p_uid, c.id, c_moedas, p_ja_vistas
    from public.conquistas c
    where c.ativa
      and case c.categoria
        when 'pontos'    then v.pontos >= c.meta
        when 'focos'     then v.focos >= c.meta
        when 'variedade' then v.variedade >= c.meta
        when 'compras'   then v.compras >= c.meta
        when 'gasto'     then v.gasto >= c.meta
        when 'colecao'   then v.aparencias_total > 0 and v.aparencias >= v.aparencias_total
        else false
      end
    on conflict (user_id, conquista_id) do nothing
    returning 1
  )
  select count(*) into v_qtd from ganhas;
  v_novas := v_novas + v_qtd;

  -- Personalizadas: uma por nome de foco, contando focos concluídos de 15 min ou mais.
  for r in
    select
      public.chave_do_foco(s.tarefa) as chave,
      (array_agg(trim(s.tarefa) order by s.fim desc))[1] as nome,
      count(*)::integer as quantidade
    from public.focus_sessions s
    where s.user_id = p_uid and s.status = 'concluida' and s.duracao_minutos >= 15
    group by public.chave_do_foco(s.tarefa)
  loop
    select coalesce(max(n.nivel), 0) into v_nivel_novo
    from public.niveis_conquista_foco n
    where n.meta <= r.quantidade;

    select cf.nivel into v_nivel_antigo
    from public.conquistas_foco cf
    where cf.user_id = p_uid and cf.chave = r.chave
    for update;
    v_nivel_antigo := coalesce(v_nivel_antigo, 0);

    insert into public.conquistas_foco (user_id, chave, nome, quantidade, nivel, nivel_em, atualizada_em, vista)
    values (
      p_uid, r.chave, r.nome, r.quantidade, greatest(v_nivel_novo, v_nivel_antigo),
      case when v_nivel_novo > 0 then now() end, now(),
      v_nivel_novo <= v_nivel_antigo or p_ja_vistas
    )
    on conflict (user_id, chave) do update
    set nome = excluded.nome,
        quantidade = excluded.quantidade,
        -- O nível nunca desce.
        nivel = greatest(public.conquistas_foco.nivel, excluded.nivel),
        nivel_em = case when excluded.nivel > public.conquistas_foco.nivel then now() else public.conquistas_foco.nivel_em end,
        atualizada_em = now(),
        vista = case when excluded.nivel > public.conquistas_foco.nivel then p_ja_vistas else public.conquistas_foco.vista end;

    -- Cada nível alcançado é uma conquista (subir de 0 para 2 paga duas).
    if v_nivel_novo > v_nivel_antigo then
      v_novas := v_novas + (v_nivel_novo - v_nivel_antigo);
    end if;
  end loop;

  if v_novas > 0 then
    insert into public.carteiras (user_id, moedas) values (p_uid, v_novas * c_moedas)
    on conflict (user_id) do update
    set moedas = public.carteiras.moedas + excluded.moedas,
        updated_at = now();
  end if;

  return v_novas;
end;
$$;

revoke execute on function public.avaliar_conquistas(uuid, boolean) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Gatilhos: sessão concluída e compra registrada avaliam as conquistas.
-- Rodam na mesma transação de registrar_sessao e comprar_item.
-- ---------------------------------------------------------------------------
create or replace function public.gatilho_avaliar_conquistas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.avaliar_conquistas(new.user_id, false);
  return new;
end;
$$;

revoke execute on function public.gatilho_avaliar_conquistas() from public, anon, authenticated;

drop trigger if exists conquistas_ao_concluir_sessao on public.focus_sessions;
create trigger conquistas_ao_concluir_sessao
  after insert on public.focus_sessions
  for each row
  when (new.status = 'concluida')
  execute function public.gatilho_avaliar_conquistas();

drop trigger if exists conquistas_ao_comprar on public.compras;
create trigger conquistas_ao_comprar
  after insert on public.compras
  for each row
  execute function public.gatilho_avaliar_conquistas();

-- ---------------------------------------------------------------------------
-- O app marca como vistas as conquistas que já mostrou no destaque.
-- ---------------------------------------------------------------------------
create or replace function public.marcar_conquistas_vistas()
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
  update public.conquistas_obtidas set vista = true where user_id = uid and not vista;
  update public.conquistas_foco set vista = true where user_id = uid and not vista;
end;
$$;

revoke execute on function public.marcar_conquistas_vistas() from public, anon;
grant execute on function public.marcar_conquistas_vistas() to authenticated;

-- ---------------------------------------------------------------------------
-- Retroativo: avalia todos os usuários uma vez, com conquistas e moedas.
-- Rodar de novo não paga de novo (cada conquista só entra uma vez).
-- ---------------------------------------------------------------------------
do $$
declare
  p record;
begin
  for p in select id from public.profiles loop
    perform public.avaliar_conquistas(p.id, true);
  end loop;
end;
$$;

-- Faz a API (PostgREST) enxergar as tabelas e as funções novas na hora.
notify pgrst, 'reload schema';
