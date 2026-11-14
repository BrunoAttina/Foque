// Regras de validação de tarefas. Funções puras.

export const NOME_MAXIMO = 60;
export const DURACAO_MINIMA = 1;
export const DURACAO_MAXIMA = 240;

/** Durações sugeridas na tela Focar ("tempo de mergulho"). */
export const TEMPOS_SUGERIDOS = [15, 30, 45, 60] as const;

/** Missões sugeridas para quem ainda não tem tarefas. */
export const MISSOES_SUGERIDAS = ['Ler um livro', 'Codar', 'Estudar', 'Foco profundo'] as const;

const EMOJIS: [RegExp, string][] = [
  [/\b(ler|leitura|livro)/i, '📖'],
  [/\b(cod|program|dev)/i, '💻'],
  [/\b(estud|prova|aula|curso)/i, '✍️'],
  [/\b(trabalh|reuni|projeto)/i, '💼'],
  [/\b(exerc|trein|academia|corr)/i, '🏋️'],
  [/\b(medit|respir)/i, '🧘'],
  [/\b(escrev|redaç)/i, '📝'],
  [/\b(música|musica|instrumento|violão|piano)/i, '🎸'],
  [/\b(limp|arrum|casa)/i, '🧹'],
];

/** Emoji da missão pelo nome. Padrão: 🎯. */
export function emojiDaTarefa(nome: string): string {
  return EMOJIS.find(([regra]) => regra.test(nome))?.[1] ?? '🎯';
}

export type ResultadoValidacao =
  | { ok: true; nome: string; duracaoMinutos: number }
  | { ok: false; erro: string };

export function validarTarefa(nomeTexto: string, duracaoTexto: string): ResultadoValidacao {
  const nome = nomeTexto.trim();
  if (!nome) return { ok: false, erro: 'Dê um nome para o foco.' };
  if (nome.length > NOME_MAXIMO) {
    return { ok: false, erro: `O nome pode ter até ${NOME_MAXIMO} caracteres.` };
  }

  const texto = duracaoTexto.trim();
  if (!/^\d+$/.test(texto)) return { ok: false, erro: 'Informe a duração em minutos.' };

  const duracaoMinutos = Number(texto);
  if (duracaoMinutos < DURACAO_MINIMA || duracaoMinutos > DURACAO_MAXIMA) {
    return {
      ok: false,
      erro: `A duração deve ficar entre ${DURACAO_MINIMA} e ${DURACAO_MAXIMA} minutos.`,
    };
  }

  return { ok: true, nome, duracaoMinutos };
}

/** Opção de tempo da tela Focar mais próxima da duração informada (no empate, a maior). */
export function tempoSugeridoMaisProximo(minutos: number): number {
  let melhor: number = TEMPOS_SUGERIDOS[0];
  for (const opcao of TEMPOS_SUGERIDOS) {
    if (Math.abs(opcao - minutos) <= Math.abs(melhor - minutos)) melhor = opcao;
  }
  return melhor;
}
