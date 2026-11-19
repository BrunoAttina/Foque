# Conquistas de Foco

> **Status:** plano para revisão. Nada disto está no código ainda.
> Edite à vontade: nomes, metas, moedas e as decisões em aberto no fim do documento.

A pessoa ganha **conquistas** ao focar. Elas aparecem no Perfil dela e no perfil que os outros veem. Há dois tipos:

- **Conquistas Fixas:** as mesmas para todo mundo, definidas pelo jogo. Ex.: "Foca Iniciante" ao chegar a 50 pontos.
- **Conquistas Personalizadas:** nascem dos focos que a própria pessoa cria. Ex.: quem tem o foco "Ler livros" ganha "Bom em ler livros" ao concluir 25 focos de leitura.

As duas saem do **histórico de focos** (tabela `focus_sessions`): só conta o que está registrado lá como concluído.

---

## 1. Conquistas Fixas

Cada uma tem um nome, uma descrição, uma meta e uma recompensa em moedas (proposta). A recompensa é paga uma vez, quando a conquista é obtida.

### Pontos de foco
| Conquista | Como ganhar | Moedas |
| --- | --- | --- |
| Foca Iniciante | Chegar a 50 pontos de foco | 10 |
| Foca Experiente | Chegar a 150 pontos | 20 |
| Foca Veterana | Chegar a 500 pontos | 50 |
| Foca Lendária | Chegar a 1.000 pontos | 100 |

### Focos concluídos
| Conquista | Como ganhar | Moedas |
| --- | --- | --- |
| Primeiro Mergulho | Concluir o primeiro foco | 5 |
| Pegando o Ritmo | Concluir 10 focos | 15 |
| Foca Dedicada | Concluir 50 focos | 40 |
| Centenário de Gelo | Concluir 100 focos | 80 |

### Dias seguidos (sequência)
Um dia conta se a pessoa concluiu pelo menos um foco nele.

| Conquista | Como ganhar | Moedas |
| --- | --- | --- |
| Três Dias no Gelo | Focar 3 dias seguidos | 15 |
| Semana Congelada | Focar 7 dias seguidos | 40 |
| Mês Polar | Focar 30 dias seguidos | 150 |

### Tempo em um dia e duração
| Conquista | Como ganhar | Moedas |
| --- | --- | --- |
| Mergulho Profundo | Concluir um foco de 60 minutos | 10 |
| Maratona Ártica | Somar 2 horas de foco no mesmo dia | 30 |
| Dia de Iceberg | Somar 4 horas de foco no mesmo dia | 60 |

### Horários e dias da semana
| Conquista | Como ganhar | Moedas |
| --- | --- | --- |
| Foca Madrugadora | Concluir um foco que começou antes das 7h | 15 |
| Foca Coruja | Concluir um foco que terminou depois das 22h | 15 |
| Fim de Semana no Gelo | Focar no sábado e no domingo da mesma semana | 15 |

### Hábitos e variedade
| Conquista | Como ganhar | Moedas |
| --- | --- | --- |
| Hábito de Foca | Concluir o mesmo foco diário 7 dias seguidos | 30 |
| Foca Versátil | Concluir focos de 5 tarefas diferentes | 20 |

### Loja (gasto de moedas)
| Conquista | Como ganhar | Moedas |
| --- | --- | --- |
| Primeira Compra | Comprar o primeiro item na loja | 5 |
| Foca Gastadora | Gastar 100 moedas no total | 15 |
| Colecionadora | Ter todas as aparências do Foque | 50 |

### Amigos
| Conquista | Como ganhar | Moedas |
| --- | --- | --- |
| Cardume | Seguir 3 pessoas | 10 |
| Foca Popular | Ter 5 seguidores | 20 |

**Outras ideias para depois:** focar em um feriado; concluir focos em 7 dias diferentes de um mês; ver um amigo focando e começar um foco junto (quando houver foco em grupo); conquistas de evento por tempo limitado.

As conquistas fixas ficam em uma tabela no banco (como os preços da loja). Mudar nome, meta ou moedas é um `update` no SQL Editor, sem nova versão do app.

---

## 2. Conquistas Personalizadas

### Como funciona
Cada foco que a pessoa conclui tem uma **contagem**: quantos focos daquela tarefa ela já concluiu. Ao atingir uma meta, ganha a conquista daquele nível e as moedas. No nível seguinte, a mesma conquista **sobe de nível**: muda de cor e de nome.

Exemplo com o foco **"Ler livros"**:

| Nível | Cor | Meta | Nome | Descrição | Moedas |
| --- | --- | --- | --- | --- | --- |
| 1 | Bronze | 10 focos | Ler livros | Concluiu 10 focos de ler livros | 25 |
| 2 | Prata | 25 focos | Bom em ler livros | Concluiu 25 focos de ler livros | 50 |
| 3 | Ouro | 50 focos | Ótimo em ler livros | Concluiu 50 focos de ler livros | 100 |
| 4 | Diamante | 100 focos | Mestre em ler livros | Concluiu 100 focos de ler livros | 200 |

O nome vem do foco: "Bom em {nome do foco}", em letras minúsculas. A pessoa vê uma conquista só, a do nível mais alto, e o progresso até o próximo ("32 de 50").

### O que conta
- **1 foco concluído = 1 na contagem.** "Leu 10 livros" vira "concluiu 10 focos de ler livros": o app não sabe quantos livros foram lidos, só quantas sessões. (Ver a decisão em aberto sobre uma unidade própria, como "livros".)
- Só sessões **concluídas** e com **15 minutos ou mais**. Isso deixa de fora os testes antigos de 1 minuto.
- Os focos são agrupados pelo **nome**, sem diferenciar maiúsculas, acentos e espaços nas pontas: "Ler livros", "ler livros" e "Ler Livros " contam juntos.
  - Por isso a contagem continua mesmo se o foco for de uma vez (apagado ao concluir) e a pessoa criar outro com o mesmo nome.
  - Também vale para o que já está no histórico: quem já concluiu focos ganha as conquistas assim que a função entrar.
  - Trocar o nome do foco começa outra contagem.

---

## 3. Onde aparece

### Perfil (o seu)
- Nova seção **Conquistas**, logo abaixo do cartão de nível, com o número obtido ("7 de 25") e as últimas conquistas em selos (ícone + cor).
- Botão **"Ver todas"** abre a tela de conquistas.

### Tela Conquistas (`conquistas.tsx`, nova)
- **Personalizadas** primeiro: um cartão por foco, com a cor do nível, o nome ("Bom em ler livros"), a contagem e a barra até o próximo nível.
- **Fixas** em seguida, separadas por categoria. As obtidas aparecem coloridas, com a data. As que faltam aparecem em cinza com o progresso ("32 de 50 pontos").

### Perfil de outro usuário
- A mesma seção **Conquistas**, só com as obtidas, e "Ver todas" abre a tela de conquistas daquela pessoa (só leitura, sem as que faltam).

### Ao concluir um foco (tela de resultado)
- Se o foco liberou uma conquista ou subiu o nível de uma personalizada, aparece um destaque: **"Conquista desbloqueada: Bom em ler livros! +50 moedas"**.
- Se a sessão foi concluída sem internet, o destaque aparece na próxima vez que o app enviar a sessão e abrir.

### Cores dos níveis
Bronze, prata, ouro e diamante (azul-gelo), dentro da paleta do design ([design.md](design.md)). As fixas usam uma cor por categoria.

---

## 4. Regras gerais
- **Quem calcula é o servidor.** O app não consegue se dar conquistas nem moedas.
- As conquistas são verificadas quando uma sessão é registrada, quando algo é comprado e quando a pessoa segue alguém ou ganha um seguidor.
- **Cada conquista é ganha uma vez** e não se perde: apagar um foco não tira as conquistas dele.
- As **moedas** da recompensa entram na carteira na hora. Os **pontos de foco** não mudam (conquista não sobe nível).
- **Dias e horários** (sequência, madrugadora, coruja, fim de semana) usam o fuso do aparelho. Para isso o app passa a enviar o fuso junto com cada sessão. Sessões antigas, sem fuso, usam o horário de Brasília.

---

## 5. Dados (migration `0010`, proposta)

| Tabela | Campos | Quem acessa |
| --- | --- | --- |
| `conquistas` | `id`, `categoria`, `titulo`, `descricao`, `meta`, `moedas`, `icone`, `ordem`, `ativa` | Catálogo das fixas. Qualquer usuário logado lê; ninguém altera pelo app. |
| `conquistas_obtidas` | `user_id`, `conquista_id`, `obtida_em`, `moedas`, `vista` | Fixas obtidas. Leitura conforme a decisão de visibilidade; só as funções escrevem. |
| `conquistas_foco` | `user_id`, `chave` (nome normalizado), `nome` (como a pessoa escreveu por último), `quantidade`, `nivel` (0 a 4), `atualizada_em`, `vista` | Personalizadas. Mesma regra de leitura; só as funções escrevem. |

Mudanças em tabelas que já existem:
- `focus_sessions` ganha `fuso_minutos` (diferença do fuso do aparelho para UTC).
- `registrar_sessao` recebe o fuso e, depois de registrar, chama a verificação das conquistas.
- `comprar_item` e um gatilho em `follows` também chamam a verificação.

Funções novas:
| Função | O que faz |
| --- | --- |
| `avaliar_conquistas(uid)` | Interna (o app não chama). Confere todas as metas, registra o que foi ganho e paga as moedas, tudo na mesma transação. |
| `marcar_conquistas_vistas()` | O app chama depois de mostrar o destaque "Conquista desbloqueada". |

Ao aplicar a migration, a verificação roda uma vez para todos os usuários, para dar as conquistas do histórico que já existe.

---

## 6. Etapas de implementação
1. **Banco:** migration `0010` com o catálogo das fixas, as tabelas, as funções e a verificação retroativa. Você roda no SQL Editor.
2. **App, leitura:** serviço e store de conquistas; seção no Perfil, tela Conquistas e seção no perfil de outros usuários.
3. **App, resultado:** destaque "Conquista desbloqueada" e envio do fuso nas sessões.
4. **Teste** com as duas contas de teste (@teste e @blambaa): conquistas retroativas, uma conquista nova ao concluir um foco, e a visão de outro usuário.
5. **Documentação** atualizada com o que foi feito.

---

## 7. Decisões em aberto
Responda ou edite aqui antes de começarmos:

1. **Visibilidade:** as conquistas aparecem para **qualquer usuário logado** (como o nível) ou **só para quem segue** a pessoa (como os pontos)? As personalizadas mostram o nome dos focos, que pode ser pessoal. *Sugestão:* qualquer usuário logado, com a opção de esconder uma conquista personalizada mais tarde.
2. **Moedas nas fixas:** as conquistas fixas também dão moedas (tabelas acima) ou só as personalizadas, como no seu exemplo? *Sugestão:* as duas dão.
3. **Retroativo:** quem já tem histórico recebe as conquistas **e as moedas** ao aplicar a migration, ou só as conquistas? *Sugestão:* as duas.
4. **Unidade da personalizada:** a contagem fica como "focos concluídos" ou a pessoa pode escrever uma unidade ao criar o foco ("livros", "capítulos")? A unidade é só um texto: o app continua contando sessões. *Sugestão:* começar com "focos" e deixar a unidade para depois.
5. **Metas e nomes dos níveis:** 10 / 25 / 50 / 100 com "{foco}", "Bom em", "Ótimo em", "Mestre em" estão bons?
6. **Lista das fixas:** remova, renomeie ou acrescente o que quiser nas tabelas da seção 1.
