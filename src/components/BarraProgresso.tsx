import { StyleSheet, View } from 'react-native';

import { cores, raio } from '../theme';

/** Barra de progresso: cápsula espessa, preenchimento menta sobre trilho de gelo. */
export function BarraProgresso({ fracao, altura = 16 }: { fracao: number; altura?: number }) {
  const largura = `${Math.round(Math.min(1, Math.max(0, fracao)) * 100)}%` as const;
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
  preenchimento: {
    height: '100%',
    minWidth: 10,
    backgroundColor: cores.mint,
    borderRadius: raio.full,
  },
});
