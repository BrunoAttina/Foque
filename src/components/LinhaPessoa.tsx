import { Pressable, StyleSheet, Text, View } from 'react-native';

interface LinhaPessoaProps {
  username: string;
  /** Texto abaixo do @, como "Nível de foco 3 · 200 pontos de foco". */
  detalhe?: string;
  onPress: () => void;
}

export function LinhaPessoa({ username, detalhe, onPress }: LinhaPessoaProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir perfil de @${username}`}
      style={({ pressed }) => [styles.linha, pressed && styles.pressionada]}
    >
      <View style={styles.avatar}>
        <Text style={styles.inicial}>{username[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.textos}>
        <Text style={styles.username}>@{username}</Text>
        {detalhe ? <Text style={styles.detalhe}>{detalhe}</Text> : null}
      </View>
      <Text style={styles.seta}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  pressionada: {
    opacity: 0.6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  username: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  detalhe: {
    fontSize: 14,
    color: '#6b7280',
  },
  seta: {
    fontSize: 24,
    color: '#9ca3af',
  },
});
