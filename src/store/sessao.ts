import { create } from 'zustand';

import { novoUuid } from '../domain/id';
import { pontosDaSessao } from '../domain/pontos';
import type { Tarefa } from './tarefas';

export type StatusSessao = 'idle' | 'running' | 'done' | 'cancelled';
export type MotivoCancelamento = 'saiu' | 'desistiu';

interface SessaoState {
  status: StatusSessao;
  /** Id da sessão atual ou da última. Enviado ao servidor para evitar duplicidade. */
  sessaoId: string | null;
  /** Tarefa da sessão atual ou da última sessão. */
  tarefa: Tarefa | null;
  /** Horário (ms) em que a sessão começou. */
  inicio: number | null;
  /** Horário (ms) em que a sessão termina. Só existe enquanto a sessão está rodando. */
  endAt: number | null;
  /** Horário (ms) em que a sessão foi concluída ou cancelada. */
  fim: number | null;
  motivoCancelamento: MotivoCancelamento | null;
  /** Pontos ganhos na última sessão concluída. */
  pontosUltimaSessao: number;
  /** Pontos do servidor + pontos ainda na fila offline. */
  pontosTotais: number;
  iniciar: (tarefa: Tarefa, agora: number) => void;
  cancelar: (motivo: MotivoCancelamento) => void;
  concluir: () => void;
}

export const useSessao = create<SessaoState>((set, get) => ({
  status: 'idle',
  sessaoId: null,
  tarefa: null,
  inicio: null,
  endAt: null,
  fim: null,
  motivoCancelamento: null,
  pontosUltimaSessao: 0,
  pontosTotais: 0,

  iniciar: (tarefa, agora) => {
    set({
      status: 'running',
      sessaoId: novoUuid(),
      tarefa,
      inicio: agora,
      endAt: agora + tarefa.duracaoMinutos * 60 * 1000,
      fim: null,
      motivoCancelamento: null,
      pontosUltimaSessao: 0,
    });
  },

  cancelar: (motivo) => {
    if (get().status !== 'running') return;
    set({
      status: 'cancelled',
      endAt: null,
      fim: Date.now(),
      motivoCancelamento: motivo,
      pontosUltimaSessao: 0,
    });
  },

  concluir: () => {
    const { status, tarefa } = get();
    if (status !== 'running' || !tarefa) return;
    const ganhos = pontosDaSessao(tarefa.duracaoMinutos);
    // Soma na hora (otimista); o valor do servidor substitui depois do envio.
    set((estado) => ({
      status: 'done',
      endAt: null,
      fim: Date.now(),
      pontosUltimaSessao: ganhos,
      pontosTotais: estado.pontosTotais + ganhos,
    }));
  },
}));
