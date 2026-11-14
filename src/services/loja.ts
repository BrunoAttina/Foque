// Loja: saldo de moedas, itens à venda e compras.
// Preços e saldo ficam no servidor (supabase/migrations/0005_loja_e_moedas.sql).
import { supabase } from './supabase';

export interface ItemLoja {
  id: string;
  tipo: 'aparencia' | 'acessorio';
  preco: number;
}

export interface DadosLoja {
  moedas: number;
  itens: ItemLoja[];
  /** Ids dos itens já comprados. */
  comprados: string[];
}

export type MotivoErroLoja = 'conexao' | 'moedas' | 'ja-comprado' | 'invalido';

export class ErroLoja extends Error {
  constructor(
    public motivo: MotivoErroLoja,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

const SEM_CONEXAO = 'Não foi possível falar com a loja. Verifique sua conexão e tente de novo.';

/** Saldo, itens e compras da conta logada. Lança ErroLoja('conexao') se falhar. */
export async function buscarLoja(userId: string): Promise<DadosLoja> {
  const [carteira, itens, compras] = await Promise.all([
    supabase.from('carteiras').select('moedas').eq('user_id', userId).maybeSingle(),
    supabase.from('loja_itens').select('id, tipo, preco').eq('ativo', true).order('ordem'),
    supabase.from('compras').select('item_id').eq('user_id', userId),
  ]);
  if (carteira.error || itens.error || compras.error) throw new ErroLoja('conexao', SEM_CONEXAO);

  return {
    // Sem carteira ainda (conta nova, sem pontos): saldo zero.
    moedas: carteira.data?.moedas ?? 0,
    itens: (itens.data ?? []) as ItemLoja[],
    comprados: (compras.data ?? []).map((c) => c.item_id as string),
  };
}

/** Compra um item. Devolve o saldo do servidor depois da compra. */
export async function comprarItem(itemId: string): Promise<number> {
  let resposta;
  try {
    resposta = await supabase.rpc('comprar_item', { p_item_id: itemId });
  } catch {
    throw new ErroLoja('conexao', SEM_CONEXAO);
  }
  const { data, error } = resposta;
  if (error) {
    if (error.code === 'P0001') throw new ErroLoja('moedas', 'Moedas insuficientes. Bora focar mais um pouco. 🐟');
    if (error.code === '23505') throw new ErroLoja('ja-comprado', 'Você já tem este item.');
    if (error.code === '22023') throw new ErroLoja('invalido', 'Este item não está mais à venda.');
    throw new ErroLoja('conexao', SEM_CONEXAO);
  }
  return data as number;
}
