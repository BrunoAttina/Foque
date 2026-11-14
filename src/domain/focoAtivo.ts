// Status "focando agora": contas de tempo e textos. Funções puras.
// Ver Documentacao/status-de-foco.md.
import type { FocoAtivo } from '../services/focoAtivo';

/** O que as contas precisam de um foco. */
type Periodo = Pick<FocoAtivo, 'inicio' | 'fimPrevisto'>;

export interface TempoDoFoco {
  /** Tempo focado até agora, em ms. Entre 0 e a duração. */
  decorridoMs: number;
  /** Tempo que falta, em ms. Nunca negativo. */
  restanteMs: number;
  /** Progresso de 0 a 1. */
  fracao: number;
  /** O foco ainda não chegou ao fim previsto. */
  ativo: boolean;
}

/** O foco ainda está em andamento no relógio de quem vê. */
export function focoEstaAtivo(foco: Periodo, agora: number): boolean {
  return foco.fimPrevisto > agora;
}

/**
 * Tempo focado, tempo restante e progresso de um foco.
 * O início vem do relógio do servidor: se o aparelho estiver adiantado ou atrasado,
 * os valores ficam presos entre 0 e a duração em vez de estourar.
 */
export function tempoDoFoco(foco: Periodo, agora: number): TempoDoFoco {
  const totalMs = Math.max(0, foco.fimPrevisto - foco.inicio);
  const decorridoMs = Math.min(totalMs, Math.max(0, agora - foco.inicio));
  const restanteMs = Math.min(totalMs, Math.max(0, foco.fimPrevisto - agora));
  const fracao = totalMs > 0 ? decorridoMs / totalMs : 1;
  return { decorridoMs, restanteMs, fracao, ativo: focoEstaAtivo(foco, agora) };
}

function doisDigitos(n: number) {
  return String(n).padStart(2, '0');
}

/**
 * "mm:ss", ou "h:mm:ss" a partir de 60 minutos.
 * Tempo restante arredonda para cima (como o cronômetro da sessão); tempo decorrido, para baixo.
 */
export function formatarRelogio(ms: number, arredondar: 'cima' | 'baixo' = 'baixo'): string {
  const segundosExatos = Math.max(0, ms) / 1000;
  const total = arredondar === 'cima' ? Math.ceil(segundosExatos) : Math.floor(segundosExatos);
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segundos = total % 60;
  if (horas > 0) return `${horas}:${doisDigitos(minutos)}:${doisDigitos(segundos)}`;
  return `${doisDigitos(minutos)}:${doisDigitos(segundos)}`;
}

/** "faltam 12:34" (ou "falta 00:01", "faltam 1:02:03"). */
export function textoFaltam(restanteMs: number): string {
  return `faltam ${formatarRelogio(restanteMs, 'cima')}`;
}

/** "25 min", "1 h" ou "1 h 05 min". */
export function formatarMinutos(minutos: number): string {
  const total = Math.max(0, Math.floor(minutos));
  if (total < 60) return `${total} min`;
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${doisDigitos(resto)} min`;
}

/** "há 8 min", "há 1 h 05 min" ou "agora mesmo" no primeiro minuto. */
export function textoHa(decorridoMs: number): string {
  const minutos = Math.floor(Math.max(0, decorridoMs) / 60000);
  if (minutos < 1) return 'agora mesmo';
  return `há ${formatarMinutos(minutos)}`;
}
