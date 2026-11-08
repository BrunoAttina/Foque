# Registro de decisões

Formato: data, decisão, motivo. Decisões em aberto ficam na seção final.

## Decisões tomadas
| Data | Decisão | Motivo |
| --- | --- | --- |
| 2026-11-07 | Usar Expo development build (`expo-dev-client`) em vez do Expo Go. | Permite módulos nativos fora do Expo Go. |
| 2026-11-07 | Documentação do projeto em `Documentacao/`. | Centralizar o planejamento em arquivos Markdown. |
| 2026-11-07 | Ao sair do app, o timer é encerrado. O app não bloqueia outros aplicativos. | Evita recursos nativos complexos de bloqueio e a permissão especial exigida no iOS. A regra é simples de entender. |
| 2026-11-07 | O assistente se chama Foque, igual ao nome do app. | Simplifica a marca e a comunicação. |
| 2026-11-07 | Recompensa por gamificação, com "Pontos de foco" e "Nível de foco". | Dá progressão visível sem depender de recompensas externas. |
| 2026-11-07 | 1 ponto de foco por minuto completo de sessão concluída. Sessões canceladas dão 0. | Regra simples e previsível para o usuário. |
| 2026-11-07 | Progressão de níveis: pontos totais para o nível N = `30 × N × (N − 1)`. | Início rápido e avanço mais longo com o tempo. Ver [requisitos.md](requisitos.md). |
| 2026-11-07 | Autenticação com Supabase Auth, com e-mail e login social (Google e Apple). | Serviço integrado ao banco de dados. A Apple exige o "Sign in with Apple" quando o app oferece outro login social. |
| 2026-11-07 | Banco de dados no Supabase. | Solução de backend e banco de dados na nuvem, escolhida pelo projeto. |
| 2026-11-07 | Foque com roteiro fixo de perguntas e sugestões no MVP. | Gratuito, previsível e funciona offline. A geração por IA fica para depois. |
| 2026-11-07 | Publicar em Android e iOS. Desenvolver e testar primeiro no Android. | Não há Mac nem iPhone disponíveis agora. O iOS será testado quando houver um iPhone. |
| 2026-11-07 | Onda (streak) fica registrada como ideia futura. | Fora do MVP, para desenvolver depois. |
| 2026-11-07 | Mecânica validada no Dev Client (Android): sair do app cancela a sessão e não dá pontos. | Tela de teste em `App.tsx` confirmou que o `AppState` detecta a saída e cancela o timer. |
| 2026-11-07 | Adotar Expo Router para a navegação. | Pedido pelo `AGENTS.md`. Melhor fazer a migração antes das telas de login e cadastro. |
| 2026-11-07 | Estado com Zustand. | Simples e combina com persistência local. Escolha delegada ao assistente de desenvolvimento. |
| 2026-11-07 | Fila offline com `expo-sqlite`. | Armazenamento confiável para sessões que precisam ser enviadas depois. |
| 2026-11-07 | Pontos e níveis calculados no servidor, por funções do Supabase. | Impede alteração de pontos pelo celular. As funções serão criadas junto com o desenvolvimento. |
| 2026-11-07 | Aceitar o risco do relógio do celular no MVP. | Não há solução simples e a chance de abuso é baixa nesta fase. |

## Decisões em aberto
- **Geração do roteiro por IA:** avaliar depois do MVP, considerando custo por uso, internet e privacidade.
- **Conta Apple Developer:** a publicação na App Store exige uma conta paga, com custo anual. Confirmar quando contratar.
- **Biblioteca de estilização**, se necessária.
- **Envio da fila offline:** como tratar erros, tentativas e duplicidade ao enviar sessões.
