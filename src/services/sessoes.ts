// Histórico de sessões do usuário (só as próprias, pelo RLS).
import { supabase } from './supabase';

/** Quantas sessões concluídas o usuário logado já registrou no servidor. */
export async function contarSessoesConcluidas(): Promise<number | null> {
  const { count, error } = await supabase
    .from('focus_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'concluida');
  if (error) return null;
  return count ?? 0;
}
