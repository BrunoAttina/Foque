import { StyleSheet, View } from 'react-native';

import { cores, raio } from '../theme';

interface BarraProgressoProps {
  /** Progresso total, de 0 a 1. */
  fracao: number;
  altura?: number;
  /**
   * Parte do progresso que já existia antes (0 a 1, no máximo `fracao`).
   * Quando informada, esse trecho fica azul e só o restante (o ganho novo) fica menta.
   */
  fracaoAnterior?: number;
}

const limitar = (n: number) => Math.min(1, Math.max(0, n));

/** Barra de progresso: cápsula espessa, preenchimento menta sobre trilho de gelo. */
export function BarraProgresso({ fracao, altura = 16, fracaoAnterior }: BarraProgressoProps) {
  const total = limitar(fracao);
  const largura = `${Math.round(total * 100)}%` as const;

  if (fracaoAnterior !== undefined) {
    const anterior = Math.min(total, limitar(fracaoAnterior));
    return (
      <View
        style={[styles.trilho, { height: altura, padding: altura >= 14 ? 3 : 2 }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(total * 100) }}
      >
        <View style={[styles.doisTrechos, { width: largura }]}>
          <View style={[styles.trechoAnterior, { flex: anterior }]} />
          <View style={[styles.trechoNovo, { flex: total - anterior }]} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.trilho, { height: altura, padding: altura >= 14 ? 3 : 2 }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(fracao * 100) }}
    >
      <View style={[styles.preenchimento, { width: largura }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: {
    height: 16,
    backgroundColor: cores.iceTrack,
    borderRadius: raio.full,
    padding: 3,
    overflow: 'hidden',
  },
  doisTrechos: {
    height: '100%',
    minWidth: 10,
    flexDirection: 'row',
    borderRadius: raio.full,
    overflow: 'hidden',
  },
  trechoAnterior: {
    backgroundColor: cores.primaryContainer,
  },
  trechoNovo: {
    backgroundColor: cores.mint,
  },
  preenchimento: {
    height: '100%',
    minWidth: 10,
    backgroundColor: cores.mint,
    borderRadius: raio.full,
  },
});
