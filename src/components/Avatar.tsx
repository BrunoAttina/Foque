import { StyleSheet, Text, View } from 'react-native';

import { cores, fontes } from '../theme';

/** Círculo com a inicial do @ (até termos foto de perfil). */
export function Avatar({ username, tamanho = 32 }: { username: string; tamanho?: number }) {
  return (
    <View style={[styles.circulo, { width: tamanho, height: tamanho, borderRadius: tamanho / 2 }]}>
      <Text style={[styles.inicial, { fontSize: tamanho * 0.45 }]}>{username[0]?.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circulo: {
    backgroundColor: cores.primaryFixed,
    borderWidth: 2,
    borderColor: cores.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    fontFamily: fontes.outfitExtraBold,
    color: cores.primary,
  },
});
