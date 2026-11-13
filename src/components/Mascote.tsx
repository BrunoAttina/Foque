import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import type { AparenciaId, EstadoFoque } from '../domain/aparencias';
import { useAparenciaAtual } from '../store/aparencia';
import { cores } from '../theme';
import { IMAGENS_FOQUE } from './imagensFoque';

interface MascoteProps {
  /** Largura e altura da arte, em pixels. */
  tamanho?: number;
  /** Momento: escolhe a animação. */
  estado?: EstadoFoque;
  /** Força uma aparência (ex.: prévia na escolha). Sem isso, usa a da conta. */
  aparencia?: AparenciaId;
}

/** Foque, a foca: GIF animado da aparência escolhida, com um brilho pulsando por trás. */
export function Mascote({ tamanho = 160, estado = 'parada', aparencia }: MascoteProps) {
  const daConta = useAparenciaAtual();
  const fonte = IMAGENS_FOQUE[aparencia ?? daConta][estado];
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
  const opacidadeBrilho = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.45] });
  const brilho = tamanho * 0.8;

  return (
    <View
      style={[styles.area, { width: tamanho, height: tamanho }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Foque, a foca"
    >
      <Animated.View
        style={[
          styles.brilho,
          {
            width: brilho,
            height: brilho,
            borderRadius: brilho / 2,
            opacity: opacidadeBrilho,
            transform: [{ scale: escalaBrilho }],
          },
        ]}
      />
      <Image source={fonte} style={{ width: tamanho, height: tamanho }} contentFit="contain" autoplay />
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
