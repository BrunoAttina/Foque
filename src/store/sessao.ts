import { create } from 'zustand';

import { pontosDaSessao } from '../domain/pontos';
import type { Tarefa } from './tarefas';

export type StatusSessao = 'idle' | 'running' | 'done' | 'cancelled';
export type MotivoCancelamento = 'saiu' | 'desistiu';

interface SessaoState {
  status: StatusSessao;
  /** Tarefa da sessão atual ou da última sessão. */
  tarefa: Tarefa | null;
  /** Horário (ms) em que a sessão termina. Só existe enquanto a sessão está rodando. */
  endAt: number | null;
  motivoCancelamento: MotivoCancelamento | null;
  /** Pontos ganhos na última sessão concluída. */
  pontosUltimaSessao: number;
  /** Total de pontos acumulados. Em memória por enquanto; o Supabase entra depois. */
  pontosTotais: number;
  iniciar: (tarefa: Tarefa, agora: number) => void;
  cancelar: (motivo: MotivoCancelamento) => void;
  concluir: () => void;
}

export const useSessao = create<SessaoState>((set, get) => ({
  status: 'idle',
  tarefa: null,
  endAt: null,
  motivoCancelamento: null,
  pontosUltimaSessao: 0,
  pontosTotais: 0,

  iniciar: (tarefa, agora) => {
    set({
      status: 'running',
      tarefa,
      endAt: agora + tarefa.duracaoMinutos * 60 * 1000,
      motivoCancelamento: null,
      pontosUltimaSessao: 0,
    });
  },

  cancelar: (motivo) => {
    if (get().status !== 'running') return;
    set({ status: 'cancelled', endAt: null, motivoCancelamento: motivo, pontosUltimaSessao: 0 });
  },

  concluir: () => {
    const { status, tarefa } = get();
    if (status !== 'running' || !tarefa) return;
    const ganhos = pontosDaSessao(tarefa.duracaoMinutos);
    set((estado) => ({
      status: 'done',
      endAt: null,
      pontosUltimaSessao: ganhos,
      pontosTotais: estado.pontosTotais + ganhos,
    }));
  },
}));
