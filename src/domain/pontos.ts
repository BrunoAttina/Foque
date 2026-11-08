// Regras de pontos e níveis do Foque.
// Funções puras: sem React e sem banco. Ver Documentacao/requisitos.md.

export const PONTOS_POR_MINUTO = 1;

/** Pontos ganhos por uma sessão concluída. Só minutos completos contam. */
export function pontosDaSessao(minutosConcluidos: number): number {
  const minutos = Math.max(0, Math.floor(minutosConcluidos));
  return minutos * PONTOS_POR_MINUTO;
}

/** Total de pontos necessário para chegar ao nível informado: 30 × N × (N − 1). */
export function pontosParaNivel(nivel: number): number {
  if (nivel <= 1) return 0;
  return 30 * nivel * (nivel - 1);
}

/** Nível de foco correspondente ao total de pontos acumulados. */
export function nivelPorPontos(pontos: number): number {
  let nivel = 1;
  while (pontos >= pontosParaNivel(nivel + 1)) {
    nivel += 1;
  }
  return nivel;
}
