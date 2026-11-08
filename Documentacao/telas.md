# Telas e navegação

## Mapa de telas
| Tela | Objetivo | Status |
| --- | --- | --- |
| Início | Apresentar o Foque e levar ao cadastro ou ao login. | Rascunho |
| Cadastro e login | Criar conta ou entrar em uma existente. | Rascunho |
| Perguntas iniciais | O Foque coleta profissão e rotina do usuário. | Rascunho |
| Tarefas do dia (`src/app/index.tsx`) | Listar, cadastrar, remover e escolher a tarefa da sessão. Mostra nível e pontos. | Protótipo (dados em memória) |
| Sessão de foco (`src/app/sessao.tsx`) | Timer da tarefa. Sair do app cancela; o botão voltar e "Desistir" encerram como desistência. | Protótipo |
| Resultado (`src/app/resultado.tsx`) | Mostrar os pontos ganhos, o cancelamento e a subida de nível. | Protótipo |
| Progresso | Mostrar o nível de foco e os pontos acumulados. Por enquanto, isso fica no topo de Tarefas do dia. | Rascunho |

## Fluxo de navegação
1. **Início** → **Cadastro e login**
2. **Cadastro e login** → **Perguntas iniciais** (primeiro acesso)
3. **Perguntas iniciais** → **Tarefas do dia**
4. **Tarefas do dia** → escolher tarefa → **Sessão de foco**
5. **Sessão de foco** → **Resultado** (concluída ou cancelada)
6. **Resultado** → **Tarefas do dia**
7. **Progresso** é acessível a partir de **Tarefas do dia**.

*Pendente: como o usuário volta às perguntas iniciais depois do primeiro acesso e se há menu de navegação fixo.*

## Rascunhos de UI
**[pendente]** Esboços, referências visuais e paleta de cores.
