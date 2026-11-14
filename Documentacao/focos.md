# Focos (tarefas)

Um **foco** é uma tarefa que a pessoa cadastra para focar nela: tem nome, duração e uma regra de repetição. No código e no banco o nome antigo continua: `tarefas` / `tasks`.

**Status:** implementado. Migrations `0003_tarefas.sql` e `0009_focos_diarios.sql` aplicadas.

## Regras
- **Duração:** só 15, 30, 45 ou 60 minutos. São as mesmas opções do "Tempo de Foco" da tela Focar. O padrão é 30.
- **Depois de concluir**, a pessoa escolhe no cadastro:
  - **Apagar o foco** (uma vez): o foco some da lista assim que uma sessão dele é concluída. É o padrão.
  - **Repetir todo dia** (diário): o foco fica na lista. Ao concluir, fica marcado como "feito hoje" e volta a ficar pendente no dia seguinte. Serve para hábitos, como ler 30 minutos por dia.
- **Só a sessão concluída conta.** Desistir ou sair do app (o gelo quebra) não apaga o foco nem o marca como feito.
- **Foco diário feito hoje** continua na lista e pode ser repetido no mesmo dia (botão "De novo"); os pontos e as moedas contam normalmente.
- **"Hoje"** é o dia no calendário do aparelho.
- **Sugestões rápidas** da tela Focar ("Ler um livro", "Codar"...) criam um foco de uma vez.
- A lixeira da aba Focos continua apagando qualquer foco na hora.

## Telas
- **Focos (`tarefas.tsx`):** o cadastro tem o nome, a **Duração** (quatro botões) e **Depois de concluir** ("Apagar o foco" ou "Repetir todo dia"), com uma frase explicando a opção marcada. Cada foco da lista mostra "Uma vez", "Todo dia" ou "Todo dia · feito hoje".
- **Focar (`index.tsx`):** na lista "Tarefas que precisam do seu foco", o foco diário tem o ícone de repetição, e o feito hoje, um check verde. Sem escolha da pessoa, a tela seleciona o primeiro foco que ainda não foi feito hoje.

## Dados (tabela `tasks`)
| Campo | O que é |
| --- | --- |
| `nome` | 1 a 60 caracteres |
| `duracao_minutos` | 15, 30, 45 ou 60 (restrição `tasks_duracao_fixa`, migration `0009`) |
| `repete_diariamente` | `true`: diário. `false`: de uma vez |
| `concluida_em` | Dia da última conclusão (`date`). Só é usado nos focos diários |

Só o dono lê e altera os próprios focos (RLS).

**Na migration `0009`:** os focos que já existiam viraram diários (para não sumirem ao serem concluídos) e as durações fora das quatro opções foram para a mais próxima (25 → 30).

## No app
- `src/domain/tarefas.ts`: `TEMPOS_SUGERIDOS`, `validarTarefa`, `diaLocal`, `feitaHoje`.
- `src/services/tarefas.ts`: lista, cria, remove e marca como concluída.
- `src/store/tarefas.ts`: `concluir(id, agora)` é chamado quando a sessão termina (`src/store/sessao.ts`). O foco de uma vez sai da lista e o diário ganha a data de hoje, na hora, no aparelho.
- **Sem internet:** a conclusão fica em uma lista de pendências salva no aparelho (`pendentes`) e é enviada na próxima carga dos focos (ao abrir o app).

## Em aberto
- **Dias seguidos (sequência):** contar quantos dias seguidos um foco diário foi feito.
- **Editar um foco** (nome, duração, repetição) sem apagar e criar de novo.
- **Outras repetições:** dias da semana específicos.
- Hoje o cadastro guarda só a última conclusão, não o histórico por foco.
