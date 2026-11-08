# Arquitetura

## Stack
| Item | Versão / Detalhe |
| --- | --- |
| Expo SDK | `expo ~58.0.23` |
| React | `19.3.0` |
| React Native | `0.88.1` |
| Linguagem | TypeScript `~6.0.3` |
| Navegação | Expo Router (a adotar, ver [decisoes.md](decisoes.md)) |
| Estado | Zustand (a instalar) |
| Armazenamento local | `expo-sqlite` (a instalar), para a fila de sessões offline |
| Backend | Supabase: Auth, banco Postgres e funções no servidor |
| Build nativo | Development build com `expo-dev-client` (não funciona no Expo Go) |
| Native gerado | `android/` e `ios/` são gerados (Continuous Native Generation) e não são versionados |

## Visão geral

```
Celular (app Expo)
 ├─ Telas (Expo Router)
 ├─ Regras de negócio (pontos e níveis, funções puras)
 ├─ Sessão ativa (Zustand: timer e estado)
 └─ Fila local de sessões (expo-sqlite, para funcionar offline)
        │  quando houver internet
        ▼
Supabase
 ├─ Auth (e-mail, Google, Apple)
 ├─ Banco Postgres (perfil, tarefas, sessões, progresso)
 ├─ Funções no servidor (calculam os pontos)
 └─ RLS: cada pessoa só acessa os próprios dados
```

## Camadas do app
- **Telas (`src/app/`):** rotas do Expo Router. Montam a interface e chamam as outras camadas. Não contêm regra de negócio.
- **Domínio (`src/domain/`):** regras puras, sem React e sem banco. Ex.: cálculo de pontos e de nível, mensagens. Fáceis de testar.
- **Dados (`src/services/`):** cliente do Supabase, fila offline com `expo-sqlite` e funções de acesso a tarefas, sessões e progresso.
- **Estado (`src/store/`):** sessão ativa e timer, com Zustand. Guarda o horário final da sessão, não só o contador, para o timer continuar correto se o app for fechado.
- **Componentes (`src/components/`):** elementos visuais reutilizáveis.

Estrutura prevista:
```
foque/
├── src/
│   ├── app/          # rotas (Expo Router)
│   ├── components/   # componentes visuais
│   ├── domain/       # regras puras: pontos, níveis
│   ├── services/     # Supabase, fila offline (expo-sqlite)
│   └── store/        # estado da sessão (Zustand)
├── assets/           # ícones e splash
├── Documentacao/     # esta documentação
└── app.json          # configuração Expo
```

A migração para o Expo Router já foi feita: o entry point é `expo-router/entry`, e `App.tsx` e `index.ts` foram removidos. Já existem `src/app/`, `src/domain/` e `src/store/`. As pastas `src/services/` e `src/components/` serão criadas quando forem necessárias.

## Fluxo de uma sessão
1. A pessoa inicia a sessão. O app guarda o horário de início e o horário final previsto.
2. Se ela sair do app, a sessão é cancelada e registrada com 0 pontos.
3. Se o tempo terminar sem interrupção, a sessão é concluída e gravada na fila local.
4. Quando houver conexão, a fila é enviada ao Supabase.
5. Uma função no servidor valida a sessão, calcula os pontos (1 por minuto completo) e atualiza o progresso.
6. O nível é derivado do total de pontos pela fórmula `30 × N × (N − 1)`, ver [requisitos.md](requisitos.md).

## Dados e estado
**Banco:** Supabase, com as tabelas previstas:

| Tabela | Campos principais | Quem acessa (RLS) | Status |
| --- | --- | --- | --- |
| `profiles` | id do usuário, `username` (@) único | Qualquer usuário logado lê; cada um altera só o próprio @ | Criada (`0001`) |
| `follows` | `follower_id`, `following_id` | Cada um vê as relações em que participa; segue e deixa de seguir em nome próprio | Criada (`0001`) |
| `progress` | user_id, `pontos_totais` | O próprio usuário e quem o segue leem; só funções do servidor alteram | Criada (`0001`) |
| `tasks` | id, user_id (automático), nome, duração | Só o dono lê e altera | Criada (`0003`) |
| `focus_sessions` | id (gerado no aparelho), user_id, tarefa, duração, início, fim, status, pontos | Só o dono lê; só a função `registrar_sessao` escreve | Criada (`0002`) |

As respostas do roteiro (profissão e rotina) entram em `profiles` ou numa tabela própria quando a tela de perguntas for feita.

Ao criar um usuário no Auth, um trigger (`criar_perfil_novo_usuario`) cria o perfil com o @ informado no cadastro e o progresso zerado. A função `username_disponivel` verifica se um @ está livre e pode ser chamada antes do login.

Regras de acesso: a chave pública do Supabase fica no app, e cada tabela tem RLS. A chave de serviço nunca vai para o app.

**Migrations:** os arquivos em `supabase/migrations/` são aplicados em ordem, colando no SQL Editor do Supabase.

**Limite conhecido:** o horário da sessão vem do relógio do celular. Para o MVP, isso é aceitável. Uma pessoa que altere a hora do aparelho poderia ganhar pontos extras.

**Pendente:** como a fila é enviada e tratada em caso de erro (tentativas, duplicidade); as funções de pontos no Supabase, que serão criadas junto com o usuário.

## Configuração do Supabase
- Cliente em `src/services/supabase.ts`, conforme o guia do Expo. A sessão de login fica no aparelho, via `expo-sqlite/localStorage`.
- Variáveis em `.env.local` (fora do git): `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. O modelo fica em `.env.example`.
- Só a **publishable key** vai para o app. A secret key e a `service_role` nunca entram no código.

## Sessões, fila offline e pontos
1. Ao terminar (concluída ou cancelada), a sessão vai para a tabela `fila_sessoes` do SQLite do aparelho (`src/services/filaSessoes.ts`), com um UUID gerado no aparelho.
2. O app chama `registrar_sessao` no Supabase. Com sucesso, a sessão sai da fila. Sem conexão, ela fica e é reenviada ao entrar no app ou ao voltar para ele.
3. A função valida a sessão, calcula os pontos (1 por minuto completo, só se concluída) e soma em `progress`. Reenviar o mesmo UUID não soma de novo.
4. Os pontos mostrados no app são os do servidor mais os das sessões concluídas ainda na fila (`src/services/sincronizacao.ts`).

Validações no servidor: duração de 1 a 240 min; fim não pode estar no futuro (5 min de tolerância); início de no máximo 48 h atrás; sessão concluída precisa durar pelo menos a duração da tarefa (5 s de tolerância) e não pode se sobrepor a outra sessão concluída. Sessões rejeitadas por dado inválido são descartadas da fila.

## Tarefas
- `src/store/tarefas.ts` busca as tarefas no Supabase ao entrar no app e guarda uma cópia no aparelho (Zustand `persist` sobre o `localStorage` do `expo-sqlite`). A cópia guarda o id do dono, para não aparecer em outra conta.
- Sem conexão, a lista salva continua disponível para focar. Criar e remover tarefas exige conexão, e o app avisa quando falha.

## Autenticação no app
- `src/store/auth.ts` ouve as mudanças de login do Supabase e guarda a sessão e o perfil (@).
- `src/app/_layout.tsx` usa `Stack.Protected` para mostrar entrar/cadastro (sem login), escolher-nome (logado sem @) ou o grupo `(app)` (logado com @).
- `src/services/auth.ts` concentra as chamadas ao Supabase Auth e traduz os erros para mensagens em português.

## Comandos úteis
- `npx expo start`: servidor de desenvolvimento
- `npx expo run:android` / `npx expo run:ios`: build de desenvolvimento
- `npx expo install <pacote>`: instalar dependências compatíveis com o SDK
- `npx tsc --noEmit`: checagem de tipos
- `npx expo-doctor`: diagnóstico de configuração
