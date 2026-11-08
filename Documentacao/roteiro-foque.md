# Roteiro do Foque

Roteiro fixo do assistente **Foque** para o MVP. As perguntas são feitas no primeiro acesso, e as sugestões são escolhidas a partir das respostas. A geração por IA fica para depois (ver [decisoes.md](decisoes.md)).

## Perguntas iniciais

Feitas uma por vez, na ordem abaixo. Cada pergunta tem opções fixas. Pode-se pular uma pergunta, mas a resposta fica como "não informado".

1. **O que você faz hoje?**
   - Estudante
   - Trabalho presencial
   - Home office
   - Autônomo ou empreendedor
   - Outro

2. **Quanto tempo você passa no celular por dia?**
   - Menos de 1 hora
   - 1 a 3 horas
   - 3 a 5 horas
   - Mais de 5 horas

3. **Em que momentos você mais se distrai?**
   - Ao acordar
   - Durante o trabalho ou estudo
   - Nas pausas
   - Durante as refeições
   - Antes de dormir
   - *Pode marcar mais de um.*

4. **O que mais atrapalha seu foco?**
   - Notificações
   - Redes sociais
   - Vontade de checar mensagens
   - Cansaço
   - Não saber por onde começar

5. **Quanto tempo você consegue ficar sem o celular hoje?**
   - Poucos minutos
   - 15 a 30 minutos
   - 30 minutos a 1 hora
   - Mais de 1 hora

6. **O que você quer conquistar com o Foque?**
   - Terminar tarefas do dia
   - Estudar com mais constância
   - Ler mais
   - Usar menos o celular
   - Outro

## Sugestões do Foque

O Foque mostra de 1 a 3 sugestões por vez, escolhidas pela dificuldade principal (pergunta 4) e pelos momentos de distração (pergunta 3). Cada sugestão é curta e tem uma ação prática.

### Por dificuldade
| Dificuldade | Sugestões |
| --- | --- |
| Notificações | "Desative as notificações que não são urgentes antes de começar a sessão." |
| Redes sociais | "Deixe o celular em outro cômodo durante a sessão." |
| Vontade de checar mensagens | "Avise as pessoas próximas que você vai ficar sem celular por um tempo." |
| Cansaço | "Comece com uma tarefa curta. Quinze minutos já contam." |
| Não saber por onde começar | "Escolha só uma tarefa para hoje. Uma já é um bom começo." |

### Por momento
| Momento | Sugestões |
| --- | --- |
| Ao acordar | "Espere 30 minutos depois de acordar para pegar o celular." |
| Durante o trabalho ou estudo | "Use uma sessão de foco para a tarefa mais importante do dia." |
| Nas pausas | "Faça uma pausa sem celular: levante, beba água ou olhe pela janela." |
| Durante as refeições | "Coma sem o celular na mesa." |
| Antes de dormir | "Deixe o celular carregando fora do quarto, se puder." |

## Mensagens principais

| Momento | Mensagem |
| --- | --- |
| Início da sessão | "Sessão iniciada. Deixe o celular de lado e foque em: {tarefa}." |
| Sessão concluída | "Sessão concluída! Você ganhou {pontos} pontos de foco." |
| Sessão cancelada | "Você saiu do Foque e a sessão foi encerrada. Desta vez, sem pontos." |
| Subiu de nível | "Você subiu para o nível {nível} de foco!" |

*Tom original: direto e acolhedor. Frases curtas, sem julgamento quando a pessoa cancela a sessão.*

## Personalidade (a partir do redesign)
O Foque virou uma foca **exigente e sarcástica, mas que torce pela pessoa**. Ele provoca antes da sessão ("Ler um livro por 25 minutos? Ou vai abrir o TikTok de novo, humano? 👀"), vigia durante e comemora ou consola depois, sempre sem humilhar. As falas ficam em `src/domain/mensagens.ts` (`falas`), uma sorteada por vez:

| Momento | Exemplo |
| --- | --- |
| Antes de focar | "Se você largar o celular por 25 minutos, eu paro de te julgar. Talvez. 👀" |
| Sem missão | "Nenhuma missão? Escolhe uma coisa importante pra hoje, humano. 🧊" |
| Durante a sessão | "Tô de olho. Nem pense em sair do app. 👀" |
| Concluída | "Gelo intacto. Peixe merecido. 🐟" |
| Cancelada | "Tudo bem, até as focas escorregam. Bora de novo? 🧊" |
| Dicas (aba Foca) | As sugestões desta página, reescritas na voz do Foque. |

A **Regra do Gelo Fino** resume a mecânica: "A cada 1 minuto de foco você ganha 1 ponto. Se sair do app ou bloquear a tela, o gelo quebra e a sessão é perdida!"
