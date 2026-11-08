// Títulos dos níveis de foco e progresso dentro do nível. Funções puras.
// Os títulos são proposta (ver Documentacao/decisoes.md) e podem mudar.
import { nivelPorPontos, pontosParaNivel } from './pontos';

const TITULOS = [
  'Filhote de Foca', // 1
  'Foca Curiosa', // 2
  'Foca Nadadora', // 3
  'Foca Ártica', // 4
  'Caçadora de Peixes', // 5
  'Guardiã do Gelo', // 6
  'Mergulhadora Profunda', // 7
  'Foca Polar', // 8
  'Mestre do Gelo', // 9
  'Lenda Glacial', // 10 em diante
];

export function tituloDoNivel(nivel: number): string {
  return TITULOS[Math.min(Math.max(nivel, 1), TITULOS.length) - 1];
}

export interface ProgressoNivel {
  nivel: number;
  titulo: string;
  proximoTitulo: string;
  /** Pontos totais em que o nível atual começa. */
  inicio: number;
  /** Pontos totais em que o próximo nível começa. */
  proximo: number;
  /** De 0 a 1: quanto do nível atual já foi percorrido. */
  fracao: number;
}

export function progressoNoNivel(pontos: number): ProgressoNivel {
  const nivel = nivelPorPontos(pontos);
  const inicio = pontosParaNivel(nivel);
  const proximo = pontosParaNivel(nivel + 1);
  return {
    nivel,
    titulo: tituloDoNivel(nivel),
    proximoTitulo: tituloDoNivel(nivel + 1),
    inicio,
    proximo,
    fracao: (pontos - inicio) / (proximo - inicio),
  };
}
