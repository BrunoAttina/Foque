import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { diaLocal } from '../domain/tarefas';
import { criarTarefa, listarTarefas, marcarTarefaConcluida, removerTarefa } from '../services/tarefas';

export interface Tarefa {
  id: string;
  nome: string;
  duracaoMinutos: number;
  /** true: fica na lista e volta todo dia. false: é apagada ao ser concluída. */
  repeteDiariamente: boolean;
  /** Dia ("AAAA-MM-DD") da última conclusão. Só é usado nos focos diários. */
  concluidaEm: string | null;
}

/** Conclusão que ainda não chegou ao servidor (sessão concluída sem conexão). */
interface ConclusaoPendente {
  id: string;
  /** Dia da conclusão, para os focos diários; null: apagar o foco. */
  dia: string | null;
}

interface TarefasState {
  /** Usuário dono da cópia local. Evita mostrar tarefas de outra conta. */
  donoId: string | null;
  tarefas: Tarefa[];
  pendentes: ConclusaoPendente[];
  carregando: boolean;
  /** Envia as conclusões pendentes e busca as tarefas no servidor. Sem conexão, mantém a cópia local. */
  carregar: (userId: string) => Promise<void>;
  /** Cria no servidor. Lança ErroTarefas sem conexão. */
  adicionar: (nome: string, duracaoMinutos: number, repeteDiariamente: boolean) => Promise<Tarefa>;
  /** Remove no servidor. Lança ErroTarefas sem conexão. */
  remover: (id: string) => Promise<void>;
  /**
   * Sessão concluída: o foco de uma vez sai da lista; o diário fica marcado como feito hoje.
   * Vale na hora no aparelho; o servidor recebe em seguida (ou na próxima carga, se faltar conexão).
   */
  concluir: (id: string, agora: number) => void;
  limpar: () => void;
}

/** Envia as conclusões pendentes; devolve as que não foram. */
async function enviarPendentes(pendentes: ConclusaoPendente[]): Promise<ConclusaoPendente[]> {
  const restantes: ConclusaoPendente[] = [];
  for (const pendente of pendentes) {
    try {
      if (pendente.dia === null) await removerTarefa(pendente.id);
      else await marcarTarefaConcluida(pendente.id, pendente.dia);
    } catch {
      restantes.push(pendente);
    }
  }
  return restantes;
}

export const useTarefas = create<TarefasState>()(
  persist(
    (set, get) => ({
      donoId: null,
      tarefas: [],
      pendentes: [],
      carregando: false,

      carregar: async (userId) => {
        if (get().donoId !== userId) set({ donoId: userId, tarefas: [], pendentes: [] });
        set({ carregando: true });
        try {
          const enviadas = get().pendentes;
          const restantes = await enviarPendentes(enviadas);
          // Mantém o que não foi enviado e o que entrou durante o envio.
          set((estado) => ({
            pendentes: [...restantes, ...estado.pendentes.filter((p) => !enviadas.includes(p))],
          }));
          const tarefas = await listarTarefas();
          // Se trocou de conta durante a busca, descarta o resultado.
          if (get().donoId !== userId) return;
          // O que ainda está pendente continua valendo sobre a resposta do servidor.
          const pendentes = get().pendentes;
          set({
            tarefas: tarefas
              .filter((t) => !pendentes.some((p) => p.id === t.id && p.dia === null))
              .map((t) => {
                const dia = pendentes.find((p) => p.id === t.id)?.dia;
                return dia ? { ...t, concluidaEm: dia } : t;
              }),
          });
        } catch {
          // Sem conexão: fica com a cópia local.
        } finally {
          set({ carregando: false });
        }
      },

      adicionar: async (nome, duracaoMinutos, repeteDiariamente) => {
        const tarefa = await criarTarefa(nome, duracaoMinutos, repeteDiariamente);
        set((estado) => ({ tarefas: [...estado.tarefas, tarefa] }));
        return tarefa;
      },

      remover: async (id) => {
        await removerTarefa(id);
        set((estado) => ({ tarefas: estado.tarefas.filter((t) => t.id !== id) }));
      },

      concluir: (id, agora) => {
        const tarefa = get().tarefas.find((t) => t.id === id);
        if (!tarefa) return;
        const pendente: ConclusaoPendente = { id, dia: tarefa.repeteDiariamente ? diaLocal(agora) : null };
        set((estado) => ({
          tarefas: tarefa.repeteDiariamente
            ? estado.tarefas.map((t) => (t.id === id ? { ...t, concluidaEm: pendente.dia } : t))
            : estado.tarefas.filter((t) => t.id !== id),
          pendentes: [...estado.pendentes.filter((p) => p.id !== id), pendente],
        }));
        void enviarPendentes([pendente]).then((restantes) => {
          if (restantes.length === 0) {
            set((estado) => ({ pendentes: estado.pendentes.filter((p) => p !== pendente) }));
          }
        });
      },

      limpar: () => set({ donoId: null, tarefas: [], pendentes: [] }),
    }),
    {
      name: 'foque-tarefas',
      // localStorage do expo-sqlite (instalado em src/services/supabase.ts).
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({ donoId: estado.donoId, tarefas: estado.tarefas, pendentes: estado.pendentes }),
    },
  ),
);
