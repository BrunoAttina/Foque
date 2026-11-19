// Histórico de sessões do usuário (só as próprias, pelo RLS).
import { supabase } from './supabase';

export class ErroHistorico extends Error {}

/** Um foco concluído, como aparece no histórico. */
export interface FocoRealizado {
  id: string;
  tarefa: string;
  duracaoMinutos: number;
  /** Início e fim em ms. */
  inicio: number;
  fim: number;
  pontos: number;
}

interface LinhaSessao {
  id: string;
  tarefa: string;
  duracao_minutos: number;
  inicio: string;
  fim: string;
  pontos: number;
}

/** Tamanho de cada página do histórico. */
export const PAGINA_HISTORICO = 30;

/**
 * Focos concluídos do usuário logado, do mais recente para o mais antigo.
 * `antesDe` (ISO) busca a página seguinte: só os que terminaram antes desse instante.
 */
export async function listarFocosRealizados(antesDe?: string): Promise<FocoRealizado[]> {
  let consulta = supabase
    .from('focus_sessions')
    .select('id, tarefa, duracao_minutos, inicio, fim, pontos')
    .eq('status', 'concluida')
    .order('fim', { ascending: false })
    .limit(PAGINA_HISTORICO);
  if (antesDe) consulta = consulta.lt('fim', antesDe);
  const { data, error } = await consulta;
  if (error) throw new ErroHistorico('Não foi possível carregar o histórico. Verifique sua conexão e tente de novo.');
  return (data as LinhaSessao[]).map((linha) => ({
    id: linha.id,
    tarefa: linha.tarefa,
    duracaoMinutos: linha.duracao_minutos,
    inicio: Date.parse(linha.inicio),
    fim: Date.parse(linha.fim),
    pontos: linha.pontos,
  }));
}

/** Quantas sessões concluídas o usuário logado já registrou no servidor. */
export async function contarSessoesConcluidas(): Promise<number | null> {
  const { count, error } = await supabase
    .from('focus_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'concluida');
  if (error) return null;
  return count ?? 0;
}
