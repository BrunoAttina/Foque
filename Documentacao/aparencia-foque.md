# Aparência do Foque

A pessoa escolhe como o Foque aparece no app. A escolha fica na aba **Foque** (ícone de pata, ao lado de Perfil), logo abaixo do mascote e das falas.

## Como funciona hoje
- A aba Foque mostra o mascote animado, o balão com dicas ("Outra dica") e a seção **Aparência do Foque**, com um cartão por aparência.
- Tocar num cartão troca a aparência na hora. O Foque comenta o visual novo no balão.
- A aparência escolhida vale em todas as telas: Focar, sessão, resultado e aba Foque. Nas telas de entrar e de cadastro, antes do login, aparece sempre a Clássica.
- **Padrão:** Clássico, que é de graça. As outras aparências são compradas com moedas na Loja (ver [loja.md](loja.md)). Na aba Foque, as não compradas aparecem com cadeado e levam à Loja.
- A escolha fica salva **no aparelho**, separada por conta. Em outro celular, a pessoa começa com a Clássica.

## Aparências
| Id | Nome | Descrição no app |
| --- | --- | --- |
| `padrao` | Clássico | O Foque de sempre. Exigente na medida. |
| `bebe` | Bebê | Fofo demais pra julgar alguém. Quase. |
| `careca` | Careca | De cachecol e pouca paciência. |
| `ninja` | Ninja | Some junto com as suas distrações. |
| `princesa` | Princesa | Coroa, pérolas e zero tolerância a TikTok. |

## Momentos (estados) e animações
Cada aparência tem uma animação para cada momento do app.

| Estado | Onde aparece | Clássico | Bebê | Careca | Ninja | Princesa |
| --- | --- | --- | --- | --- | --- | --- |
| `parada` | Focar, aba Foque, prévias | parada | parado | provocando | parada | parada |
| `acenando` | Entrar, cadastro, escolher @ | acenando | acenando | boas-vindas | reverência | acenando |
| `focando` | Sessão rodando | focando | focando | vigiando | meditando | encantando |
| `comemorando` | Sessão concluída | comemorando | comemorando | comemorando | comemorando | comemorando |
| `triste` | Gelo quebrado | triste | chorando | gelo quebrado | tonta | emburrada |

Animações que existem nas artes, mas ainda não são usadas: Clássico *descansando*; Bebê *dormindo*; Careca *dica* e *entediada*; Ninja *atacando* e *sumindo*; Princesa *beijinho* e *reverência*. Podem entrar em momentos novos, como pausa, dica ou subir de nível.

## Arquivos
- **Artes originais:** `C:\Projetos-2026\arte-foque\` (fora do repositório). As pastas `foca-*` são cópias idênticas das `foque-*`.
- **No app:** `assets/foque/<aparência>/<estado>.gif`. São GIFs de 400×400 com fundo transparente, renomeados para o estado.
- **Código:**
  - `src/domain/aparencias.ts`: catálogo, estados e aparência padrão.
  - `src/components/imagensFoque.ts`: mapa de aparência e estado para o GIF.
  - `src/components/Mascote.tsx`: exibe o GIF com `expo-image`, com as props `estado` e `aparencia`.
  - `src/store/aparencia.ts`: guarda a escolha por conta; `useAparenciaAtual()` devolve a da conta logada.

### Adicionar uma aparência nova
1. Coloque os 5 GIFs em `assets/foque/<id>/` (parada, acenando, focando, comemorando, triste).
2. Adicione o item em `APARENCIAS` (`src/domain/aparencias.ts`).
3. Adicione os `require` em `src/components/imagensFoque.ts`. O TypeScript avisa se faltar algum estado.

## Futuro: personalização
Além de escolher a aparência, a ideia é poder personalizar o Foque:
- **Acessórios:** chapéus, óculos, cachecóis e outros itens por cima da aparência.
- **Cores:** variações de cor da pelagem ou dos acessórios.
- **Novas aparências**, inclusive temáticas ou sazonais.
- **Loja:** as aparências já são vendidas por moedas; os acessórios entram na loja depois (ver [loja.md](loja.md)).
- **Itens exclusivos por nível de foco** (ideia): liberados ao subir de nível, sem gastar moedas.
- **Aparência na nuvem:** salvar a escolha no Supabase, por exemplo numa coluna em `profiles`, para valer em outros aparelhos e aparecer para os amigos na aba Amigos.

**Ponto técnico:** os acessórios por cima de um GIF precisam acompanhar a animação. Ou cada combinação vira uma arte própria, ou a foca passa a ser desenhada em camadas (Lottie/Rive ou Canvas, como no `FoqueMascote.kt` da pasta de artes). A decisão fica para quando a personalização começar.

**Tamanho do app:** os GIFs somam ~33 MB. Também existem versões em WebP animado (bordas transparentes mais suaves, mas ~43 MB no total). Para crescer o catálogo, avaliar comprimir as artes ou baixar as aparências sob demanda.
