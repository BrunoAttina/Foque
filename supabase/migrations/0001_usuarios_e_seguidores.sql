-- Foque · 0001 · Usuários, seguidores e progresso
-- Como aplicar: cole este arquivo inteiro no SQL Editor do painel do Supabase e clique em Run.
-- Ver Documentacao/arquitetura.md e Documentacao/decisoes.md.

-- ---------------------------------------------------------------------------
-- Perfis: um por usuário do Supabase Auth. Guarda o nome de usuário (@).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Nulo até a pessoa escolher (ex.: login social). Só minúsculas, números, "_" e ".".
  username text unique check (username ~ '^[a-z0-9_.]{3,20}$'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Qualquer pessoa logada vê os perfis (necessário para buscar e seguir).
create policy "Perfis visíveis para usuários logados"
  on public.profiles for select
  to authenticated
  using (true);

-- Cada pessoa só altera o próprio perfil.
create policy "Usuário altera o próprio perfil"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- O app só pode alterar a coluna username.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (username) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Seguidores: quem segue quem. Seguir não precisa de aprovação.
-- ---------------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index follows_following_id_idx on public.follows (following_id);

alter table public.follows enable row level security;

-- Cada pessoa vê as relações em que participa (quem ela segue e quem a segue).
create policy "Ver as próprias relações"
  on public.follows for select
  to authenticated
  using ((select auth.uid()) in (follower_id, following_id));

create policy "Seguir em nome próprio"
  on public.follows for insert
  to authenticated
  with check ((select auth.uid()) = follower_id);

create policy "Deixar de seguir em nome próprio"
  on public.follows for delete
  to authenticated
  using ((select auth.uid()) = follower_id);

revoke all on public.follows from anon;
grant select, insert, delete on public.follows to authenticated;

-- ---------------------------------------------------------------------------
-- Progresso: pontos de foco. O nível é calculado a partir dos pontos.
-- ---------------------------------------------------------------------------
create table public.progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  pontos_totais integer not null default 0 check (pontos_totais >= 0),
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- Vê o próprio progresso e o de quem segue.
create policy "Ver o próprio progresso e o de quem sigo"
  on public.progress for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.follows f
      where f.follower_id = (select auth.uid())
        and f.following_id = progress.user_id
    )
  );

-- Sem política de insert/update: só funções do servidor alteram os pontos.
revoke all on public.progress from anon;
revoke insert, update, delete on public.progress from authenticated;
grant select on public.progress to authenticated;

-- ---------------------------------------------------------------------------
-- Ao criar um usuário no Auth: cria o perfil (com o @ do cadastro) e o progresso.
-- ---------------------------------------------------------------------------
create function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nome text := lower(nullif(trim(new.raw_user_meta_data ->> 'username'), ''));
begin
  if nome is not null and nome !~ '^[a-z0-9_.]{3,20}$' then
    nome := null;
  end if;

  begin
    insert into public.profiles (id, username) values (new.id, nome);
  exception when unique_violation then
    -- @ já usado por outra pessoa: cria sem @ e o app pede para escolher outro.
    insert into public.profiles (id, username) values (new.id, null);
  end;

  insert into public.progress (user_id) values (new.id);
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

-- ---------------------------------------------------------------------------
-- Verifica se um @ está livre. Liberada também para quem ainda não tem conta (tela de cadastro).
-- ---------------------------------------------------------------------------
create function public.username_disponivel(nome text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles where username = lower(trim(nome))
  );
$$;

revoke execute on function public.username_disponivel(text) from public;
grant execute on function public.username_disponivel(text) to anon, authenticated;
