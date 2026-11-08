// Liga a fila offline, o servidor e os pontos mostrados no app.
import { useSessao } from '../store/sessao';
import { enfileirar, enviarPendentes, pontosPendentes, type SessaoFinalizada } from './filaSessoes';
import { buscarPontos } from './social';

/** Guarda a sessão na fila e tenta enviar na hora. */
export async function registrarSessaoFinalizada(sessao: SessaoFinalizada): Promise<void> {
  try {
    await enfileirar(sessao);
  } catch {
    return; // Sem SQLite não há o que fazer; a sessão já foi mostrada na tela.
  }
  await sincronizar(sessao.userId);
}

/** Envia o que estiver pendente e atualiza os pontos com o valor do servidor. */
export async function sincronizar(userId: string): Promise<void> {
  try {
    await enviarPendentes(userId);
  } catch {
    // Sem conexão: fica para a próxima.
  }
  await atualizarPontos(userId);
}

/** Pontos = confirmados no servidor + concluídos ainda na fila. */
async function atualizarPontos(userId: string): Promise<void> {
  try {
    const [doServidor, pendentes] = await Promise.all([buscarPontos(userId), pontosPendentes(userId)]);
    if (doServidor === null) return;
    useSessao.setState({ pontosTotais: doServidor + pendentes });
  } catch {
    // Sem conexão: mantém os pontos que já estão na tela.
  }
}
