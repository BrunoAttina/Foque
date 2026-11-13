# Telas e navegação

## Mapa de telas

### Sem login
| Tela | Objetivo | Status |
| --- | --- | --- |
| Entrar (`src/app/entrar.tsx`) | Login com e-mail e senha. O Foque recebe a pessoa com uma provocação. | Implementado |
| Cadastro (`src/app/cadastro.tsx`) | Criar conta com @, e-mail e senha. Avisa se o @ estiver em uso e se é preciso confirmar o e-mail. | Implementado |
| Escolher @ (`src/app/escolher-nome.tsx`) | Para quem está logado sem @. Bloqueia o app até escolher. | Implementado |

### Abas (`src/app/(app)/(tabs)/`)
Barra inferior com 5 abas, como no mockup (com "Amigos" no lugar de "Ranking"). O botão central, elevado, é a aba Focar.

| Aba | Objetivo | Status |
| --- | --- | --- |
| Amigos (`amigos.tsx`) | Encontrar amigos pelo @, com o botão Seguir em cada resultado (ou o selo "Seguindo"), e a lista de quem você já segue, com nível e pontos. | Implementado |
| Tarefas (`tarefas.tsx`) | Cadastrar, remover e focar direto em uma missão. | Implementado |
| **Focar** (`index.tsx`, aba inicial) | Tela principal: nível, fala do Foque, mascote, "tempo de mergulho" (15/25/45/60 min ou a duração da missão), missão atual, Regra do Gelo Fino e o botão "Congelar tempo & focar". | Implementado |
| Foque (`foca.tsx`) | Espaço do mascote: o Foque animado na aparência escolhida, balão com dicas do roteiro (botão "Outra dica") e, abaixo, a **escolha da aparência** (Clássico, Bebê, Careca, Ninja, Princesa) em cartões com prévia. Ao trocar, o Foque comenta o visual novo. Cartão "Em breve" para a personalização (acessórios, cores). | Implementado (escolha de aparência); personalização pendente |
| Perfil (`perfil.tsx`) | Seu @, título e cartão de nível, pontos, sessões concluídas, buscar pessoas e sair. | Implementado |

### Telas que abrem por cima das abas (`src/app/(app)/`)
| Tela | Objetivo | Status |
| --- | --- | --- |
| Sessão de foco (`sessao.tsx`) | Timer em um "bloco de gelo", barra de progresso e fala do Foque. Sair do app cancela; o botão voltar e "Desistir" encerram como desistência. | Implementado |
| Resultado (`resultado.tsx`) | "Gelo intacto!" com os pontos ganhos, ou "O gelo quebrou". Avisa quando sobe de nível. | Implementado |
| Perfil de usuário (`usuario/[username].tsx`) | @ e título; nível e pontos só se você segue a pessoa. Botão seguir ou deixar de seguir. | Implementado |
| Perguntas iniciais | O Foque coleta profissão e rotina do usuário. | Rascunho |

## Fluxo de navegação
1. Sem login: **Entrar** ↔ **Cadastro**.
2. Logado sem @: **Escolher @**.
3. Logado com @: abas, começando em **Focar**.
4. **Focar** (ou **Tarefas**) → **Sessão de foco** → **Resultado** → volta para a aba de origem.
5. **Amigos** → seguir direto na busca, ou tocar em alguém → **Perfil de usuário** (onde também dá para deixar de seguir).
6. **Perfil** → "Encontrar amigos" → aba **Amigos**.

O redirecionamento é feito no layout raiz (`src/app/_layout.tsx`) com `Stack.Protected`.

*Pendente: onde encaixar as perguntas iniciais no primeiro acesso.*

## Design
O visual segue o design system "Glacial Focus Game" ([design.md](design.md)). Os tokens (cores, fontes, espaçamentos, raios e sombras) ficam em `src/theme/index.ts`. Componentes base em `src/components/`:

| Componente | Uso |
| --- | --- |
| `Botao` | Botão "3D chunky": face colorida sobre base em relevo, que afunda ao tocar. Variantes primário, acento, secundário e perigo. |
| `Campo` | Campo de texto em "placa de gelo", com rótulo em caixa alta. |
| `Chip` | Pílula com ícone ou emoji (atalhos de missão). |
| `CabecalhoApp` | Cabeçalho das abas: "Nv.N" com a barra de progresso até o próximo nível ("1 pt / 30 pts"); o @ e o avatar são clicáveis e levam ao Perfil. |
| `CartaoNivel` | "Nível 4: Foca Ártica", com a barra até o próximo nível. |
| `BalaoFala` + `Mascote` | Fala do Foque com a ponta apontando para a foca. |
| `BarraProgresso` | Cápsula espessa, preenchimento menta. |
| `LinhaPessoa`, `Avatar` | Listas de pessoas e ranking. |

**Mascote:** GIF animado do Foque (`expo-image`) com um brilho pulsando por trás. `Mascote` recebe o `estado` (momento) e usa a aparência da conta. Ver [aparencia-foque.md](aparencia-foque.md).
