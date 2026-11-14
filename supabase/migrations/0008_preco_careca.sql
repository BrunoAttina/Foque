-- Foque · 0008 · Preço do Foque Careca: 30 moedas
-- Como aplicar: cole este arquivo inteiro no SQL Editor do painel do Supabase e clique em Run.
-- Depende de 0005. Pode rodar mais de uma vez sem erro.
-- Ver Documentacao/loja.md.

-- Bebê e Careca custam 30 moedas. Quem já comprou não é afetado.
update public.loja_itens set preco = 30 where id in ('bebe', 'careca');
