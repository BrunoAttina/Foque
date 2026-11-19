// Conquistas de Foco: textos, cores e progresso. Funções puras.
// Regras em Documentacao/conquistas.md; quem dá as conquistas é o servidor (migration 0010).

/** Moedas de cada conquista (fixa ou nível de personalizada). Igual à constante da migration 0010. */
export const MOEDAS_POR_CONQUISTA = 10;

export type CategoriaConquista = 'pontos' | 'focos' | 'variedade' | 'compras' | 'gasto' | 'colecao';

export const NOMES_DAS_CATEGORIAS: Record<CategoriaConquista, string> = {
  pontos: 'Pontos de foco',
  focos: 'Focos concluídos',
  variedade: 'Variedade',
  compras: 'Loja',
  gasto: 'Loja',
  colecao: 'Loja',
};

/** Cor de cada categoria das conquistas fixas. */
export const CORES_DAS_CATEGORIAS: Record<CategoriaConquista, string> = {
  pontos: '#38bdf8',
  focos: '#10b981',
  variedade: '#8b5cf6',
  compras: '#ff6b4a',
  gasto: '#ff6b4a',
  colecao: '#ff6b4a',
};

/** Cores dos níveis das conquistas por foco (coluna "cor" de niveis_conquista_foco). */
export const CORES_DOS_NIVEIS: Record<string, string> = {
  gelo: '#7dd3fc',
  bronze: '#cd7f32',
  prata: '#94a3b8',
  ouro: '#eab308',
  diamante: '#0ea5e9',
  aurora: '#8b5cf6',
  'arco-iris': '#ec4899',
};

/** Faixas do selo "arco-íris polar" (nível 7). */
export const FAIXAS_ARCO_IRIS = ['#38bdf8', '#10b981', '#eab308', '#ec4899', '#8b5cf6'];

export interface ConquistaFixa {
  id: string;
  categoria: CategoriaConquista;
  titulo: string;
  descricao: string;
  meta: number;
  icone: string;
  ordem: number;
}

export interface NivelFoco {
  nivel: number;
  meta: number;
  /** Vem antes do nome do foco: "Bom em". */
  titulo: string;
  cor: string;
}

export interface ConquistaFoco {
  chave: string;
  nome: string;
  quantidade: number;
  /** 0 = ainda sem conquista. */
  nivel: number;
  nivelEm: string | null;
}

/** Valores do usuário que as conquistas fixas usam (função meu_progresso_conquistas). */
export interface ProgressoConquistas {
  pontos: number;
  focos: number;
  variedade: number;
  compras: number;
  gasto: number;
  aparencias: number;
  aparenciasTotal: number;
}

/** Nome da conquista por foco: "Bom em ler livros". */
export function tituloDaConquistaFoco(nivel: NivelFoco, nomeDoFoco: string): string {
  return `${nivel.titulo} ${nomeDoFoco.toLowerCase()}`;
}

/** "Concluiu 25 focos de ler livros". */
export function descricaoDaConquistaFoco(quantidade: number, nomeDoFoco: string): string {
  return `Concluiu ${quantidade} ${quantidade === 1 ? 'foco' : 'focos'} de ${nomeDoFoco.toLowerCase()}`;
}

export function corDoNivel(nivel: NivelFoco | undefined): string {
  return (nivel && CORES_DOS_NIVEIS[nivel.cor]) ?? CORES_DOS_NIVEIS.gelo;
}

/** O nível atual e o próximo de uma conquista por foco. */
export function niveisDoFoco(niveis: NivelFoco[], conquista: ConquistaFoco) {
  const ordenados = [...niveis].sort((a, b) => a.nivel - b.nivel);
  return {
    atual: ordenados.find((n) => n.nivel === conquista.nivel),
    proximo: ordenados.find((n) => n.nivel > conquista.nivel),
  };
}

/** Quanto falta para uma conquista fixa: valor atual e meta. */
export function progressoDaFixa(conquista: ConquistaFixa, p: ProgressoConquistas): { valor: number; meta: number } {
  switch (conquista.categoria) {
    case 'pontos':
      return { valor: p.pontos, meta: conquista.meta };
    case 'focos':
      return { valor: p.focos, meta: conquista.meta };
    case 'variedade':
      return { valor: p.variedade, meta: conquista.meta };
    case 'compras':
      return { valor: p.compras, meta: conquista.meta };
    case 'gasto':
      return { valor: p.gasto, meta: conquista.meta };
    case 'colecao':
      return { valor: p.aparencias, meta: p.aparenciasTotal };
  }
}

/** Unidade do progresso de uma fixa: "32 de 50 pontos". */
export function unidadeDaCategoria(categoria: CategoriaConquista): string {
  switch (categoria) {
    case 'pontos':
      return 'pontos';
    case 'focos':
      return 'focos';
    case 'variedade':
      return 'tarefas';
    case 'compras':
      return 'compras';
    case 'gasto':
      return 'moedas';
    case 'colecao':
      return 'aparências';
  }
}
