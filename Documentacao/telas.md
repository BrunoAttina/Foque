# Telas e navegação

## Mapa de telas
| Tela | Objetivo | Status |
| --- | --- | --- |
| Entrar (`src/app/entrar.tsx`) | Login com e-mail e senha. Primeira tela para quem não está logado. | Implementado |
| Cadastro (`src/app/cadastro.tsx`) | Criar conta com @, e-mail e senha. Avisa se o @ estiver em uso e se é preciso confirmar o e-mail. | Implementado |
| Escolher @ (`src/app/escolher-nome.tsx`) | Para quem está logado sem @. Bloqueia o app até escolher. | Implementado |
| Buscar pessoas | Procurar usuários pelo @. | Rascunho |
| Perfil de usuário | Mostrar @, nível e pontos de quem você segue; botão seguir ou deixar de seguir. | Rascunho |
| Seguindo | Lista de pessoas que você segue. | Rascunho |
| Perguntas iniciais | O Foque coleta profissão e rotina do usuário. | Rascunho |
| Tarefas do dia (`src/app/index.tsx`) | Listar, cadastrar, remover e escolher a tarefa da sessão. Mostra nível e pontos. | Protótipo (dados em memória) |
| Sessão de foco (`src/app/sessao.tsx`) | Timer da tarefa. Sair do app cancela; o botão voltar e "Desistir" encerram como desistência. | Protótipo |
| Resultado (`src/app/resultado.tsx`) | Mostrar os pontos ganhos, o cancelamento e a subida de nível. | Protótipo |
| Progresso | Mostrar o nível de foco e os pontos acumulados. Por enquanto, isso fica no topo de Tarefas do dia. | Rascunho |

## Fluxo de navegação
1. Sem login: **Entrar** ↔ **Cadastro**
2. Logado sem @: **Escolher @**
3. Logado com @: **Tarefas do dia**. As **Perguntas iniciais** ainda serão encaixadas no primeiro acesso.
4. **Tarefas do dia** → escolher tarefa → **Sessão de foco**
5. **Sessão de foco** → **Resultado** (concluída ou cancelada)
6. **Resultado** → **Tarefas do dia**
7. **Progresso** é acessível a partir de **Tarefas do dia**.

O redirecionamento é feito no layout raiz (`src/app/_layout.tsx`) com `Stack.Protected`. As telas do app ficam no grupo `src/app/(app)/`.

*Pendente: como o usuário volta às perguntas iniciais depois do primeiro acesso e se há menu de navegação fixo (provável, com as telas sociais).*

## Rascunhos de UI
**[pendente]** Esboços, referências visuais e paleta de cores.
