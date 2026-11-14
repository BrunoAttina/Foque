import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { pontosPendentes } from '../services/filaSessoes';
import { buscarLoja, comprarItem, type ItemLoja } from '../services/loja';

interface LojaState {
  /** Usuário dono da cópia local. Evita mostrar a carteira de outra conta. */
  donoId: string | null;
  /** Moedas do servidor + as de sessões concluídas ainda na fila offline. */
  moedas: number;
  itens: ItemLoja[];
  /** Ids dos itens comprados. Guardado no aparelho para valer sem internet. */
  comprados: string[];
  /** false até a primeira resposta do servidor nesta abertura do app. */
  carregada: boolean;
  /** Busca saldo, itens e compras. Sem conexão, mantém a cópia local. */
  carregar: (userId: string) => Promise<void>;
  /** Compra no servidor. Lança ErroLoja se não der. */
  comprar: (itemId: string) => Promise<void>;
  limpar: () => void;
}

export const useLoja = create<LojaState>()(
  persist(
    (set, get) => ({
      donoId: null,
      moedas: 0,
      itens: [],
      comprados: [],
      carregada: false,

      carregar: async (userId) => {
        if (get().donoId !== userId) set({ donoId: userId, moedas: 0, itens: [], comprados: [], carregada: false });
        try {
          const [dados, pendentes] = await Promise.all([buscarLoja(userId), pontosPendentes(userId).catch(() => 0)]);
          // Se trocou de conta durante a busca, descarta o resultado.
          if (get().donoId !== userId) return;
          set({ moedas: dados.moedas + pendentes, itens: dados.itens, comprados: dados.comprados, carregada: true });
        } catch {
          // Sem conexão: fica com a cópia local.
        }
      },

      comprar: async (itemId) => {
        const userId = get().donoId;
        const saldo = await comprarItem(itemId);
        if (get().donoId !== userId) return;
        const pendentes = userId ? await pontosPendentes(userId).catch(() => 0) : 0;
        set((estado) => ({
          moedas: saldo + pendentes,
          comprados: estado.comprados.includes(itemId) ? estado.comprados : [...estado.comprados, itemId],
        }));
      },

      limpar: () => set({ donoId: null, moedas: 0, itens: [], comprados: [], carregada: false }),
    }),
    {
      name: 'foque-loja',
      // localStorage do expo-sqlite (instalado em src/services/supabase.ts).
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({
        donoId: estado.donoId,
        moedas: estado.moedas,
        itens: estado.itens,
        comprados: estado.comprados,
      }),
    },
  ),
);
