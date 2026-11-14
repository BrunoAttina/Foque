// Status "focando agora": quem você segue vê quando você está numa sessão de foco.
// CONTRATO entre front-end e back-end. Assinaturas fixas; a implementação fica com o back-end.
// Ver Documentacao/status-de-foco.md e supabase/migrations/0004_foco_ativo.sql.
import { supabase } from './supabase';

/** Uma sessão de foco em andamento, como os seguidores a veem. */
export interface FocoAtivo {
  userId: string;
  username: string;
  /** Nome da tarefa (missão) em que a pessoa está focando. */
  tarefa: string;
  duracaoMinutos: number;
  /** Início da sessão, em ms (epoch). */
  inicio: number;
  /** Fim previsto da sessão, em ms (epoch). */
  fimPrevisto: number;
}

export class ErroFocoAtivo extends Error {}

/** Tempo máximo de cada escrita. Sem isso, uma conexão travada seguraria a fila. */
const TEMPO_LIMITE_MS = 10_000;

const COLUNAS =
  'user_id, tarefa, duracao_minutos, inicio, fim_previsto, perfil:profiles!focos_ativos_user_id_fkey(username)';

interface Linha {
  user_id: string;
  tarefa: string;
  duracao_minutos: number;
  inicio: string;
  fim_previsto: string;
  perfil: { username: string | null } | { username: string | null }[] | null;
}

/**
 * Fila das escritas: cada uma só começa quando a anterior termina.
 * Assim, quem inicia e cancela rápido não tem o "encerrar" chegando antes do "publicar".
 */
let fila: Promise<void> = Promise.resolve();

function enfileirar(escrita: (sinal: AbortSignal) => PromiseLike<unknown>): Promise<void> {
  const proxima = fila.then(async () => {
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
    try {
      await escrita(controle.signal);
    } catch {
      // Sem conexão ou tempo esgotado: a sessão segue; a linha some sozinha no fim previsto.
    } finally {
      clearTimeout(limite);
    }
  });
  fila = proxima;
  return proxima;
}

/**
 * Publica que a conta logada começou a focar. Chamado ao iniciar uma sessão.
 * Nunca lança: sem conexão, a sessão continua normalmente, só não aparece para os amigos.
 */
export async function publicarFocoAtivo(tarefa: string, duracaoMinutos: number): Promise<void> {
  await enfileirar((sinal) =>
    supabase
      .rpc('iniciar_foco', { p_tarefa: tarefa, p_duracao_minutos: duracaoMinutos })
      .abortSignal(sinal),
  );
}

/**
 * Remove o status da conta logada. Chamado ao concluir, cancelar ou sair da conta.
 * Nunca lança.
 */
export async function encerrarFocoAtivo(): Promise<void> {
  await enfileirar((sinal) => supabase.rpc('encerrar_foco').abortSignal(sinal));
}

function paraFocoAtivo(linha: Linha): FocoAtivo | null {
  const perfil = Array.isArray(linha.perfil) ? linha.perfil[0] : linha.perfil;
  if (!perfil?.username) return null;
  return {
    userId: linha.user_id,
    username: perfil.username,
    tarefa: linha.tarefa,
    duracaoMinutos: linha.duracao_minutos,
    inicio: Date.parse(linha.inicio),
    fimPrevisto: Date.parse(linha.fim_previsto),
  };
}

function falhou(): never {
  throw new ErroFocoAtivo('Não foi possível carregar quem está focando. Verifique sua conexão e tente de novo.');
}

/**
 * Pessoas que você segue e que estão focando agora (fim previsto no futuro), sem incluir você.
 * Ordenadas por quem termina primeiro. Lança ErroFocoAtivo se falhar.
 */
export async function listarFocandoAgora(): Promise<FocoAtivo[]> {
  let linhas: Linha[];
  try {
    // Lê a sessão guardada no aparelho; não vai à rede.
    const { data: auth } = await supabase.auth.getSession();
    const meuId = auth.session?.user.id;
    if (!meuId) return [];

    // O RLS já limita o resultado a quem eu sigo (e a mim, por isso o neq).
    const { data, error } = await supabase
      .from('focos_ativos')
      .select(COLUNAS)
      .gt('fim_previsto', new Date().toISOString())
      .neq('user_id', meuId)
      .order('fim_previsto', { ascending: true });
    if (error) falhou();
    linhas = (data ?? []) as unknown as Linha[];
  } catch {
    falhou();
  }
  return linhas.map(paraFocoAtivo).filter((foco): foco is FocoAtivo => foco !== null);
}

/**
 * Foco em andamento de uma pessoa, ou null se ela não está focando
 * (ou se você não a segue: o RLS esconde). Lança ErroFocoAtivo se falhar.
 */
export async function buscarFocoAtivo(userId: string): Promise<FocoAtivo | null> {
  let linha: Linha | null;
  try {
    const { data, error } = await supabase
      .from('focos_ativos')
      .select(COLUNAS)
      .eq('user_id', userId)
      .gt('fim_previsto', new Date().toISOString())
      .maybeSingle();
    if (error) falhou();
    linha = data as unknown as Linha | null;
  } catch {
    falhou();
  }
  return linha ? paraFocoAtivo(linha) : null;
}
