// Regras para diferenciar "bloqueou a tela" (pode, o foco continua) de
// "saiu do app" (o gelo quebra). Funções puras. Ver Documentacao/decisoes.md.
import type { EstadoTela } from '../../modules/foco-tela';

/** A tela pode ter apagado até 2 s antes de o app ir para segundo plano. */
export const JANELA_BLOQUEIO_MS = 2_000;

/** Depois de desbloquear, o Foque volta sozinho para a frente. Mais que isso = usou o celular. */
export const TOLERANCIA_DESBLOQUEIO_MS = 4_000;

/** Ao ir para segundo plano: foi bloqueio de tela (e não saída do app)? */
export function foiBloqueio(tela: EstadoTela, agora: number): boolean {
  if (!tela.suportado) return false;
  if (!tela.telaAcesa) return true;
  return tela.telaDesligadaEm > 0 && agora - tela.telaDesligadaEm <= JANELA_BLOQUEIO_MS;
}

export type DecisaoRetorno = 'continuar' | 'concluir' | 'cancelar';

/**
 * Ao voltar para o Foque depois de um bloqueio de tela:
 * - concluir: o tempo acabou enquanto a tela estava bloqueada;
 * - cancelar: a pessoa desbloqueou e foi usar outra coisa antes de voltar;
 * - continuar: voltou direto para o Foque.
 */
export function decidirRetorno(params: {
  bloqueadoEm: number;
  endAt: number;
  desbloqueadoEm: number;
  agora: number;
}): DecisaoRetorno {
  const { bloqueadoEm, endAt, desbloqueadoEm, agora } = params;
  const desbloqueou = desbloqueadoEm > bloqueadoEm;
  const limite = desbloqueou ? desbloqueadoEm : agora;

  if (endAt <= limite) return 'concluir';
  if (desbloqueou && agora - desbloqueadoEm > TOLERANCIA_DESBLOQUEIO_MS) return 'cancelar';
  return 'continuar';
}
