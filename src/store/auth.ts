import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { buscarPerfil, type Perfil } from '../services/auth';
import { sincronizar } from '../services/sincronizacao';
import { supabase } from '../services/supabase';
import { useSessao } from './sessao';
import { useTarefas } from './tarefas';

/** Tarefas e pontos ainda ficam só em memória: limpa ao trocar de usuário. */
function limparDadosLocais() {
  useTarefas.setState({ tarefas: [] });
  useSessao.setState({
    status: 'idle',
    sessaoId: null,
    tarefa: null,
    inicio: null,
    endAt: null,
    fim: null,
    motivoCancelamento: null,
    pontosUltimaSessao: 0,
    pontosTotais: 0,
  });
}

interface AuthState {
  /** true até a sessão salva no aparelho ser lida pela primeira vez. */
  carregando: boolean;
  session: Session | null;
  /** undefined = ainda não carregado; null = sem perfil. */
  perfil: Perfil | null | undefined;
  /** Começa a ouvir mudanças de login. Retorna a função para parar. */
  iniciar: () => () => void;
  recarregarPerfil: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => {
  async function carregarPerfil(session: Session | null) {
    if (!session) {
      set({ perfil: null });
      return;
    }
    try {
      set({ perfil: await buscarPerfil(session.user.id) });
    } catch {
      // Sem conexão: trata como sem perfil; a tela de @ permite tentar de novo.
      set({ perfil: null });
    }
  }

  return {
    carregando: true,
    session: null,
    perfil: undefined,

    iniciar: () => {
      // INITIAL_SESSION chega logo ao se inscrever, com a sessão salva no aparelho (ou null).
      const { data } = supabase.auth.onAuthStateChange((evento, session) => {
        const inicial = evento === 'INITIAL_SESSION';
        const mudouUsuario = get().session?.user.id !== session?.user.id;
        set({ session });

        // Só recarrega o perfil quando muda o usuário (não a cada renovação de token).
        if (!inicial && !mudouUsuario) return;
        if (!inicial) limparDadosLocais();
        set({ perfil: undefined });

        // Fora do callback: o Supabase recomenda não chamar a API dentro dele.
        setTimeout(async () => {
          await carregarPerfil(session);
          set({ carregando: false });
          // Envia sessões que ficaram na fila e traz os pontos do servidor.
          if (session) sincronizar(session.user.id);
        }, 0);
      });

      return () => data.subscription.unsubscribe();
    },

    recarregarPerfil: () => carregarPerfil(get().session),
  };
});
