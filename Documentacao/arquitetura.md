# Arquitetura

## Stack atual
| Item | Versão / Detalhe |
| --- | --- |
| Expo SDK | `expo ~58.0.23` |
| React | `19.3.0` |
| React Native | `0.88.1` |
| Linguagem | TypeScript `~6.0.3` |
| Build nativo | Development build com `expo-dev-client` (não funciona no Expo Go) |
| Native gerado | `android/` e `ios/` são gerados (Continuous Native Generation) e não são versionados |

## Estrutura de pastas
Atual:
```
foque/
├── App.tsx          # tela inicial
├── index.ts         # registro do componente raiz
├── app.json         # configuração Expo
├── assets/          # ícones e splash
└── Documentacao/    # esta documentação
```

**[pendente]** Decidir a organização do código. O `AGENTS.md` pede Expo Router com rotas em `src/app/` e componentes, hooks e utilitários fora dela. Ainda não foi implementado.

## Dados e estado
**[pendente]** Onde os dados ficam (local, nuvem), como são persistidos e qual biblioteca de estado usar.

## Comandos úteis
- `npx expo start`: servidor de desenvolvimento
- `npx expo run:android` / `npx expo run:ios`: build de desenvolvimento
- `npx expo install <pacote>`: instalar dependências compatíveis com o SDK
- `npx tsc --noEmit`: checagem de tipos
- `npx expo-doctor`: diagnóstico de configuração
