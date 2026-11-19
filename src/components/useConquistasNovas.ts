import { useEffect, useState } from 'react';

import {
  CORES_DAS_CATEGORIAS,
  corDoNivel,
  MOEDAS_POR_CONQUISTA,
  niveisDoFoco,
  tituloDaConquistaFoco,
} from '../domain/conquistas';
import { buscarConquistasNovas, type ConquistaNova, marcarConquistasVistas } from '../services/conquistas';
import { enviarPendentes } from '../services/filaSessoes';
import { useLoja } from '../store/loja';

/** Tentativas de buscar as conquistas novas depois da sessão (o envio corre em segundo plano). */
const TENTATIVAS = 4;
const INTERVALO_MS = 1500;

/**
 * Conquistas ganhas que ainda não foram mostradas, para o destaque da tela de resultado.
 * Envia a fila antes de buscar e tenta algumas vezes, porque a sessão acabou de ser enfileirada.
 * Depois de mostrar, marca como vistas e atualiza o saldo de moedas.
 */
export function useConquistasNovas(userId: string | undefined, ativo: boolean): ConquistaNova[] {
  const [novas, setNovas] = useState<ConquistaNova[]>([]);

  useEffect(() => {
    if (!userId || !ativo) return;
    let cancelado = false;

    (async () => {
      for (let tentativa = 0; tentativa < TENTATIVAS && !cancelado; tentativa++) {
        if (tentativa > 0) await new Promise((r) => setTimeout(r, INTERVALO_MS));
        await enviarPendentes(userId).catch(() => undefined);
        const { fixas, porFoco, niveis } = await buscarConquistasNovas(userId);
        if (cancelado) return;
        if (fixas.length === 0 && porFoco.length === 0) continue;

        const lista: ConquistaNova[] = [
          ...porFoco.map((foco) => {
            const { atual } = niveisDoFoco(niveis, foco);
            return {
              chave: `foco-${foco.chave}`,
              titulo: atual ? tituloDaConquistaFoco(atual, foco.nome) : foco.nome,
              icone: 'emoji-events',
              cor: corDoNivel(atual),
              moedas: MOEDAS_POR_CONQUISTA,
            };
          }),
          ...fixas.map(({ conquista, moedas }) => ({
            chave: `fixa-${conquista.id}`,
            titulo: conquista.titulo,
            icone: conquista.icone,
            cor: CORES_DAS_CATEGORIAS[conquista.categoria],
            moedas,
          })),
        ];
        setNovas(lista);
        await marcarConquistasVistas();
        // As moedas das conquistas entraram na carteira no servidor.
        void useLoja.getState().carregar(userId);
        return;
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [userId, ativo]);

  return novas;
}
