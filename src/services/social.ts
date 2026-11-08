// Busca de pessoas, seguir e progresso de quem você segue.
// O que cada um pode ver é garantido pelo RLS (supabase/migrations/0001_usuarios_e_seguidores.sql).
import { supabase } from './supabase';

export interface Pessoa {
  id: string;
  username: string;
}

export interface PessoaComProgresso extends Pessoa {
  pontosTotais: number;
}

export class ErroSocial extends Error {}

function falhou(error: { code?: string } | null): never | void {
  if (error) throw new ErroSocial('Não foi possível carregar. Verifique sua conexão e tente de novo.');
}

/** Escapa os curingas do LIKE ("_" é válido no @, então precisa ser literal). */
function escaparLike(texto: string) {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Pessoas cujo @ começa com o termo, sem incluir você. */
export async function buscarPessoas(termo: string, meuId: string): Promise<Pessoa[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', `${escaparLike(termo)}%`)
    .neq('id', meuId)
    .order('username')
    .limit(20);
  falhou(error);
  return (data ?? []) as Pessoa[];
}

export async function buscarPessoaPorUsername(username: string): Promise<Pessoa | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .maybeSingle();
  falhou(error);
  return data as Pessoa | null;
}

export async function estouSeguindo(meuId: string, outroId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', meuId)
    .eq('following_id', outroId)
    .maybeSingle();
  falhou(error);
  return data !== null;
}

export async function seguir(meuId: string, outroId: string): Promise<void> {
  const { error } = await supabase.from('follows').insert({ follower_id: meuId, following_id: outroId });
  // 23505: já seguia (toque duplo, por exemplo). Não é erro para a pessoa.
  if (error && error.code !== '23505') falhou(error);
}

export async function deixarDeSeguir(meuId: string, outroId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', meuId)
    .eq('following_id', outroId);
  falhou(error);
}

/** Pontos de foco de alguém. null se você não pode ver (não segue a pessoa). */
export async function buscarPontos(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('progress')
    .select('pontos_totais')
    .eq('user_id', userId)
    .maybeSingle();
  falhou(error);
  return data ? (data.pontos_totais as number) : null;
}

/** Quem você segue, com os pontos de cada um. */
export async function listarSeguindo(meuId: string): Promise<PessoaComProgresso[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('perfil:profiles!follows_following_id_fkey(id, username, progress(pontos_totais))')
    .eq('follower_id', meuId)
    .order('created_at', { ascending: false });
  falhou(error);

  type Linha = {
    perfil: {
      id: string;
      username: string | null;
      progress: { pontos_totais: number } | { pontos_totais: number }[] | null;
    } | null;
  };

  return ((data ?? []) as unknown as Linha[])
    .filter((linha) => linha.perfil?.username)
    .map(({ perfil }) => {
      const progresso = Array.isArray(perfil!.progress) ? perfil!.progress[0] : perfil!.progress;
      return {
        id: perfil!.id,
        username: perfil!.username!,
        pontosTotais: progresso?.pontos_totais ?? 0,
      };
    });
}
