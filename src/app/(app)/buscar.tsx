import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Campo } from '../../components/Campo';
import { LinhaPessoa } from '../../components/LinhaPessoa';
import { normalizarUsername } from '../../domain/usuario';
import { buscarPessoas, ErroSocial, type Pessoa } from '../../services/social';
import { useAuth } from '../../store/auth';
import { cores, espaco, tipografia } from '../../theme';

export default function TelaBuscar() {
  const router = useRouter();
  const meuId = useAuth((s) => s.session?.user.id);
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Busca 300 ms depois que a pessoa para de digitar.
  useEffect(() => {
    if (!meuId || termo.length === 0) {
      setResultados([]);
      setErro(null);
      return;
    }
    let cancelado = false;
    const espera = setTimeout(async () => {
      setCarregando(true);
      try {
        const pessoas = await buscarPessoas(termo, meuId);
        if (!cancelado) {
          setResultados(pessoas);
          setErro(null);
        }
      } catch (e) {
        if (!cancelado) setErro(e instanceof ErroSocial ? e.message : 'Algo deu errado.');
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [termo, meuId]);

  return (
    <SafeAreaView style={styles.tela} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={resultados}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <Campo
              rotulo="Procurar pelo @"
              prefixo="@"
              value={termo}
              onChangeText={(texto) => setTermo(normalizarUsername(texto))}
              placeholder="nome.de.usuario"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              maxLength={20}
            />
            {carregando ? <ActivityIndicator color={cores.primary} /> : null}
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          termo && !carregando && !erro ? (
            <Text style={styles.vazio}>Nenhuma foca encontrada com @{termo}. 🧊</Text>
          ) : (
            <Text style={styles.vazio}>Digite o começo do @ de alguém para encontrar e seguir.</Text>
          )
        }
        renderItem={({ item }) => (
          <LinhaPessoa username={item.username} onPress={() => router.push(`/usuario/${item.username}`)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.surface,
  },
  conteudo: {
    padding: espaco.margemMobile,
  },
  cabecalho: {
    gap: espaco.sm + 4,
    marginBottom: espaco.md,
  },
  erro: {
    ...tipografia.bodySm,
    color: cores.error,
  },
  vazio: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
    marginTop: espaco.md,
  },
});
