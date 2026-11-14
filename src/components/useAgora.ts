import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Relógio compartilhado da tela: devolve o horário atual (ms) e atualiza a cada 1 s.
 * Chame UMA vez por tela e passe o valor para as linhas e os cartões.
 * O intervalo só roda com `ativo` verdadeiro e com a tela em foco.
 */
export function useAgora(ativo = true): number {
  const [agora, setAgora] = useState(() => Date.now());

  useFocusEffect(
    useCallback(() => {
      if (!ativo) return;
      // Acerta o relógio na hora (o valor guardado pode ser de minutos atrás) e segue de 1 em 1 s.
      const acertar = () => setAgora(Date.now());
      acertar();
      const intervalo = setInterval(acertar, 1000);
      return () => clearInterval(intervalo);
    }, [ativo]),
  );

  return agora;
}
