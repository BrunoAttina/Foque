import { useEffect } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { APARENCIA_PADRAO, aparenciaLiberada, type AparenciaId, ehAparencia } from '../domain/aparencias';
import { publicarAparencia } from '../services/social';
import { useAuth } from './auth';
import { useLoja } from './loja';

interface AparenciaState {
  /** Aparência escolhida por conta (id do usuário → aparência). Fica só no aparelho por enquanto. */
  porUsuario: Record<string, AparenciaId>;
  /** Troca a aparência no aparelho e avisa o servidor, para os amigos verem. */
  escolher: (userId: string, aparencia: AparenciaId) => void;
}

export const useAparencias = create<AparenciaState>()(
  persist(
    (set) => ({
      porUsuario: {},
      escolher: (userId, aparencia) => {
        set((estado) => ({ porUsuario: { ...estado.porUsuario, [userId]: aparencia } }));
        void publicarAparencia(aparencia);
      },
    }),
    {
      name: 'foque-aparencia',
      // localStorage do expo-sqlite (instalado em src/services/supabase.ts).
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Aparência da conta logada. Sem login, valor inválido ou aparência não comprada: a padrão. */
export function useAparenciaAtual(): AparenciaId {
  const userId = useAuth((s) => s.session?.user.id);
  const escolhida = useAparencias((s) => (userId ? s.porUsuario[userId] : undefined));
  const comprados = useLoja((s) => s.comprados);
  return ehAparencia(escolhida) && aparenciaLiberada(escolhida, comprados) ? escolhida : APARENCIA_PADRAO;
}

/**
 * Mantém a aparência do aparelho e a do servidor iguais. Usar uma vez, com o app logado.
 * - Aparelho sem escolha (ex.: celular novo): adota a do servidor.
 * - Aparelho diferente do servidor (ex.: escolha feita sem internet): envia a do aparelho.
 */
export function useSincronizarAparencia() {
  const userId = useAuth((s) => s.session?.user.id);
  const doServidor = useAuth((s) => s.perfil?.aparencia);
  const atual = useAparenciaAtual();
  const temEscolha = useAparencias((s) => (userId ? s.porUsuario[userId] !== undefined : false));

  useEffect(() => {
    if (!userId || doServidor === undefined) return;
    if (!temEscolha) {
      if (ehAparencia(doServidor) && doServidor !== APARENCIA_PADRAO) {
        useAparencias.setState((estado) => ({ porUsuario: { ...estado.porUsuario, [userId]: doServidor } }));
      }
      return;
    }
    if (atual !== doServidor) {
      void publicarAparencia(atual).then(() => useAuth.getState().recarregarPerfil());
    }
  }, [userId, doServidor, atual, temEscolha]);
}
