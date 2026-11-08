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

| Tabela | Campos principais |
| --- | --- |
| `profiles` | id do usuário, profissão, respostas do roteiro |
| `tasks` | id, user_id, nome, duração |
| `focus_sessions` | id, user_id, task_id, início, fim, status, pontos |
| `progress` | user_id, pontos totais |

Regras de acesso: a chave pública do Supabase fica no app, e cada tabela tem RLS para que a pessoa só leia e escreva os próprios dados. A chave de serviço nunca vai para o app.

**Limite conhecido:** o horário da sessão vem do relógio do celular. Para o MVP, isso é aceitável. Uma pessoa que altere a hora do aparelho poderia ganhar pontos extras.

**Pendente:** como a fila é enviada e tratada em caso de erro (tentativas, duplicidade); as funções de pontos no Supabase, que serão criadas junto com o usuário.

## Comandos úteis
- `npx expo start`: servidor de desenvolvimento
- `npx expo run:android` / `npx expo run:ios`: build de desenvolvimento
- `npx expo install <pacote>`: instalar dependências compatíveis com o SDK
- `npx tsc --noEmit`: checagem de tipos
- `npx expo-doctor`: diagnóstico de configuração
