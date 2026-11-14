import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, raio, tipografia } from '../theme';

type NomeIcone = ComponentProps<typeof MaterialIcons>['name'];

interface ChipProps {
  texto: string;
  icone?: NomeIcone;
  corIcone?: string;
  /** Emoji no lugar do ícone. */
  emoji?: string;
  ativo?: boolean;
  onPress?: () => void;
}

/** Pílula com ícone e texto em negrito (badges do cabeçalho, atalhos de missão). */
export function Chip({ texto, icone, corIcone = cores.primary, emoji, ativo, onPress }: ChipProps) {
  const conteudo = (
    <View style={[styles.chip, ativo && styles.ativo]}>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      {icone ? <MaterialIcons name={icone} size={18} color={ativo ? cores.onPrimaryContainer : corIcone} /> : null}
      <Text style={[styles.texto, ativo && styles.textoAtivo]}>{texto}</Text>
    </View>
  );

  if (!onPress) return conteudo;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      style={({ pressed }) => pressed && styles.pressionado}
    >
      {conteudo}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.xs,
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: raio.full,
    borderWidth: 1.5,
    borderColor: cores.iceBorder,
    paddingHorizontal: espaco.sm + 4,
    paddingVertical: 6,
    shadowColor: cores.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 1,
  },
  ativo: {
    backgroundColor: cores.primaryContainer,
    borderColor: cores.arcticDeep,
  },
  pressionado: {
    transform: [{ scale: 0.95 }],
  },
  emoji: {
    fontSize: 14,
  },
  texto: {
    ...tipografia.labelMd,
    color: cores.onSurface,
  },
  textoAtivo: {
    color: cores.onPrimaryContainer,
  },
});
