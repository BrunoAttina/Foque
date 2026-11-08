-- Foque · 0003 · Tarefas
-- Como aplicar: cole este arquivo inteiro no SQL Editor do painel do Supabase e clique em Run.
-- Depende de 0001_usuarios_e_seguidores.sql.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  -- Preenchido automaticamente com o usuário logado.
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 60),
  duracao_minutos integer not null check (duracao_minutos between 1 and 240),
  created_at timestamptz not null default now()
);

create index tasks_user_created_idx on public.tasks (user_id, created_at);

alter table public.tasks enable row level security;

-- Cada pessoa só vê e altera as próprias tarefas.
create policy "Ver as próprias tarefas"
  on public.tasks for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Criar tarefas para si"
  on public.tasks for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Editar as próprias tarefas"
  on public.tasks for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Remover as próprias tarefas"
  on public.tasks for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.tasks from anon;
grant select, insert, delete on public.tasks to authenticated;
grant update (nome, duracao_minutos) on public.tasks to authenticated;
