import { Pressable, StyleSheet, Text, View } from 'react-native';

import { pts } from '../domain/mensagens';
import { cores, espaco, raio, tipografia } from '../theme';

interface OpcaoTempoProps {
  minutos: number;
  ativa: boolean;
  onPress: () => void;
}

/** Botão de duração em "bloco de gelo": minutos e os pontos que valem. Usado no cadastro de focos. */
export function OpcaoTempo({ minutos, ativa, onPress }: OpcaoTempoProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: ativa }}
      accessibilityLabel={`${minutos} minutos, ${pts(minutos)}`}
      style={[styles.base, { backgroundColor: ativa ? cores.arcticDeep : cores.surfaceContainerHighest }]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.face,
            { backgroundColor: ativa ? cores.primaryContainer : cores.surfaceContainerLowest },
            pressed ? { marginTop: 2, marginBottom: 1 } : { marginBottom: ativa ? 4 : 3 },
          ]}
        >
          <Text style={[styles.minutos, ativa && { color: cores.onPrimaryContainer }]}>{minutos}</Text>
          <Text style={[styles.min, ativa && { color: cores.onPrimaryContainer }]}>min</Text>
          <Text style={[styles.pts, ativa && styles.ptsAtivo]}>+{pts(minutos)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    borderRadius: raio.md,
  },
  face: {
    borderRadius: raio.md,
    alignItems: 'center',
    paddingVertical: espaco.sm + 2,
    borderWidth: 1,
    borderColor: cores.iceBorder,
  },
  minutos: {
    ...tipografia.headlineMd,
    color: cores.onSurface,
  },
  min: {
    ...tipografia.labelSm,
    color: cores.onSurfaceVariant,
  },
  pts: {
    ...tipografia.labelSm,
    color: cores.primary,
    marginTop: espaco.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  ptsAtivo: {
    color: cores.onPrimaryContainer,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: raio.full,
    overflow: 'hidden',
  },
});
