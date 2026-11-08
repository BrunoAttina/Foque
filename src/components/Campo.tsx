import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

interface CampoProps extends TextInputProps {
  rotulo: string;
  /** Texto fixo antes do campo, como "@". */
  prefixo?: string;
}

export function Campo({ rotulo, prefixo, style, ...props }: CampoProps) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={styles.caixa}>
        {prefixo ? <Text style={styles.prefixo}>{prefixo}</Text> : null}
        <TextInput
          style={[styles.campo, style]}
          placeholderTextColor="#9ca3af"
          accessibilityLabel={rotulo}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: {
    gap: 6,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  prefixo: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 2,
  },
  campo: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
});
