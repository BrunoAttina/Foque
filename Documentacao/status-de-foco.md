# Status "Focando agora"

Quem me segue vê se eu estou focando agora, como um status do meu usuário: em que tarefa, há quanto tempo e quanto falta. A aba **Amigos** deixa de servir só para buscar e seguir e passa a mostrar quem está focando no momento. O objetivo é gerar interação de rede social.

**Status:** em desenvolvimento. Migration `0004_foco_ativo.sql` ainda a aplicar.

## Como funciona para quem usa
- Ao iniciar uma sessão de foco, o app publica o status "focando" da pessoa.
- Ao concluir, cancelar ou sair da conta, o status some.
- Quem segue a pessoa vê o status na aba Amigos e no perfil dela. Quem não segue não vê nada.
- O tempo focado e o tempo restante andam ao vivo na tela, segundo a segundo.
- Sem internet, a sessão funciona igual. Ela só não aparece para os amigos.

## Modelo de dados
Tabela `focos_ativos`, na migration `supabase/migrations/0004_foco_ativo.sql`. Uma linha por usuário.

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `user_id` | `uuid` | Chave primária. `references profiles(id) on delete cascade` |
| `tarefa` | `text not null` | 1 a 60 caracteres |
| `duracao_minutos` | `int not null` | 1 a 240 |
| `inicio` | `timestamptz not null` | Horário do servidor ao iniciar |
| `fim_previsto` | `timestamptz not null` | `inicio` + duração |
| `atualizado_em` | `timestamptz not null` | `default now()` |

**Linha expirada:** uma linha com `fim_previsto` no passado conta como encerrada. As consultas filtram `fim_previsto > now()`. A linha velha é sobrescrita no próximo foco.

### RLS
| Operação | Quem pode |
| --- | --- |
| SELECT | O próprio usuário e quem o segue (existe linha em `follows` com `follower_id = auth.uid()` e `following_id = user_id`). Mesma regra de `progress`. |
| INSERT, UPDATE, DELETE | Ninguém pelo app. Não há policy de escrita: só as funções abaixo escrevem. |

## Funções
| Função | Tipo | O que faz |
| --- | --- | --- |
| `iniciar_foco(p_tarefa text, p_duracao_minutos int)` | `security definer` | Valida a tarefa (1 a 60 caracteres) e a duração (1 a 240). Faz upsert da linha de `auth.uid()`, com `inicio = now()` do servidor e `fim_previsto = now()` + duração. |
| `encerrar_foco()` | `security definer` | Apaga a linha de `auth.uid()`. |
| `registrar_sessao(...)` (da `0002`) | `security definer` | Passa a apagar também a linha de `focos_ativos` do usuário ao registrar a sessão, como garantia extra. Só apaga quando o `inicio` da linha é anterior ou igual ao fim da sessão registrada: uma sessão antiga, enviada pela fila, não apaga o status de um foco novo. |

O `inicio` vem do relógio do servidor, não do celular.

## Fluxo
1. **Iniciar:** `src/store/sessao.ts` (`iniciar`) chama `publicarFocoAtivo(tarefa, duracaoMinutos)`, que chama `iniciar_foco`.
2. **Concluir ou cancelar:** `concluir` e `cancelar` chamam `encerrarFocoAtivo()`, que chama `encerrar_foco`.
3. **Sair da conta:** também chama `encerrarFocoAtivo()`.
4. **Registrar a sessão:** quando a fila envia a sessão, `registrar_sessao` apaga a linha de novo, por garantia.
5. **Expiração:** se nada disso chegar ao servidor, a linha deixa de aparecer quando passa do `fim_previsto`.

Tudo roda em segundo plano. `publicarFocoAtivo` e `encerrarFocoAtivo` nunca lançam erro: uma falha não atrapalha a sessão.

### Leitura
- `listarFocandoAgora()`: pessoas que eu sigo e que estão focando (`fim_previsto` no futuro), sem incluir eu mesmo, ordenadas por quem termina primeiro.
- `buscarFocoAtivo(userId)`: foco de uma pessoa, ou `null` se ela não está focando ou se eu não a sigo (o RLS esconde).
- As duas lançam `ErroFocoAtivo` se falharem.
- O tempo decorrido e o restante são calculados no aparelho de quem vê, a partir de `inicio` e `fimPrevisto`, e atualizados a cada segundo.
- A lista é recarregada ao abrir a aba Amigos e a cada 30 s enquanto ela está aberta. Supabase Realtime fica para depois.

## Telas
### Aba Amigos (`src/app/(app)/(tabs)/amigos.tsx`)
- Nova seção no topo: **"Focando agora"**, com quem eu sigo que está focando.
- Cada linha mostra:
  - avatar e @;
  - a tarefa;
  - o tempo restante ao vivo, por exemplo "faltam 12:34";
  - uma barra de progresso.
- Tocar na linha abre o perfil da pessoa.
- Sem ninguém focando: a mensagem "Ninguém focando agora. Que tal dar o exemplo? 🧊".
- Na lista "Seguindo", quem está focando ganha um selo **"focando"**.
- A busca pelo @ continua na aba.

### Perfil de outro usuário (`src/app/(app)/usuario/[username].tsx`)
Se a pessoa está focando e eu a sigo, aparece o cartão **"Focando agora"** com:
- a tarefa;
- o tempo focado até agora;
- o tempo restante;
- uma barra de progresso.

Quem não segue a pessoa não vê o cartão. O RLS esconde a linha.

## Casos especiais
| Caso | O que acontece |
| --- | --- |
| Sem internet ao iniciar | A sessão roda normalmente. O status não é publicado, e os amigos não veem. |
| Sem internet ao concluir ou cancelar | O status não é apagado na hora. Os amigos continuam vendo a pessoa como "focando" até o `fim_previsto`, ou até a fila enviar a sessão (`registrar_sessao` apaga a linha). |
| App fechado à força | Mesmo caso: a linha fica até o `fim_previsto` e depois deixa de contar. |
| Tela bloqueada | Não cancela a sessão (RF-07). O status continua visível. |
| Deixar de seguir | A partir da próxima recarga, a pessoa some da seção "Focando agora" e o cartão some do perfil. O RLS deixa de liberar a linha. |
| Novo foco com linha velha | O upsert de `iniciar_foco` sobrescreve a linha. |

## Arquivos
| Arquivo | Papel |
| --- | --- |
| `supabase/migrations/0004_foco_ativo.sql` | Tabela `focos_ativos`, RLS, `iniciar_foco`, `encerrar_foco` e a mudança em `registrar_sessao`. A aplicar no SQL Editor. |
| `src/services/focoAtivo.ts` | Contrato entre front e back: tipos `FocoAtivo` e `ErroFocoAtivo`; funções `publicarFocoAtivo`, `encerrarFocoAtivo`, `listarFocandoAgora` e `buscarFocoAtivo`. |
| `src/store/sessao.ts` | Publica ao iniciar; encerra ao concluir e ao cancelar. |
| `src/services/auth.ts` (`sair`) | Encerra o status antes de sair da conta. |
| `src/app/(app)/(tabs)/amigos.tsx` | Seção "Focando agora" e selo "focando" na lista "Seguindo". |
| `src/app/(app)/usuario/[username].tsx` | Cartão "Focando agora" no perfil. |

## Futuro
- **Privacidade:** opção de esconder o status ou só o nome da tarefa. Hoje o nome da tarefa fica visível para os seguidores. Decisão em aberto.
- **Incentivo:** reagir ou mandar um "🐟" para quem está focando.
- **Notificação:** avisar quando um amigo começa a focar.
- **Tempo real:** trocar a recarga a cada 30 s pelo Supabase Realtime.
