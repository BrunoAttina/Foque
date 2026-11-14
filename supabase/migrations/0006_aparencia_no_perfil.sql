-- Foque · 0006 · Aparência do Foque no perfil
-- Como aplicar: cole este arquivo inteiro no SQL Editor do painel do Supabase e clique em Run.
-- Depende de 0001 e 0005. Pode rodar mais de uma vez sem erro.
-- Ver Documentacao/aparencia-foque.md.

-- A aparência em uso vira a "foto" do perfil. Como o @, é visível para qualquer usuário logado.
-- Os ids são os de src/domain/aparencias.ts; 'padrao' é a Clássica, de graça.
alter table public.profiles
  add column if not exists aparencia text not null default 'padrao';

-- ---------------------------------------------------------------------------
-- Define a aparência em uso do usuário logado.
-- Só aceita a Clássica ou uma aparência comprada na loja (22023 nos outros casos).
-- O app não tem permissão de alterar a coluna direto: só por esta função.
-- ---------------------------------------------------------------------------
create or replace function public.definir_aparencia(p_aparencia text)
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

  if p_aparencia is distinct from 'padrao' and not exists (
    select 1
    from public.compras c
    join public.loja_itens i on i.id = c.item_id
    where c.user_id = uid and c.item_id = p_aparencia and i.tipo = 'aparencia'
  ) then
    raise exception 'Aparência não liberada' using errcode = '22023';
  end if;

  update public.profiles set aparencia = p_aparencia where id = uid;
end;
$$;

revoke execute on function public.definir_aparencia(text) from public, anon;
grant execute on function public.definir_aparencia(text) to authenticated;

-- Faz a API (PostgREST) enxergar a coluna e a função novas na hora.
notify pgrst, 'reload schema';
