// Conquistas de Foco no Supabase (migration 0010). Só leitura: quem dá as conquistas é o servidor.
import type {
  CategoriaConquista,
  ConquistaFixa,
  ConquistaFoco,
  NivelFoco,
  ProgressoConquistas,
} from '../domain/conquistas';
import { supabase } from './supabase';

export class ErroConquistas extends Error {}

const SEM_CONEXAO = 'Não foi possível carregar as conquistas. Verifique sua conexão e tente de novo.';

export interface ObtidaFixa {
  conquistaId: string;
  obtidaEm: string;
}

export interface ConquistasDaPessoa {
  catalogo: ConquistaFixa[];
  niveis: NivelFoco[];
  obtidas: ObtidaFixa[];
  /** Do dono: todas, com o progresso. De outra pessoa: só as que já viraram conquista (RLS). */
  porFoco: ConquistaFoco[];
  /** Só para o usuário logado. */
  progresso: ProgressoConquistas | null;
}

interface LinhaFoco {
  chave: string;
  nome: string;
  quantidade: number;
  nivel: number;
  nivel_em: string | null;
}

function paraFoco(l: LinhaFoco): ConquistaFoco {
  return { chave: l.chave, nome: l.nome, quantidade: l.quantidade, nivel: l.nivel, nivelEm: l.nivel_em };
}

/** Catálogo, níveis e as conquistas de uma pessoa. `meu` também traz o progresso das que faltam. */
export async function buscarConquistas(userId: string, meu: boolean): Promise<ConquistasDaPessoa> {
  const [catalogo, niveis, obtidas, porFoco, progresso] = await Promise.all([
    supabase
      .from('conquistas')
      .select('id, categoria, titulo, descricao, meta, icone, ordem')
      .eq('ativa', true)
      .order('ordem'),
    supabase.from('niveis_conquista_foco').select('nivel, meta, titulo, cor').order('nivel'),
    supabase
      .from('conquistas_obtidas')
      .select('conquista_id, obtida_em')
      .eq('user_id', userId)
      .order('obtida_em', { ascending: false }),
    supabase
      .from('conquistas_foco')
      .select('chave, nome, quantidade, nivel, nivel_em')
      .eq('user_id', userId)
      .order('nivel', { ascending: false })
      .order('quantidade', { ascending: false }),
    meu ? supabase.rpc('meu_progresso_conquistas').maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  const erro = catalogo.error ?? niveis.error ?? obtidas.error ?? porFoco.error ?? progresso.error;
  if (erro) throw new ErroConquistas(SEM_CONEXAO);

  const p = progresso.data as Record<string, number> | null;
  return {
    catalogo: (catalogo.data ?? []).map((c) => ({ ...c, categoria: c.categoria as CategoriaConquista })),
    niveis: (niveis.data ?? []) as NivelFoco[],
    obtidas: (obtidas.data ?? []).map((o) => ({ conquistaId: o.conquista_id, obtidaEm: o.obtida_em })),
    porFoco: ((porFoco.data ?? []) as LinhaFoco[]).map(paraFoco),
    progresso: p
      ? {
          pontos: p.pontos,
          focos: p.focos,
          variedade: p.variedade,
          compras: p.compras,
          gasto: p.gasto,
          aparencias: p.aparencias,
          aparenciasTotal: p.aparencias_total,
        }
      : null,
  };
}

/** Conquista recém-ganha, para o destaque "Conquista desbloqueada". */
export interface ConquistaNova {
  chave: string;
  titulo: string;
  icone: string;
  cor: string;
  /** Moedas desta conquista (no nível que subiu várias vezes, soma os níveis). */
  moedas: number;
}

/** Conquistas que o app ainda não mostrou (vista = false) do usuário logado. Nunca lança. */
export async function buscarConquistasNovas(userId: string): Promise<{
  fixas: { conquista: ConquistaFixa; moedas: number }[];
  porFoco: ConquistaFoco[];
  niveis: NivelFoco[];
}> {
  const vazio = { fixas: [], porFoco: [], niveis: [] };
  try {
    const [fixas, porFoco, niveis] = await Promise.all([
      supabase
        .from('conquistas_obtidas')
        .select('moedas, conquista:conquistas(id, categoria, titulo, descricao, meta, icone, ordem)')
        .eq('user_id', userId)
        .eq('vista', false),
      supabase
        .from('conquistas_foco')
        .select('chave, nome, quantidade, nivel, nivel_em')
        .eq('user_id', userId)
        .eq('vista', false)
        .gte('nivel', 1),
      supabase.from('niveis_conquista_foco').select('nivel, meta, titulo, cor').order('nivel'),
    ]);
    if (fixas.error || porFoco.error || niveis.error) return vazio;
    type LinhaFixa = { moedas: number; conquista: ConquistaFixa | ConquistaFixa[] | null };
    return {
      fixas: ((fixas.data ?? []) as unknown as LinhaFixa[])
        .map((l) => ({ conquista: Array.isArray(l.conquista) ? l.conquista[0] : l.conquista, moedas: l.moedas }))
        .filter((l): l is { conquista: ConquistaFixa; moedas: number } => !!l.conquista),
      porFoco: ((porFoco.data ?? []) as LinhaFoco[]).map(paraFoco),
      niveis: (niveis.data ?? []) as NivelFoco[],
    };
  } catch {
    return vazio;
  }
}

/** Marca como vistas as conquistas já mostradas no destaque. Nunca lança. */
export async function marcarConquistasVistas(): Promise<void> {
  try {
    await supabase.rpc('marcar_conquistas_vistas');
  } catch {
    // Sem conexão: aparecem de novo no próximo resultado.
  }
}
