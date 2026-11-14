// Regras de validação de tarefas. Funções puras.

export const NOME_MAXIMO = 60;
/** Durações possíveis de um foco, em minutos: no cadastro (aba Focos) e no "Tempo de Foco" (tela Focar). */
export const TEMPOS_SUGERIDOS = [15, 30, 45, 60] as const;
export const TEMPO_PADRAO = 30;

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

export function validarTarefa(nomeTexto: string, duracaoMinutos: number): ResultadoValidacao {
  const nome = nomeTexto.trim();
  if (!nome) return { ok: false, erro: 'Dê um nome para o foco.' };
  if (nome.length > NOME_MAXIMO) {
    return { ok: false, erro: `O nome pode ter até ${NOME_MAXIMO} caracteres.` };
  }

  if (!(TEMPOS_SUGERIDOS as readonly number[]).includes(duracaoMinutos)) {
    return { ok: false, erro: `Escolha uma duração: ${TEMPOS_SUGERIDOS.join(', ')} minutos.` };
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

/** Dia no calendário do aparelho, como "AAAA-MM-DD". */
export function diaLocal(agora: number): string {
  const d = new Date(agora);
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

/** O foco diário já foi concluído hoje? Focos de uma vez nunca ficam "feitos": são apagados. */
export function feitaHoje(
  tarefa: { repeteDiariamente: boolean; concluidaEm: string | null },
  agora: number,
): boolean {
  return tarefa.repeteDiariamente && tarefa.concluidaEm === diaLocal(agora);
}
