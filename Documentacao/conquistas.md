# Conquistas de Foco

> **Status:** implementado. Migration `0010_conquistas.sql` aplicada.
> Nomes, metas e níveis ficam em tabelas do banco e podem ser ajustados com um `update` no SQL Editor.

A pessoa ganha **conquistas** ao focar. Elas aparecem no Perfil dela e no perfil que os outros veem. Há dois tipos:

- **Conquistas Fixas:** as mesmas para todo mundo, definidas pelo jogo. Ex.: "Foca Iniciante" ao chegar a 50 pontos.
- **Conquistas Personalizadas:** nascem dos focos que a própria pessoa cria. Ex.: quem tem o foco "Ler livros" ganha "Bom em ler livros" ao concluir 25 focos de leitura.

As duas saem do **histórico de focos** (tabela `focus_sessions`): só conta o que está registrado lá como concluído.

---

## 1. Conquistas Fixas

Cada uma tem um nome, uma descrição e uma meta. **Toda conquista dá 10 moedas**, pagas uma vez, quando é obtida.

### Pontos de foco
| Conquista | Como ganhar |
| --- | --- |
| Foca Iniciante | Chegar a 50 pontos de foco |
| Foca Experiente | Chegar a 150 pontos |
| Foca Veterana | Chegar a 500 pontos |
| Foca Lendária | Chegar a 1.000 pontos |

### Focos concluídos
| Conquista | Como ganhar |
| --- | --- |
| Primeiro Mergulho | Concluir o primeiro foco |
| Pegando o Ritmo | Concluir 10 focos |
| Foca Dedicada | Concluir 50 focos |
| Centenário de Gelo | Concluir 100 focos |

### Variedade
| Conquista | Como ganhar |
| --- | --- |
| Foca Versátil | Concluir focos de 5 tarefas diferentes |

### Loja (gasto de moedas)
| Conquista | Como ganhar |
| --- | --- |
| Primeira Compra | Comprar o primeiro item na loja |
| Foca Gastadora | Gastar 100 moedas no total |
| Colecionadora | Ter todas as aparências do Foque |

**Fora por enquanto (decidido em 2026-11-19):**
- **Dias seguidos** (3, 7 e 30 dias) e **Hábito de Foca** (o mesmo foco diário 7 dias seguidos): precisam de um controle de dias seguidos que o app ainda não tem.
- **Tempo e duração** (foco de 60 min; 2 h e 4 h no mesmo dia), **horários** (Madrugadora, Coruja, Fim de Semana no Gelo) e **amigos** (seguir 3 pessoas, ter 5 seguidores): removidas.

As conquistas fixas ficam em uma tabela no banco (como os preços da loja). Mudar nome, meta ou moedas é um `update` no SQL Editor, sem nova versão do app.

---

## 2. Conquistas Personalizadas

### Como funciona
Cada foco que a pessoa conclui tem uma **contagem**: quantos focos daquela tarefa ela já concluiu. Ao atingir uma meta, ganha a conquista daquele nível e 10 moedas. No nível seguinte, a mesma conquista **sobe de nível**: muda de cor e de nome.

### Níveis
Exemplo com o foco **"Ler livros"**. O nome segue o modelo "{título} em {nome do foco}", em letras minúsculas, que funciona com qualquer nome de foco ("Bom em ler livros", "Bom em academia").

| Nível | Meta | Nome | Cor |
| --- | --- | --- | --- |
| 1 | 5 focos | Primeiros Mergulhos em ler livros | Gelo (branco-azulado) |
| 2 | 10 focos | Iniciante em ler livros | Bronze |
| 3 | 25 focos | Bom em ler livros | Prata |
| 4 | 50 focos | Focado em ler livros | Ouro |
| 5 | 100 focos | Mestre em ler livros | Diamante (azul-gelo) |
| 6 | 200 focos | Lenda em ler livros | Aurora (roxo) |
| 7 | 365 focos | Foca Suprema em ler livros | Arco-íris polar |

O nível 7 usa 365: um ano inteiro de um foco diário.

**Outros nomes, para trocar na tabela se preferir:**
- Para o começo: "Curioso em", "Estreante em", "Aprendiz em".
- Para o meio: "Dedicado em", "Craque em", "Fera em", "Especialista em".
- Para o topo: "Grão-mestre em", "Ícone de", "Referência em", "Foca Lendária de", "Rei/Rainha do gelo em".

A descrição de cada nível diz a contagem: "Concluiu 25 focos de ler livros". A pessoa vê uma conquista só por foco, a do nível mais alto, e o progresso até o próximo ("32 de 50").

### O que conta
- **1 foco concluído = 1 na contagem.** "Leu 10 livros" vira "concluiu 10 focos de ler livros": o app conta sessões, não livros.
- Só sessões **concluídas** e com **15 minutos ou mais**. Isso deixa de fora os testes antigos de 1 minuto.
- Os focos são agrupados pelo **nome**, sem diferenciar maiúsculas, acentos e espaços nas pontas: "Ler livros", "ler livros" e "Ler Livros " contam juntos.
  - Por isso a contagem continua mesmo se o foco for de uma vez (apagado ao concluir) e a pessoa criar outro com o mesmo nome.
  - Também vale para o que já está no histórico.
  - Trocar o nome do foco começa outra contagem.

---

## 3. Onde aparece

### Perfil (o seu)
- Seção **Conquistas** logo abaixo do cartão de nível, com o número obtido ("Conquistas (4)") e as 6 mais recentes em selos (ícone + cor) com o nome embaixo. Componente `ResumoConquistas`.
- Botão **"Ver todas"** abre a tela de conquistas.

### Tela Conquistas (`conquistas.tsx`)
- **Por foco** primeiro: um cartão por foco, com a cor do nível, o nome ("Bom em ler livros"), a contagem e a barra até o próximo nível. Do dono, aparecem também os focos que ainda não chegaram ao nível 1 (selo cinza, "1 de 5").
- **Fixas** em seguida, separadas por categoria. As obtidas aparecem coloridas, com a data. As que faltam aparecem em cinza com o progresso ("32 de 50 pontos").

### Perfil de outro usuário
- A mesma seção **Conquistas**, só com as obtidas, e "Ver todas" abre a tela de conquistas daquela pessoa (só leitura, sem as que faltam).
- **Qualquer usuário logado vê**, mesmo sem seguir a pessoa (decidido em 2026-11-19).

### Ao concluir um foco (tela de resultado)
- Se o foco liberou uma conquista ou subiu o nível de uma personalizada, aparece um destaque: **"Conquista desbloqueada: Bom em ler livros! +10 moedas"**.
- O app envia a sessão e busca as conquistas ainda não vistas algumas vezes (até 6 s), porque o envio corre em segundo plano. Depois de mostrar, marca como vistas e atualiza o saldo de moedas.
- Se a sessão foi concluída sem internet, a conquista é dada quando a sessão chegar ao servidor e aparece no destaque do próximo foco concluído; no Perfil ela já aparece.
- As conquistas retroativas (dadas pela migration) não viram destaque: já entram como vistas.

### Cores
As personalizadas usam a cor do nível (tabela acima); o nível 7 tem o selo em faixas coloridas. As fixas usam uma cor por categoria: pontos azul, focos verde, variedade roxo e loja coral. Componente `SeloConquista`. Tudo dentro da paleta do design ([design.md](design.md)).

---

## 4. Regras gerais
- **Quem calcula é o servidor.** O app não consegue se dar conquistas nem moedas.
- As conquistas são verificadas quando uma sessão é registrada e quando algo é comprado na loja.
- **Cada conquista é ganha uma vez** e não se perde: apagar um foco não tira as conquistas dele.
- **Toda conquista dá 10 moedas**, fixa ou personalizada, em qualquer nível (decidido em 2026-11-19). Não há progressão de moedas. As moedas entram na carteira na hora. Os **pontos de foco** não mudam (conquista não sobe nível).
- **Retroativo** (decidido em 2026-11-19): ao aplicar a migration, quem já tem histórico recebe as conquistas e as moedas correspondentes.

---

## 5. Dados (migration `0010`)

| Tabela | Campos | Quem acessa |
| --- | --- | --- |
| `conquistas` | `id`, `categoria`, `titulo`, `descricao`, `meta`, `icone`, `ordem`, `ativa` | Catálogo das fixas. Qualquer usuário logado lê; ninguém altera pelo app. |
| `conquistas_obtidas` | `user_id`, `conquista_id`, `obtida_em`, `moedas`, `vista` | Fixas obtidas. Qualquer usuário logado lê; só as funções escrevem. |
| `conquistas_foco` | `user_id`, `chave` (nome normalizado), `nome` (como a pessoa escreveu por último), `quantidade`, `nivel` (0 a 7), `nivel_em`, `atualizada_em`, `vista` | Personalizadas. Qualquer usuário logado lê as de nível 1 ou mais; o dono lê também as de nível 0 (progresso). Só as funções escrevem. |
| `niveis_conquista_foco` | `nivel`, `meta`, `titulo`, `cor` | Os 7 níveis das personalizadas. Mudar um nome ou uma meta é um `update`. |

Funções:
| Função | O que faz |
| --- | --- |
| `avaliar_conquistas(uid, ja_vistas)` | Interna (o app não chama). Confere todas as metas, registra o que foi ganho e paga 10 moedas por conquista, tudo na mesma transação. O valor fica na constante `c_moedas`. |
| Gatilhos `conquistas_ao_concluir_sessao` e `conquistas_ao_comprar` | Depois de inserir uma sessão concluída (`focus_sessions`) ou uma compra (`compras`), chamam `avaliar_conquistas`. `registrar_sessao` e `comprar_item` não mudaram. |
| `meu_progresso_conquistas()` | Valores do usuário logado (pontos, focos, tarefas diferentes, compras, moedas gastas, aparências) para o progresso das que faltam. |
| `chave_do_foco(nome)` | Nome normalizado de um foco (minúsculas, sem acentos e espaços sobrando). |
| `marcar_conquistas_vistas()` | O app chama depois de mostrar o destaque "Conquista desbloqueada". |

Ao aplicar a migration, a verificação roda uma vez para todos os usuários (retroativo).

---

## 6. No app
- `src/domain/conquistas.ts`: textos ("Bom em ler livros"), cores, níveis e progresso.
- `src/services/conquistas.ts`: lê o catálogo, os níveis, as conquistas de uma pessoa e as novas; marca como vistas.
- `src/components/SeloConquista.tsx`, `ResumoConquistas.tsx` (seção do Perfil) e `useConquistasNovas.ts` (destaque do resultado).
- `src/app/(app)/conquistas.tsx`: tela "Ver todas", com os parâmetros `id` e `username` da pessoa.

---

## 7. Decisões

### Tomadas (2026-11-19)
- Qualquer usuário logado vê as conquistas de qualquer pessoa.
- Toda conquista dá 10 moedas, sem progressão.
- Retroativo: conquistas e moedas para quem já tem histórico.
- A contagem das personalizadas é de focos concluídos ("concluiu 10 focos de ler livros").
- A palavra é sempre **"focos"**: a pessoa não escolhe como chamar a contagem nem a conquista.
- Sem conquistas de dias seguidos, tempo/duração, horários e amigos por enquanto.
- Níveis das personalizadas: Primeiros Mergulhos, Iniciante, Bom, Focado, Mestre, Lenda e Foca Suprema (5 a 365 focos).
