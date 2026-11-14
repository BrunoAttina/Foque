-- Foque · 0009 · Focos de uma vez ou diários; durações fixas
-- Como aplicar: cole este arquivo inteiro no SQL Editor do painel do Supabase e clique em Run.
-- Depende de 0003. Pode rodar mais de uma vez sem erro.
-- Ver Documentacao/focos.md.

-- ---------------------------------------------------------------------------
-- Repetição: um foco é "de uma vez" (o app apaga ao concluir) ou "diário"
-- (fica na lista e volta a ficar pendente no dia seguinte).
-- Os focos que já existiam viram diários, para não sumirem ao serem concluídos.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'repete_diariamente'
  ) then
    alter table public.tasks add column repete_diariamente boolean not null default true;
    alter table public.tasks alter column repete_diariamente set default false;
  end if;
end;
$$;

-- Dia (no calendário do aparelho) da última conclusão. Só é usado nos focos diários.
alter table public.tasks add column if not exists concluida_em date;

-- ---------------------------------------------------------------------------
-- Durações: só 15, 30, 45 ou 60 minutos (as opções da tela Focar).
-- Os focos antigos com outra duração vão para a opção mais próxima (25 → 30).
-- ---------------------------------------------------------------------------
update public.tasks
set duracao_minutos = case
  when duracao_minutos < 23 then 15
  when duracao_minutos < 38 then 30
  when duracao_minutos < 53 then 45
  else 60
end
where duracao_minutos not in (15, 30, 45, 60);

alter table public.tasks drop constraint if exists tasks_duracao_fixa;
alter table public.tasks
  add constraint tasks_duracao_fixa check (duracao_minutos in (15, 30, 45, 60));

-- O app pode alterar a repetição e marcar a conclusão do dia.
grant update (repete_diariamente, concluida_em) on public.tasks to authenticated;

-- Faz a API (PostgREST) enxergar as colunas novas na hora.
notify pgrst, 'reload schema';
