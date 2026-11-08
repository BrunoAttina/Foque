import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, raio, tipografia } from '../theme';

type NomeIcone = ComponentProps<typeof MaterialIcons>['name'];

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  /** primario: azul ártico · acento: âmbar (urgência) · secundario: gelo · perigo: vermelho suave */
  variante?: 'primario' | 'acento' | 'secundario' | 'perigo';
  desativado?: boolean;
  icone?: NomeIcone;
  /** Botão grande, como o "Congelar tempo & focar". */
  grande?: boolean;
}

const VARIANTES = {
  primario: { face: cores.primaryContainer, base: cores.arcticDeep, texto: cores.onPrimaryContainer },
  acento: { face: cores.amber, base: cores.amberDeep, texto: '#ffffff' },
  secundario: { face: cores.surfaceContainerLowest, base: cores.surfaceContainerHighest, texto: cores.primary },
  perigo: { face: cores.errorContainer, base: '#f5b5ae', texto: cores.onErrorContainer },
};

const RELEVO = 4; // altura da base em relevo
const AFUNDA = 3; // quanto a face desce ao tocar

/**
 * Botão "3D chunky" do design.md: face colorida sobre uma base mais escura.
 * Ao tocar, a face desce 3 px e a base fica com 1 px, como um clique físico.
 */
export function Botao({ titulo, onPress, variante = 'primario', desativado = false, icone, grande }: BotaoProps) {
  const cor = VARIANTES[variante];
  return (
    <Pressable
      onPress={onPress}
      disabled={desativado}
      accessibilityRole="button"
      accessibilityState={{ disabled: desativado }}
      style={[styles.base, { backgroundColor: cor.base }, desativado && styles.desativado]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.face,
            grande && styles.faceGrande,
            { backgroundColor: cor.face },
            pressed && !desativado
              ? { marginTop: AFUNDA, marginBottom: RELEVO - AFUNDA }
              : { marginTop: 0, marginBottom: RELEVO },
          ]}
        >
          {icone ? <MaterialIcons name={icone} size={grande ? 24 : 20} color={cor.texto} /> : null}
          <Text
            style={[grande ? styles.textoGrande : styles.texto, { color: cor.texto }]}
            numberOfLines={2}
          >
            {titulo}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: raio.full,
  },
  face: {
    minHeight: 48,
    borderRadius: raio.full,
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
  },
  faceGrande: {
    minHeight: 64,
    paddingVertical: espaco.md,
  },
  texto: {
    ...tipografia.labelLg,
    textAlign: 'center',
  },
  textoGrande: {
    ...tipografia.headlineSm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    flexShrink: 1,
  },
  desativado: {
    opacity: 0.5,
  },
});
