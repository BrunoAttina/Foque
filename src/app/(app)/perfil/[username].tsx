import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../../components/Botao';
import { pontosDeFoco } from '../../../domain/mensagens';
import { nivelPorPontos } from '../../../domain/pontos';
import {
  buscarPessoaPorUsername,
  buscarPontos,
  deixarDeSeguir,
  ErroSocial,
  estouSeguindo,
  type Pessoa,
  seguir,
} from '../../../services/social';
import { useAuth } from '../../../store/auth';

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'nao-encontrado' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; pessoa: Pessoa; seguindo: boolean; pontos: number | null };

export default function TelaPerfil() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const meuId = useAuth((s) => s.session?.user.id);
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!meuId || !username) return;
    try {
      const pessoa = await buscarPessoaPorUsername(username);
      if (!pessoa) {
        setEstado({ tipo: 'nao-encontrado' });
        return;
      }
      const [seguindo, pontos] = await Promise.all([
        pessoa.id === meuId ? Promise.resolve(false) : estouSeguindo(meuId, pessoa.id),
        buscarPontos(pessoa.id),
      ]);
      setEstado({ tipo: 'pronto', pessoa, seguindo, pontos });
    } catch (e) {
      setEstado({ tipo: 'erro', mensagem: e instanceof ErroSocial ? e.message : 'Algo deu errado.' });
    }
  }, [meuId, username]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alternarSeguir() {
    if (estado.tipo !== 'pronto' || !meuId) return;
    setSalvando(true);
    try {
      if (estado.seguindo) await deixarDeSeguir(meuId, estado.pessoa.id);
      else await seguir(meuId, estado.pessoa.id);
      // Recarrega para mostrar (ou esconder) o progresso conforme o RLS.
      await carregar();
    } catch (e) {
      setEstado({ tipo: 'erro', mensagem: e instanceof ErroSocial ? e.message : 'Algo deu errado.' });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.tela} edges={['bottom', 'left', 'right']}>
      <Stack.Screen options={{ title: username ? `@${username}` : 'Perfil' }} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        {estado.tipo === 'carregando' ? <ActivityIndicator /> : null}

        {estado.tipo === 'nao-encontrado' ? (
          <Text style={styles.texto}>Não encontramos @{username}.</Text>
        ) : null}

        {estado.tipo === 'erro' ? (
          <View style={styles.bloco}>
            <Text style={styles.erro}>{estado.mensagem}</Text>
            <Botao titulo="Tentar de novo" variante="secundario" onPress={carregar} />
          </View>
        ) : null}

        {estado.tipo === 'pronto' ? (
          <View style={styles.bloco}>
            <View style={styles.avatar}>
              <Text style={styles.inicial}>{estado.pessoa.username[0]?.toUpperCase()}</Text>
            </View>
            <Text style={styles.username}>@{estado.pessoa.username}</Text>

            {estado.pontos !== null ? (
              <View style={styles.progresso}>
                <Text style={styles.nivel}>Nível de foco {nivelPorPontos(estado.pontos)}</Text>
                <Text style={styles.texto}>{pontosDeFoco(estado.pontos)}</Text>
              </View>
            ) : (
              <Text style={styles.texto}>
                Siga @{estado.pessoa.username} para ver o nível e os pontos de foco.
              </Text>
            )}

            {estado.pessoa.id === meuId ? (
              <Text style={styles.texto}>Este é o seu perfil.</Text>
            ) : (
              <Botao
                titulo={salvando ? 'Aguarde…' : estado.seguindo ? 'Deixar de seguir' : 'Seguir'}
                variante={estado.seguindo ? 'secundario' : 'primario'}
                onPress={alternarSeguir}
                desativado={salvando}
              />
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#fff',
  },
  conteudo: {
    padding: 24,
  },
  bloco: {
    gap: 16,
    alignItems: 'stretch',
  },
  avatar: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  progresso: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    gap: 4,
    alignItems: 'center',
  },
  nivel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  texto: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
  erro: {
    color: '#b91c1c',
    textAlign: 'center',
  },
});
