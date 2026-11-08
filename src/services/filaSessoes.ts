// Fila offline de sessões no SQLite do aparelho.
// Cada sessão fica aqui até o servidor confirmar o registro (registrar_sessao).
import * as SQLite from 'expo-sqlite';

import { supabase } from './supabase';

export interface SessaoFinalizada {
  id: string;
  userId: string;
  tarefa: string;
  duracaoMinutos: number;
  /** ISO 8601 */
  inicio: string;
  /** ISO 8601 */
  fim: string;
  status: 'concluida' | 'cancelada';
}

interface LinhaFila {
  id: string;
  user_id: string;
  tarefa: string;
  duracao_minutos: number;
  inicio: string;
  fim: string;
  status: 'concluida' | 'cancelada';
}

// Erros de dado inválido: o servidor nunca vai aceitar, então a sessão é descartada.
const ERROS_DEFINITIVOS = new Set(['22023', '23502', '23505', '23514']);

let banco: Promise<SQLite.SQLiteDatabase> | null = null;

function abrirBanco() {
  if (!banco) {
    banco = (async () => {
      const db = await SQLite.openDatabaseAsync('foque.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS fila_sessoes (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          tarefa TEXT NOT NULL,
          duracao_minutos INTEGER NOT NULL,
          inicio TEXT NOT NULL,
          fim TEXT NOT NULL,
          status TEXT NOT NULL
        );
      `);
      return db;
    })();
  }
  return banco;
}

export async function enfileirar(sessao: SessaoFinalizada): Promise<void> {
  const db = await abrirBanco();
  await db.runAsync(
    `INSERT OR IGNORE INTO fila_sessoes (id, user_id, tarefa, duracao_minutos, inicio, fim, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    sessao.id,
    sessao.userId,
    sessao.tarefa,
    sessao.duracaoMinutos,
    sessao.inicio,
    sessao.fim,
    sessao.status,
  );
}

/** Pontos das sessões concluídas que ainda não chegaram ao servidor. */
export async function pontosPendentes(userId: string): Promise<number> {
  const db = await abrirBanco();
  const linha = await db.getFirstAsync<{ total: number | null }>(
    `SELECT SUM(duracao_minutos) AS total FROM fila_sessoes WHERE user_id = ? AND status = 'concluida'`,
    userId,
  );
  return linha?.total ?? 0;
}

let envioEmAndamento: Promise<void> | null = null;

/**
 * Envia as sessões pendentes do usuário, da mais antiga para a mais nova.
 * Para no primeiro erro de rede (tenta de novo depois).
 */
export function enviarPendentes(userId: string): Promise<void> {
  if (!envioEmAndamento) {
    envioEmAndamento = (async () => {
      const db = await abrirBanco();
      // Só as do usuário logado: o servidor credita os pontos a quem envia.
      const linhas = await db.getAllAsync<LinhaFila>(
        'SELECT * FROM fila_sessoes WHERE user_id = ? ORDER BY inicio',
        userId,
      );
      for (const linha of linhas) {
        const { error } = await supabase.rpc('registrar_sessao', {
          p_id: linha.id,
          p_tarefa: linha.tarefa,
          p_duracao_minutos: linha.duracao_minutos,
          p_inicio: linha.inicio,
          p_fim: linha.fim,
          p_status: linha.status,
        });
        if (error && !ERROS_DEFINITIVOS.has(error.code ?? '')) {
          return; // Sem conexão ou erro temporário: mantém na fila.
        }
        await db.runAsync('DELETE FROM fila_sessoes WHERE id = ?', linha.id);
      }
    })().finally(() => {
      envioEmAndamento = null;
    });
  }
  return envioEmAndamento;
}
