// Regras de validação de tarefas. Funções puras.

export const NOME_MAXIMO = 60;
export const DURACAO_MINIMA = 1;
export const DURACAO_MAXIMA = 240;

export type ResultadoValidacao =
  | { ok: true; nome: string; duracaoMinutos: number }
  | { ok: false; erro: string };

export function validarTarefa(nomeTexto: string, duracaoTexto: string): ResultadoValidacao {
  const nome = nomeTexto.trim();
  if (!nome) return { ok: false, erro: 'Dê um nome para a tarefa.' };
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
