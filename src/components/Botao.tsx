import { Pressable, StyleSheet, Text } from 'react-native';

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  desativado?: boolean;
}

export function Botao({ titulo, onPress, variante = 'primario', desativado = false }: BotaoProps) {
  const secundario = variante === 'secundario';
  return (
    <Pressable
      onPress={onPress}
      disabled={desativado}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        secundario ? styles.secundario : styles.primario,
        desativado && styles.desativado,
        pressed && styles.pressionado,
      ]}
    >
      <Text style={[styles.texto, secundario && styles.textoSecundario]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  primario: {
    backgroundColor: '#2563eb',
  },
  secundario: {
    backgroundColor: '#e5e7eb',
  },
  desativado: {
    opacity: 0.5,
  },
  pressionado: {
    opacity: 0.8,
  },
  texto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textoSecundario: {
    color: '#111827',
  },
});
