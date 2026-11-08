import { create } from 'zustand';

import { pontosDaSessao } from '../domain/pontos';

export type StatusSessao = 'idle' | 'running' | 'done' | 'cancelled';

interface SessaoState {
  status: StatusSessao;
  /** Horário (ms) em que a sessão termina. Só existe enquanto a sessão está rodando. */
  endAt: number | null;
  /** Pontos ganhos na última sessão concluída. */
  pontosUltimaSessao: number;
  /** Total de pontos acumulados. Em memória por enquanto; o Supabase entra depois. */
  pontosTotais: number;
  iniciar: (duracaoMs: number, agora: number) => void;
  cancelar: () => void;
  concluir: (minutosConcluidos: number) => void;
}

export const useSessao = create<SessaoState>((set, get) => ({
  status: 'idle',
  endAt: null,
  pontosUltimaSessao: 0,
  pontosTotais: 0,

  iniciar: (duracaoMs, agora) => {
    set({ status: 'running', endAt: agora + duracaoMs });
  },

  cancelar: () => {
    if (get().status !== 'running') return;
    set({ status: 'cancelled', endAt: null, pontosUltimaSessao: 0 });
  },

  concluir: (minutosConcluidos) => {
    if (get().status !== 'running') return;
    const ganhos = pontosDaSessao(minutosConcluidos);
    set((estado) => ({
      status: 'done',
      endAt: null,
      pontosUltimaSessao: ganhos,
      pontosTotais: estado.pontosTotais + ganhos,
    }));
  },
}));
