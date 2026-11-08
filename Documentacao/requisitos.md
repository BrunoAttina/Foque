# Requisitos

## Requisitos funcionais
| ID | Descrição | Prioridade | Status |
| --- | --- | --- | --- |
| RF-01 | O usuário cria uma conta com nome de usuário (@), e-mail e senha, ou com login social (Google ou Apple). | Alta | E-mail implementado; social pendente |
| RF-02 | O usuário entra em uma conta existente, com e-mail ou login social. | Alta | E-mail implementado; social pendente |
| RF-03 | O Foque faz perguntas sobre profissão e rotina do usuário. | Alta | Rascunho |
| RF-04 | Com base nas respostas, o Foque oferece sugestões para o usuário largar o celular e focar. | Média | Rascunho |
| RF-05 | O usuário cadastra tarefas do dia com nome e duração. | Alta | Rascunho |
| RF-06 | O usuário escolhe uma tarefa e inicia uma sessão de foco com timer na tela do app. | Alta | Rascunho |
| RF-07 | Se o usuário sair do Foque durante a sessão, o timer é encerrado e a sessão fica como cancelada. | Alta | Rascunho |
| RF-08 | Ao cancelar, o app informa o usuário de que não houve pontos de foco. | Alta | Rascunho |
| RF-09 | Ao concluir a sessão sem sair do app, o usuário ganha 1 ponto de foco por minuto completo. | Alta | Rascunho |
| RF-10 | O app mostra o nível de foco e os pontos de foco acumulados. | Alta | Rascunho |
| RF-11 | Quando os pontos acumulados atingem o necessário, o usuário sobe de nível de foco. | Alta | Rascunho |
| RF-12 | O @ é único, com 3 a 20 caracteres: letras minúsculas, números, "_" e ".". O app avisa se já estiver em uso. | Alta | Implementado |
| RF-13 | Quem entra sem @ (ex.: login social) escolhe um antes de usar o app. | Alta | Implementado |
| RF-14 | O usuário busca outras pessoas pelo começo do @. | Alta | Implementado |
| RF-15 | O usuário segue outra pessoa, sem precisar de aprovação, e pode deixar de seguir. | Alta | Implementado |
| RF-16 | Quem segue alguém vê o nível de foco e os pontos de foco dessa pessoa. Outras informações virão depois. | Alta | Implementado (pontos do banco; ver nota) |
| RF-17 | O usuário vê a lista de pessoas que segue, com nível e pontos. | Média | Implementado |

**Nota:** os pontos vêm do banco (`progress`) e são somados pela função `registrar_sessao` (migration `0002`). As tarefas do dia ainda ficam só no aparelho, em memória.
| RF-18 | O usuário sai da conta. | Alta | Implementado |

## Regras de pontos e níveis
- **Pontos:** 1 ponto de foco por minuto completo de sessão concluída. Sessões canceladas dão 0 pontos. Os pontos são acumulados, não são gastos.
- **Níveis:** o total de pontos necessário para chegar ao nível N é `30 × N × (N − 1)`.

| Nível | Pontos totais | Tempo focado acumulado |
| --- | --- | --- |
| 1 | 0 | 0 h |
| 2 | 60 | 1 h |
| 3 | 180 | 3 h |
| 4 | 360 | 6 h |
| 5 | 600 | 10 h |
| 6 | 900 | 15 h |
| 7 | 1.260 | 21 h |
| 8 | 1.680 | 28 h |
| 9 | 2.160 | 36 h |
| 10 | 2.700 | 45 h |

A diferença entre um nível e o próximo cresce 60 pontos a cada nível. O início é rápido para dar retorno cedo, e o avanço fica mais longo com o tempo. *Proposta, a validar com uso real.*

## Requisitos não funcionais
| ID | Descrição | Status |
| --- | --- | --- |
| RNF-01 | Publicar na Google Play e na App Store, usando Expo com development build (Expo Dev Client). | Definido |
| RNF-02 | Interface responsiva em telas de celular, com boa performance. | Definido |
| RNF-03 | Dados de conta e respostas do perfil devem ser protegidos e tratados com privacidade. Regras específicas a definir. | Pendente |
| RNF-04 | O timer da sessão deve funcionar sem conexão com a internet. As sessões são salvas quando houver conexão. | Rascunho |
| RNF-05 | Os dados ficam no Supabase (banco de dados na nuvem), e a autenticação usa o Supabase Auth. | Definido |

## Perguntas em aberto
- **Seguidores:** quem é seguido pode ver quem o segue? Pode bloquear ou remover um seguidor?
- **Perfil privado:** haverá a opção de exigir aprovação para seguir?
- **Foque (assistente):** as perguntas e as sugestões seguem um roteiro fixo ou são geradas por IA?
- **Tarefas:** o usuário pode editar ou excluir tarefas? Há tarefas recorrentes?
- **Histórico:** o app precisa mostrar sessões concluídas e canceladas?

## Backlog futuro
- **Onda (streak):** dias seguidos focando. Fica para depois do MVP.
