import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { criarTarefa, listarTarefas, removerTarefa } from '../services/tarefas';

export interface Tarefa {
  id: string;
  nome: string;
  duracaoMinutos: number;
}

interface TarefasState {
  /** Usuário dono da cópia local. Evita mostrar tarefas de outra conta. */
  donoId: string | null;
  tarefas: Tarefa[];
  carregando: boolean;
  /** Busca as tarefas no servidor. Sem conexão, mantém a cópia local. */
  carregar: (userId: string) => Promise<void>;
  /** Cria no servidor. Lança ErroTarefas sem conexão. */
  adicionar: (nome: string, duracaoMinutos: number) => Promise<void>;
  /** Remove no servidor. Lança ErroTarefas sem conexão. */
  remover: (id: string) => Promise<void>;
  limpar: () => void;
}

export const useTarefas = create<TarefasState>()(
  persist(
    (set, get) => ({
      donoId: null,
      tarefas: [],
      carregando: false,

      carregar: async (userId) => {
        if (get().donoId !== userId) set({ donoId: userId, tarefas: [] });
        set({ carregando: true });
        try {
          const tarefas = await listarTarefas();
          // Se trocou de conta durante a busca, descarta o resultado.
          if (get().donoId === userId) set({ tarefas });
        } catch {
          // Sem conexão: fica com a cópia local.
        } finally {
          set({ carregando: false });
        }
      },

      adicionar: async (nome, duracaoMinutos) => {
        const tarefa = await criarTarefa(nome, duracaoMinutos);
        set((estado) => ({ tarefas: [...estado.tarefas, tarefa] }));
      },

      remover: async (id) => {
        await removerTarefa(id);
        set((estado) => ({ tarefas: estado.tarefas.filter((t) => t.id !== id) }));
      },

      limpar: () => set({ donoId: null, tarefas: [] }),
    }),
    {
      name: 'foque-tarefas',
      // localStorage do expo-sqlite (instalado em src/services/supabase.ts).
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({ donoId: estado.donoId, tarefas: estado.tarefas }),
    },
  ),
);
