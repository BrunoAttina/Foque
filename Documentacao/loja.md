# Loja e moedas

A pessoa ganha **moedas** focando e troca por aparências do Foque na **Loja**. A Loja fica no menu inferior, no lugar onde ficava o Perfil. O Perfil continua acessível pelo @ e pela foto no cabeçalho.

**Status:** primeira versão implementada. Migration `0005_loja_e_moedas.sql` aplicada.

## Como funciona
- **Ganhar:** cada ponto de foco ganho vale 1 moeda. Como 1 minuto de sessão concluída dá 1 ponto, 1 minuto focado dá 1 moeda.
- **Pontos e moedas são coisas diferentes:** os pontos só acumulam e definem o nível de foco. As moedas são gastas na loja. Gastar moedas não tira pontos nem baixa o nível.
- **Saldo inicial:** quem já tinha pontos quando a loja entrou começou com o mesmo número de moedas.
- **Comprar:** na Loja, cada aparência tem um preço. O app pede confirmação, desconta as moedas e já coloca a aparência em uso. A compra é para sempre.
- **Usar:** a aba **Foque** continua sendo o lugar de escolher a aparência, entre as que a pessoa já tem. As que faltam aparecem com cadeado, e tocar nelas abre a Loja.
- **Clássico:** é de graça e já vem liberado.
- **Sem internet:** as aparências compradas continuam valendo (a lista fica salva no aparelho). Comprar exige conexão.

## Preços (primeira proposta)
| Aparência | Preço | Tempo focado |
| --- | --- | --- |
| Clássico | grátis | – |
| Bebê | 30 moedas | 30 min |
| Careca | 60 moedas | 1 h |
| Ninja | 100 moedas | 1 h 40 min |
| Princesa | 100 moedas | 1 h 40 min |

Os preços ficam no banco (tabela `loja_itens`). Para mudar, basta um `update` no SQL Editor, sem nova versão do app:
```sql
update public.loja_itens set preco = 150 where id = 'ninja';
```

## Telas
- **Loja (`loja.tsx`, aba do menu inferior):** saldo de moedas, fala do Foque e a lista de aparências. Cada item mostra a prévia, o nome, a descrição e:
  - o botão com o preço, se dá para comprar;
  - o botão desativado e "Faltam N moedas", se o saldo não alcança;
  - "Usar", se já foi comprado;
  - "Em uso", se é a aparência atual.
  No fim, o cartão "Em breve" anuncia os acessórios.
- **Foque (`foca.tsx`):** mesma tela de antes. As aparências não compradas ganham cadeado e levam à Loja.
- **Resultado:** ao concluir uma sessão, mostra os pontos e as moedas ganhos.
- **Menu inferior:** Amigos, Focos, Focar, Foque e Loja. O Perfil saiu do menu e abre pelo cabeçalho.

## Dados (migration `0005`)
| Tabela | Campos | Quem acessa (RLS) |
| --- | --- | --- |
| `carteiras` | `user_id`, `moedas` (≥ 0) | Só o dono lê. Só as funções alteram. |
| `loja_itens` | `id`, `tipo` (`aparencia` ou `acessorio`), `preco`, `ordem`, `ativo` | Qualquer usuário logado lê. Ninguém altera pelo app. |
| `compras` | `user_id`, `item_id`, `preco_pago`, `comprado_em` | Só o dono lê. Só a função `comprar_item` escreve. |

As moedas ficam em uma tabela separada de `progress` porque os seguidores leem `progress` (nível e pontos), e o saldo é particular.

**Funções:**
| Função | O que faz |
| --- | --- |
| `comprar_item(p_item_id)` | Confere o item, se já foi comprado e o saldo; desconta e registra a compra em uma só transação. Devolve o saldo. Erros: `22023` item inválido, `23505` já comprado, `P0001` moedas insuficientes. |
| `registrar_sessao(...)` | Além dos pontos, soma as mesmas moedas na carteira (cria a carteira se não existir). |

O saldo e os preços são do servidor: o app não consegue se dar moedas nem mudar preço.

## No app
- `src/services/loja.ts`: lê saldo, itens e compras; chama `comprar_item`.
- `src/store/loja.ts`: saldo, itens e compras da conta, com cópia no aparelho. É recarregado junto com os pontos (`sincronizar`) e ao abrir a Loja.
- `src/domain/aparencias.ts`: `aparenciaLiberada(id, comprados)`. A Clássica sempre; as outras, só se compradas.
- `src/store/aparencia.ts`: `useAparenciaAtual()` só devolve uma aparência comprada; senão, a Clássica.
- O saldo mostrado soma as moedas das sessões concluídas que ainda estão na fila offline, como os pontos. Essas moedas só podem ser gastas depois que a fila é enviada.

## Futuro
- **Acessórios** na loja (chapéus, óculos etc.), com o tipo `acessorio` já previsto em `loja_itens`.
- **Melhorias da loja**, a definir depois de ver esta primeira versão: categorias, destaques, promoções, itens por tempo limitado.
- **Saldo no cabeçalho**, para ver as moedas em qualquer tela.
- **Itens exclusivos por nível** ou por conquistas.

## Em aberto
- **Preços:** os valores são uma primeira proposta. Ajustar com o uso real.
- **Quem já usava uma aparência paga** antes da loja volta para a Clássica até comprar.
- **Devolução:** não há como desfazer uma compra.
