// Histórico de focos: agrupamento por dia e textos de data. Funções puras.
import { diaLocal } from './tarefas';

const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
const DIAS_DA_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** "Hoje", "Ontem", "Quarta, 12 de nov." ou, em outro ano, "12 de nov. de 2025". */
export function tituloDoDia(dia: string, agora: number): string {
  if (dia === diaLocal(agora)) return 'Hoje';
  if (dia === diaLocal(agora - 24 * 60 * 60 * 1000)) return 'Ontem';
  const [ano, mes, numero] = dia.split('-').map(Number);
  const data = new Date(ano, mes - 1, numero);
  const base = `${numero} de ${MESES[mes - 1]}`;
  if (ano !== new Date(agora).getFullYear()) return `${base} de ${ano}`;
  const semana = DIAS_DA_SEMANA[data.getDay()];
  return `${semana[0].toUpperCase()}${semana.slice(1)}, ${base}`;
}

/** Hora local "14:05". */
export function horaLocal(instante: number): string {
  const d = new Date(instante);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Agrupa itens já ordenados do mais recente para o mais antigo, por dia local. */
export function agruparPorDia<T extends { fim: number }>(itens: T[]): { dia: string; itens: T[] }[] {
  const grupos: { dia: string; itens: T[] }[] = [];
  for (const item of itens) {
    const dia = diaLocal(item.fim);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.dia === dia) ultimo.itens.push(item);
    else grupos.push({ dia, itens: [item] });
  }
  return grupos;
}
