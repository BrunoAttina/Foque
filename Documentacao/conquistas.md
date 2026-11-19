# Conquistas de Foco

> **Status:** plano para revisão. Nada disto está no código ainda.
> Edite à vontade: nomes, metas, moedas e as decisões em aberto no fim do documento.

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

### Níveis (proposta, com mais nomes)
Exemplo com o foco **"Ler livros"**. O nome segue o modelo "{título} em {nome do foco}", em letras minúsculas, que funciona com qualquer nome de foco ("Bom em ler livros", "Bom em academia").

| Nível | Meta | Nome | Cor |
| --- | --- | --- | --- |
| 1 | 5 focos | Iniciante em ler livros | Gelo (branco-azulado) |
| 2 | 10 focos | Aprendiz em ler livros | Bronze |
| 3 | 25 focos | Bom em ler livros | Prata |
| 4 | 50 focos | Ótimo em ler livros | Ouro |
| 5 | 100 focos | Mestre em ler livros | Diamante (azul-gelo) |
| 6 | 200 focos | Lenda em ler livros | Aurora (roxo) |
| 7 | 365 focos | Foca Suprema em ler livros | Arco-íris polar |

O nível 7 usa 365: um ano inteiro de um foco diário.

**Outros nomes, para trocar na tabela se preferir:**
- Para o começo: "Curioso em", "Estreante em", "Dando os primeiros mergulhos em".
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
- Nova seção **Conquistas**, logo abaixo do cartão de nível, com o número obtido ("7 de 12") e as últimas conquistas em selos (ícone + cor).
- Botão **"Ver todas"** abre a tela de conquistas.

### Tela Conquistas (`conquistas.tsx`, nova)
- **Personalizadas** primeiro: um cartão por foco, com a cor do nível, o nome ("Bom em ler livros"), a contagem e a barra até o próximo nível.
- **Fixas** em seguida, separadas por categoria. As obtidas aparecem coloridas, com a data. As que faltam aparecem em cinza com o progresso ("32 de 50 pontos").

### Perfil de outro usuário
- A mesma seção **Conquistas**, só com as obtidas, e "Ver todas" abre a tela de conquistas daquela pessoa (só leitura, sem as que faltam).
- **Qualquer usuário logado vê**, mesmo sem seguir a pessoa (decidido em 2026-11-19).

### Ao concluir um foco (tela de resultado)
- Se o foco liberou uma conquista ou subiu o nível de uma personalizada, aparece um destaque: **"Conquista desbloqueada: Bom em ler livros! +10 moedas"**.
- Se a sessão foi concluída sem internet, o destaque aparece na próxima vez que o app enviar a sessão e abrir.

### Cores
As personalizadas usam a cor do nível (tabela acima). As fixas usam uma cor por categoria. Tudo dentro da paleta do design ([design.md](design.md)).

---

## 4. Regras gerais
- **Quem calcula é o servidor.** O app não consegue se dar conquistas nem moedas.
- As conquistas são verificadas quando uma sessão é registrada e quando algo é comprado na loja.
- **Cada conquista é ganha uma vez** e não se perde: apagar um foco não tira as conquistas dele.
- **Toda conquista dá 10 moedas**, fixa ou personalizada, em qualquer nível (decidido em 2026-11-19). Não há progressão de moedas. As moedas entram na carteira na hora. Os **pontos de foco** não mudam (conquista não sobe nível).
- **Retroativo** (decidido em 2026-11-19): ao aplicar a migration, quem já tem histórico recebe as conquistas e as moedas correspondentes.

---

## 5. Dados (migration `0010`, proposta)

| Tabela | Campos | Quem acessa |
| --- | --- | --- |
| `conquistas` | `id`, `categoria`, `titulo`, `descricao`, `meta`, `icone`, `ordem`, `ativa` | Catálogo das fixas. Qualquer usuário logado lê; ninguém altera pelo app. |
| `conquistas_obtidas` | `user_id`, `conquista_id`, `obtida_em`, `moedas`, `vista` | Fixas obtidas. Qualquer usuário logado lê; só as funções escrevem. |
| `conquistas_foco` | `user_id`, `chave` (nome normalizado), `nome` (como a pessoa escreveu por último), `quantidade`, `nivel` (0 a 7), `atualizada_em`, `vista` | Personalizadas. Qualquer usuário logado lê; só as funções escrevem. |
| `niveis_conquista_foco` | `nivel`, `meta`, `titulo`, `cor` | Os 7 níveis das personalizadas. Mudar um nome ou uma meta é um `update`. |

Funções:
| Função | O que faz |
| --- | --- |
| `avaliar_conquistas(uid)` | Interna (o app não chama). Confere todas as metas, registra o que foi ganho e paga 10 moedas por conquista, tudo na mesma transação. O valor fica em uma constante da migration. |
| `registrar_sessao(...)` | Igual a hoje; no fim, chama `avaliar_conquistas`. |
| `comprar_item(...)` | Igual a hoje; no fim, chama `avaliar_conquistas`. |
| `marcar_conquistas_vistas()` | O app chama depois de mostrar o destaque "Conquista desbloqueada". |

Ao aplicar a migration, a verificação roda uma vez para todos os usuários (retroativo).

---

## 6. Etapas de implementação
1. **Banco:** migration `0010` com o catálogo das fixas, os níveis das personalizadas, as tabelas, as funções e a verificação retroativa. Você roda no SQL Editor.
2. **App, leitura:** serviço e store de conquistas; seção no Perfil, tela Conquistas e seção no perfil de outros usuários.
3. **App, resultado:** destaque "Conquista desbloqueada".
4. **Teste** com as duas contas de teste (@teste e @blambaa): conquistas retroativas, uma conquista nova ao concluir um foco, e a visão de outro usuário.
5. **Documentação** atualizada com o que foi feito.

---

## 7. Decisões

### Tomadas (2026-11-19)
- Qualquer usuário logado vê as conquistas de qualquer pessoa.
- Toda conquista dá 10 moedas, sem progressão.
- Retroativo: conquistas e moedas para quem já tem histórico.
- A contagem das personalizadas é de focos concluídos ("concluiu 10 focos de ler livros").
- A palavra é sempre **"focos"**: a pessoa não escolhe como chamar a contagem nem a conquista.
- Sem conquistas de dias seguidos, tempo/duração, horários e amigos por enquanto.

### Em aberto
1. **Níveis e nomes das personalizadas:** os 7 níveis da seção 2 (metas, nomes e cores) estão bons? Troque o que quiser pelos nomes da lista de alternativas.
