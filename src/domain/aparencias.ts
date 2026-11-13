// Aparências do Foque e os momentos (estados) em que ele aparece. Funções puras.
// As imagens de cada aparência ficam em src/components/imagensFoque.ts.

/** Momento em que o Foque aparece. Cada aparência tem uma animação para cada um. */
export type EstadoFoque =
  | 'parada' // telas Focar e Foque
  | 'acenando' // entrar, cadastro, escolher @
  | 'focando' // sessão rodando
  | 'comemorando' // sessão concluída
  | 'triste'; // gelo quebrado

export const APARENCIAS = [
  { id: 'padrao', nome: 'Clássico', descricao: 'O Foque de sempre. Exigente na medida.' },
  { id: 'bebe', nome: 'Bebê', descricao: 'Fofo demais pra julgar alguém. Quase.' },
  { id: 'careca', nome: 'Careca', descricao: 'De cachecol e pouca paciência.' },
  { id: 'ninja', nome: 'Ninja', descricao: 'Some junto com as suas distrações.' },
  { id: 'princesa', nome: 'Princesa', descricao: 'Coroa, pérolas e zero tolerância a TikTok.' },
] as const;

export type AparenciaId = (typeof APARENCIAS)[number]['id'];

export const APARENCIA_PADRAO: AparenciaId = 'padrao';

export function ehAparencia(valor: unknown): valor is AparenciaId {
  return APARENCIAS.some((a) => a.id === valor);
}

export function dadosDaAparencia(id: AparenciaId) {
  return APARENCIAS.find((a) => a.id === id) ?? APARENCIAS[0];
}
