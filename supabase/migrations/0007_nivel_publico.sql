-- Foque · 0007 · Nível de foco visível para qualquer usuário logado
-- Como aplicar: cole este arquivo inteiro no SQL Editor do painel do Supabase e clique em Run.
-- Depende de 0001. Pode rodar mais de uma vez sem erro.
-- Ver Documentacao/decisoes.md.

-- ---------------------------------------------------------------------------
-- Devolve o nível de foco dos usuários pedidos (no máximo 100 por chamada).
-- O nível é público, como o @ e a aparência. Os pontos continuam visíveis só
-- para quem segue a pessoa (RLS de progress): esta função não os devolve.
--
-- ATENÇÃO: a conta do nível repete a de src/domain/pontos.ts
-- (pontos para o nível N = 15 × N × (N − 1)). Se a fórmula mudar lá, mude aqui.
-- ---------------------------------------------------------------------------
create or replace function public.niveis_de(p_ids uuid[])
returns table (user_id uuid, nivel integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.user_id,
    greatest(1, floor((1 + sqrt(1 + 4 * p.pontos_totais / 15.0)) / 2))::integer as nivel
  from public.progress p
  where auth.uid() is not null
    and p.user_id = any (p_ids[1:100]);
$$;

revoke execute on function public.niveis_de(uuid[]) from public, anon;
grant execute on function public.niveis_de(uuid[]) to authenticated;

-- Faz a API (PostgREST) enxergar a função nova na hora.
notify pgrst, 'reload schema';
