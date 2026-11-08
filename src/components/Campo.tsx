import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { cores, espaco, raio, rotuloSecao, tipografia } from '../theme';

interface CampoProps extends TextInputProps {
  rotulo: string;
  /** Texto fixo antes do campo, como "@". */
  prefixo?: string;
}

export function Campo({ rotulo, prefixo, style, ...props }: CampoProps) {
  return (
    <View style={styles.grupo}>
      <Text style={rotuloSecao}>{rotulo}</Text>
      <View style={styles.caixa}>
        {prefixo ? <Text style={styles.prefixo}>{prefixo}</Text> : null}
        <TextInput
          style={[styles.campo, style]}
          placeholderTextColor={cores.outline}
          accessibilityLabel={rotulo}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: {
    gap: espaco.xs + 2,
  },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: cores.iceBorder,
    borderRadius: raio.lg,
    paddingHorizontal: espaco.md,
    minHeight: 52,
  },
  prefixo: {
    ...tipografia.headlineSm,
    color: cores.primary,
    marginRight: 2,
  },
  campo: {
    flex: 1,
    ...tipografia.bodyLg,
    color: cores.onSurface,
    paddingVertical: espaco.sm + 4,
  },
});
