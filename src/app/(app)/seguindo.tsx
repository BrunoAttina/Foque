import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../components/Botao';
import { LinhaPessoa } from '../../components/LinhaPessoa';
import { pontosDeFoco } from '../../domain/mensagens';
import { nivelPorPontos } from '../../domain/pontos';
import { ErroSocial, listarSeguindo, type PessoaComProgresso } from '../../services/social';
import { useAuth } from '../../store/auth';

export default function TelaSeguindo() {
  const router = useRouter();
  const meuId = useAuth((s) => s.session?.user.id);
  const [pessoas, setPessoas] = useState<PessoaComProgresso[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!meuId) return;
    try {
      setPessoas(await listarSeguindo(meuId));
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroSocial ? e.message : 'Algo deu errado.');
    }
  }, [meuId]);

  // Recarrega ao voltar para a tela (ex.: depois de seguir alguém no perfil).
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  return (
    <SafeAreaView style={styles.tela} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={pessoas ?? []}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.conteudo}
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            {pessoas === null && !erro ? <ActivityIndicator /> : null}
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          pessoas !== null ? (
            <View style={styles.vazio}>
              <Text style={styles.textoVazio}>Você ainda não segue ninguém.</Text>
              <Botao titulo="Buscar pessoas" onPress={() => router.push('/buscar')} />
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <LinhaPessoa
            username={item.username}
            detalhe={`Nível de foco ${nivelPorPontos(item.pontosTotais)} · ${pontosDeFoco(item.pontosTotais)}`}
            onPress={() => router.push(`/perfil/${item.username}`)}
          />
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
  },
  erro: {
    color: '#b91c1c',
  },
  vazio: {
    gap: 16,
    marginTop: 24,
  },
  textoVazio: {
    color: '#6b7280',
    textAlign: 'center',
  },
});
