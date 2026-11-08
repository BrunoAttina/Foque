// Mensagens do Foque. Ver Documentacao/roteiro-foque.md.

/** "1 ponto de foco" ou "N pontos de foco". */
export function pontosDeFoco(pontos: number) {
  return `${pontos} ${pontos === 1 ? 'ponto' : 'pontos'} de foco`;
}

export const mensagens = {
  inicioSessao: (tarefa: string) => `Sessão iniciada. Deixe o celular de lado e foque em: ${tarefa}.`,
  sessaoConcluida: (pontos: number) => `Sessão concluída! Você ganhou ${pontosDeFoco(pontos)}.`,
  saiuDoApp: 'Você saiu do Foque e a sessão foi encerrada. Desta vez, sem pontos.',
  desistiu: 'Você encerrou a sessão antes do tempo. Desta vez, sem pontos.',
  subiuDeNivel: (nivel: number) => `Você subiu para o nível ${nivel} de foco!`,
};
