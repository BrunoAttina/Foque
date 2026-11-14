import { create } from 'zustand';

import { novoUuid } from '../domain/id';
import { pontosDaSessao } from '../domain/pontos';
import { encerrarFocoAtivo, publicarFocoAtivo } from '../services/focoAtivo';
import { useLoja } from './loja';
import { type Tarefa, useTarefas } from './tarefas';

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
    // Avisa os seguidores, em segundo plano. Nunca lança e não segura a tela.
    void publicarFocoAtivo(tarefa.nome, tarefa.duracaoMinutos);
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
    void encerrarFocoAtivo();
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
    // Cada ponto vale uma moeda. Também otimista; o saldo do servidor substitui depois.
    useLoja.setState((estado) => ({ moedas: estado.moedas + ganhos }));
    // O foco de uma vez sai da lista; o diário fica marcado como feito hoje.
    useTarefas.getState().concluir(tarefa.id, Date.now());
    void encerrarFocoAtivo();
  },
}));
