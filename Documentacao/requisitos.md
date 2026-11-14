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
| RF-07 | Se o usuário sair do Foque durante a sessão (home, trocar de app, fechar), o timer é encerrado e a sessão fica como cancelada. **Bloquear a tela não cancela:** o timer continua. Se a pessoa desbloquear e for usar outro app antes de voltar ao Foque, a sessão é cancelada. | Alta | Android implementado; iOS pendente |
| RF-08 | Ao cancelar, o app informa o usuário de que não houve pontos de foco. | Alta | Rascunho |
| RF-09 | Ao concluir a sessão sem sair do app, o usuário ganha 1 ponto de foco por minuto completo. | Alta | Rascunho |
| RF-10 | O app mostra o nível de foco e os pontos de foco acumulados. | Alta | Rascunho |
| RF-11 | Quando os pontos acumulados atingem o necessário, o usuário sobe de nível de foco. | Alta | Rascunho |
| RF-12 | O @ é único, com 3 a 20 caracteres: letras minúsculas, números, "_" e ".". O app avisa se já estiver em uso. | Alta | Implementado |
| RF-13 | Quem entra sem @ (ex.: login social) escolhe um antes de usar o app. | Alta | Implementado |
| RF-14 | O usuário busca outras pessoas pelo começo do @ (aba Amigos) e pode segui-las direto no resultado. | Alta | Implementado |
| RF-15 | O usuário segue outra pessoa, sem precisar de aprovação, e pode deixar de seguir. | Alta | Implementado |
| RF-16 | Quem segue alguém vê o nível de foco e os pontos de foco dessa pessoa. Outras informações virão depois. | Alta | Implementado (pontos do banco; ver nota) |
| RF-17 | O usuário vê a lista de pessoas que segue, com nível e pontos. | Média | Implementado |
| RF-18 | O usuário sai da conta. | Alta | Implementado |
| RF-19 | O usuário escolhe a aparência do Foque na aba Foque. A escolha vale em todas as telas e fica salva. A padrão é a Clássica. | Média | Implementado (salva no aparelho) |
| RF-20 | O usuário personaliza o Foque com acessórios, cores e outros itens, além da aparência. | Baixa | Futuro |
| RF-21 | Ao iniciar uma sessão, o app publica o status "focando agora" com a tarefa, o início e o fim previsto. Ao concluir, cancelar ou sair da conta, o status é removido. Sem internet, a sessão funciona igual e só não aparece para os amigos. Ver [status-de-foco.md](status-de-foco.md). | Alta | Implementado |
| RF-22 | Só o próprio usuário e quem o segue veem o status "focando agora". | Alta | Implementado |
| RF-23 | A aba Amigos mostra no topo a seção "Focando agora", com quem você segue que está focando: avatar, @, tarefa, tempo restante ao vivo e barra de progresso. Tocar abre o perfil. Sem ninguém focando, o Foque mostra uma mensagem curta. | Alta | Implementado |
| RF-24 | Na lista "Seguindo", quem está focando ganha o selo "focando". | Média | Implementado |
| RF-25 | No perfil de quem você segue, se a pessoa está focando, aparece o cartão "Focando agora" com a tarefa, o tempo focado, o tempo restante e a barra de progresso. | Alta | Implementado |
| RF-26 | Cada ponto de foco ganho dá 1 moeda. Os pontos só acumulam e definem o nível; as moedas são gastas na loja. Ver [loja.md](loja.md). | Alta | Implementado |
| RF-27 | A aba Loja, no menu inferior, mostra o saldo de moedas e as aparências à venda. O usuário compra com moedas, com confirmação. O Clássico é grátis. | Alta | Implementado (primeira versão) |
| RF-28 | Só as aparências compradas podem ser usadas. Na aba Foque, as outras aparecem com cadeado e levam à Loja. | Alta | Implementado |
| RF-29 | O Perfil abre pelo @ e pela foto do cabeçalho, não mais pelo menu inferior. | Média | Implementado |
| RF-30 | A loja vende acessórios para o Foque. | Baixa | Futuro |
| RF-31 | A aparência do Foque em uso é a foto de perfil do usuário: aparece no cabeçalho, no Perfil, nas listas da aba Amigos, no "Focando agora" e no perfil de outros usuários. | Alta | Implementado |
| RF-32 | O Perfil mostra quantas pessoas o usuário segue e quantas o seguem. Tocar em um dos números abre a aba Amigos com a lista correspondente aberta. | Alta | Implementado |
| RF-33 | A aba Amigos tem as listas "Seguindo" e "Seguidores", recolhidas por padrão, com a quantidade e a indicação de que abrem. Em Seguidores, quem o usuário ainda não segue tem o botão "Seguir". | Alta | Implementado |
| RF-34 | O nível de foco de cada pessoa aparece em toda a aba Amigos (Focando agora, busca, Seguindo e Seguidores) e no perfil dela, mesmo sem segui-la. Os pontos continuam visíveis só para quem segue. | Alta | Implementado |
| RF-35 | Um foco só pode ter 15, 30, 45 ou 60 minutos, no cadastro e na tela Focar. | Alta | Implementado |
| RF-36 | Ao cadastrar um foco, o usuário escolhe se ele é apagado ao ser concluído (uma vez) ou se repete todo dia. O foco diário fica marcado como "feito hoje" e volta no dia seguinte. Ver [focos.md](focos.md). | Alta | Implementado |

**Nota:** os pontos vêm do banco (`progress`) e são somados pela função `registrar_sessao` (migration `0002`). As tarefas ficam no banco (`tasks`, migration `0003`), com cópia no aparelho.

## Regras de pontos e níveis
- **Pontos:** 1 ponto de foco por minuto completo de sessão concluída. Sessões canceladas dão 0 pontos. Os pontos são acumulados, não são gastos.
- **Níveis:** o total de pontos necessário para chegar ao nível N é `15 × N × (N − 1)`.

| Nível | Pontos totais | Tempo focado acumulado |
| --- | --- | --- |
| 1 | 0 | 0 h |
| 2 | 30 | 30 min |
| 3 | 90 | 1 h 30 min |
| 4 | 180 | 3 h |
| 5 | 300 | 5 h |
| 6 | 450 | 7 h 30 min |
| 7 | 630 | 10 h 30 min |
| 8 | 840 | 14 h |
| 9 | 1.080 | 18 h |
| 10 | 1.350 | 22 h 30 min |

A diferença entre um nível e o próximo cresce 30 pontos a cada nível (30, 60, 90, 120…). O início é rápido para dar retorno cedo, e o avanço fica mais longo com o tempo. *Proposta, a validar com uso real.*

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
