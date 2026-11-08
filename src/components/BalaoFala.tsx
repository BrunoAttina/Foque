import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, raio, tipografia } from '../theme';

/** Balão de fala do Foque, com a ponta apontando para o mascote logo abaixo. */
export function BalaoFala({ texto }: { texto: string }) {
  return (
    <View style={styles.area}>
      <View style={styles.balao}>
        <Text style={styles.texto}>“{texto}”</Text>
      </View>
      <View style={styles.ponta} />
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  balao: {
    width: '100%',
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: raio.xl,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.md,
    shadowColor: cores.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
    zIndex: 1,
  },
  ponta: {
    width: 16,
    height: 16,
    backgroundColor: cores.surfaceContainerLowest,
    transform: [{ rotate: '45deg' }],
    marginTop: -9,
    elevation: 4,
    zIndex: 2,
  },
  texto: {
    ...tipografia.headlineSm,
    color: cores.onSurface,
    textAlign: 'center',
  },
});
