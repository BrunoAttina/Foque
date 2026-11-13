import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { APARENCIA_PADRAO, type AparenciaId, ehAparencia } from '../domain/aparencias';
import { useAuth } from './auth';

interface AparenciaState {
  /** Aparência escolhida por conta (id do usuário → aparência). Fica só no aparelho por enquanto. */
  porUsuario: Record<string, AparenciaId>;
  escolher: (userId: string, aparencia: AparenciaId) => void;
}

export const useAparencias = create<AparenciaState>()(
  persist(
    (set) => ({
      porUsuario: {},
      escolher: (userId, aparencia) =>
        set((estado) => ({ porUsuario: { ...estado.porUsuario, [userId]: aparencia } })),
    }),
    {
      name: 'foque-aparencia',
      // localStorage do expo-sqlite (instalado em src/services/supabase.ts).
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Aparência da conta logada. Sem login (ou valor antigo/inválido), a padrão. */
export function useAparenciaAtual(): AparenciaId {
  const userId = useAuth((s) => s.session?.user.id);
  const escolhida = useAparencias((s) => (userId ? s.porUsuario[userId] : undefined));
  return ehAparencia(escolhida) ? escolhida : APARENCIA_PADRAO;
}
