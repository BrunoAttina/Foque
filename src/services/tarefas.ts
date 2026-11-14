// Tarefas (focos) do usuário no Supabase. O RLS garante que cada um só acessa as próprias.
import type { Tarefa } from '../store/tarefas';
import { supabase } from './supabase';

export class ErroTarefas extends Error {}

interface LinhaTarefa {
  id: string;
  nome: string;
  duracao_minutos: number;
  repete_diariamente: boolean;
  concluida_em: string | null;
}

const COLUNAS = 'id, nome, duracao_minutos, repete_diariamente, concluida_em';

function paraTarefa(linha: LinhaTarefa): Tarefa {
  return {
    id: linha.id,
    nome: linha.nome,
    duracaoMinutos: linha.duracao_minutos,
    repeteDiariamente: linha.repete_diariamente,
    concluidaEm: linha.concluida_em,
  };
}

const SEM_CONEXAO = 'Não foi possível salvar. Verifique sua conexão e tente de novo.';

export async function listarTarefas(): Promise<Tarefa[]> {
  const { data, error } = await supabase.from('tasks').select(COLUNAS).order('created_at');
  if (error) throw new ErroTarefas('Não foi possível carregar as tarefas.');
  return (data as LinhaTarefa[]).map(paraTarefa);
}

export async function criarTarefa(
  nome: string,
  duracaoMinutos: number,
  repeteDiariamente: boolean,
): Promise<Tarefa> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ nome, duracao_minutos: duracaoMinutos, repete_diariamente: repeteDiariamente })
    .select(COLUNAS)
    .single();
  if (error) throw new ErroTarefas(SEM_CONEXAO);
  return paraTarefa(data as LinhaTarefa);
}

export async function removerTarefa(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw new ErroTarefas('Não foi possível remover. Verifique sua conexão e tente de novo.');
}

/** Marca o foco diário como feito no dia informado ("AAAA-MM-DD"). */
export async function marcarTarefaConcluida(id: string, dia: string): Promise<void> {
  const { error } = await supabase.from('tasks').update({ concluida_em: dia }).eq('id', id);
  if (error) throw new ErroTarefas(SEM_CONEXAO);
}
