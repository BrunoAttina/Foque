import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Campo } from '../../components/Campo';
import { LinhaPessoa } from '../../components/LinhaPessoa';
import { normalizarUsername } from '../../domain/usuario';
import { buscarPessoas, ErroSocial, type Pessoa } from '../../services/social';
import { useAuth } from '../../store/auth';

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
            {carregando ? <ActivityIndicator /> : null}
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          termo && !carregando && !erro ? (
            <Text style={styles.vazio}>Ninguém encontrado com @{termo}.</Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <LinhaPessoa username={item.username} onPress={() => router.push(`/perfil/${item.username}`)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#fff',
  },
  conteudo: {
    padding: 16,
  },
  cabecalho: {
    gap: 12,
    marginBottom: 8,
  },
  erro: {
    color: '#b91c1c',
  },
  vazio: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
});
