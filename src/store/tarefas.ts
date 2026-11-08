import { create } from 'zustand';

export interface Tarefa {
  id: string;
  nome: string;
  duracaoMinutos: number;
}

interface TarefasState {
  /** Tarefas do dia. Em memória por enquanto; a persistência entra depois. */
  tarefas: Tarefa[];
  adicionar: (nome: string, duracaoMinutos: number) => Tarefa;
  remover: (id: string) => void;
}

function novoId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useTarefas = create<TarefasState>((set) => ({
  tarefas: [],

  adicionar: (nome, duracaoMinutos) => {
    const tarefa: Tarefa = { id: novoId(), nome, duracaoMinutos };
    set((estado) => ({ tarefas: [...estado.tarefas, tarefa] }));
    return tarefa;
  },

  remover: (id) => {
    set((estado) => ({ tarefas: estado.tarefas.filter((t) => t.id !== id) }));
  },
}));
