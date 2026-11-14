// Mensagens e falas do Foque. Ver Documentacao/roteiro-foque.md.
// Personalidade: uma foca exigente e sarcástica, mas que torce por você.

/** "1 ponto de foco" ou "N pontos de foco". */
export function pontosDeFoco(pontos: number) {
  return `${pontos} ${pontos === 1 ? 'ponto' : 'pontos'} de foco`;
}

/** Forma curta: "1 pt" ou "N pts". */
export function pts(pontos: number) {
  return `${pontos} ${pontos === 1 ? 'pt' : 'pts'}`;
}

function sortear<T>(lista: readonly T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

export const mensagens = {
  inicioSessao: (tarefa: string) => `Sessão iniciada. Deixe o celular de lado e foque em: ${tarefa}.`,
  sessaoConcluida: (pontos: number) => `Sessão concluída! Você ganhou ${pontosDeFoco(pontos)}.`,
  saiuDoApp: 'Você saiu do Foque e a sessão foi encerrada. Desta vez, sem pontos.',
  desistiu: 'Você encerrou a sessão antes do tempo. Desta vez, sem pontos.',
  subiuDeNivel: (nivel: number) => `Você subiu para o nível ${nivel} de foco!`,
  /** Aba Amigos, seção "Focando agora" sem ninguém. */
  ninguemFocando: 'Ninguém focando agora. Que tal dar o exemplo? 🧊',
  /** Aba Amigos: a seção "Focando agora" não carregou. */
  erroFocando: 'Não deu para ver quem está focando agora. 🧊',
};

/** Falas do Foque em cada momento. Uma é sorteada a cada vez. */
export const falas = {
  provocacao: (tarefa: string, minutos: number) =>
    sortear([
      `${tarefa} por ${minutos} minutos? Ou vai abrir o TikTok de novo, humano? 👀`,
      `${minutos} minutos de ${tarefa.toLowerCase()}. Eu aguento. E você? 🐟`,
      `Bora: ${tarefa.toLowerCase()}, ${minutos} minutos, zero desculpas. 🧊`,
      `Se você largar o celular por ${minutos} minutos, eu paro de te julgar. Talvez. 👀`,
    ]),
  semMissao: () =>
    sortear([
      'Nenhuma missão? Escolhe uma coisa importante pra hoje, humano. 🧊',
      'Sem missão eu não mergulho. Cria uma aí embaixo. 🐟',
    ]),
  duranteSessao: () =>
    sortear([
      'Tô de olho. Nem pense em sair do app. 👀',
      'Gelo firme. Continua assim. 🧊',
      'Cada minuto conta. Literalmente: 1 ponto por minuto. 🐟',
    ]),
  concluida: () =>
    sortear([
      'Olha só, você conseguiu! Tô quase orgulhosa. 🎉',
      'Gelo intacto. Peixe merecido. 🐟',
      'Isso sim é foco. Repete amanhã? 🧊',
    ]),
  cancelada: () =>
    sortear([
      'O gelo quebrou... Respira e tenta de novo. 💔',
      'Sem pontos dessa vez. Eu sabia que o celular ia ganhar. 👀',
      'Tudo bem, até as focas escorregam. Bora de novo? 🧊',
    ]),
  /** Ao trocar de aparência na aba Foque. */
  novaAparencia: (nome: string) =>
    sortear([
      `${nome}? Ficou bom. A exigência continua a mesma. 👀`,
      `Visual novo, mesma foca. Agora vai focar ou não? 🧊`,
      'Gostei do visual. Mas não pense que isso te livra da missão. 🐟',
    ]),
  boasVindas: (username: string) => `Ah, você de novo, @${username}. Vamos focar ou não? 🦭`,
  /** Dicas do roteiro (Documentacao/roteiro-foque.md), no tom do Foque. */
  dica: () =>
    sortear([
      'Desativa as notificações que não são urgentes antes de mergulhar. 🔕',
      'Deixa o celular em outro cômodo. Longe dos olhos, longe do TikTok. 👀',
      'Avisa quem tá perto que você vai sumir por um tempo. Focas precisam de paz. 🧊',
      'Cansado? Começa com 15 minutos. Já conta. 🐟',
      'Escolhe só uma missão pra hoje. Uma já é um bom começo. 🎯',
      'Espera 30 minutos depois de acordar pra pegar o celular. Eu sei que dá. 🌅',
      'Pausa sem celular: levanta, bebe água, olha pela janela. 💧',
      'Celular carregando fora do quarto = sono de foca. 😴',
    ]),
};
