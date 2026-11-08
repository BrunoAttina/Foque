import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme';

interface MascoteProps {
  /** Diâmetro em pixels. */
  tamanho?: number;
  /** Emoji provisório até termos a arte da foca. */
  emoji?: string;
}

/**
 * Foque, a foca. Placeholder com emoji e um brilho pulsando por trás.
 * Trocar o emoji pela imagem do mascote quando a arte existir.
 */
export function Mascote({ tamanho = 160, emoji = '🦭' }: MascoteProps) {
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    );
    animacao.start();
    return () => animacao.stop();
  }, [pulso]);

  const escalaBrilho = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.05] });
  const opacidadeBrilho = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.6] });

  return (
    <View style={[styles.area, { width: tamanho * 1.1, height: tamanho * 1.1 }]} accessibilityLabel="Foque, a foca">
      <Animated.View
        style={[
          styles.brilho,
          {
            width: tamanho,
            height: tamanho,
            borderRadius: tamanho / 2,
            opacity: opacidadeBrilho,
            transform: [{ scale: escalaBrilho }],
          },
        ]}
      />
      <Text style={{ fontSize: tamanho * 0.55 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brilho: {
    position: 'absolute',
    backgroundColor: cores.primaryFixedDim,
  },
});
