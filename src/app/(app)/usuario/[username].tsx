import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../../components/Avatar';
import { Botao } from '../../../components/Botao';
import { CartaoFocandoAgora } from '../../../components/CartaoFocandoAgora';
import { CartaoNivel } from '../../../components/CartaoNivel';
import { useAgora } from '../../../components/useAgora';
import { focoEstaAtivo } from '../../../domain/focoAtivo';
import { tituloDoNivel } from '../../../domain/niveis';
import { nivelPorPontos } from '../../../domain/pontos';
import { buscarFocoAtivo, type FocoAtivo } from '../../../services/focoAtivo';
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
import { cartao, cores, espaco, tipografia } from '../../../theme';

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'nao-encontrado' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; pessoa: Pessoa; seguindo: boolean; pontos: number | null };

/** De quanto em quanto tempo o cartão "Focando agora" recarrega com a tela aberta. */
const RECARGA_FOCO_MS = 30_000;

/** Busca a pessoa, se você a segue e os pontos (visíveis só para quem segue). */
async function buscarEstado(meuId: string, username: string): Promise<Estado> {
  try {
    const pessoa = await buscarPessoaPorUsername(username);
    if (!pessoa) return { tipo: 'nao-encontrado' };
    const [seguindo, pontos] = await Promise.all([
      pessoa.id === meuId ? Promise.resolve(false) : estouSeguindo(meuId, pessoa.id),
      buscarPontos(pessoa.id),
    ]);
    return { tipo: 'pronto', pessoa, seguindo, pontos };
  } catch (e) {
    return { tipo: 'erro', mensagem: e instanceof ErroSocial ? e.message : 'Algo deu errado.' };
  }
}

export default function TelaUsuario() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const meuId = useAuth((s) => s.session?.user.id);
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!meuId || !username) return;
    setEstado(await buscarEstado(meuId, username));
  }, [meuId, username]);

  useEffect(() => {
    if (!meuId || !username) return;
    let ativo = true;
    buscarEstado(meuId, username).then((novo) => {
      if (ativo) setEstado(novo);
    });
    return () => {
      ativo = false;
    };
  }, [meuId, username]);

  // Status "focando agora" da pessoa. Vem null se ela não está focando ou se você não a segue.
  const [foco, setFoco] = useState<FocoAtivo | null>(null);
  const pessoaId = estado.tipo === 'pronto' ? estado.pessoa.id : null;
  const podeVerFoco = estado.tipo === 'pronto' && (estado.seguindo || estado.pessoa.id === meuId);

  // Busca depois de carregar a pessoa e a cada 30 s com a tela aberta.
  // Também roda de novo ao seguir ou deixar de seguir (o RLS muda a resposta).
  useFocusEffect(
    useCallback(() => {
      if (!pessoaId || !podeVerFoco) return;
      let ativo = true;
      const buscar = () => {
        buscarFocoAtivo(pessoaId).then(
          (novo) => {
            if (ativo) setFoco(novo);
          },
          () => {
            // Falhou: o resto do perfil segue normal. Um cartão já visível vence pelo relógio.
          },
        );
      };
      buscar();
      const intervalo = setInterval(buscar, RECARGA_FOCO_MS);
      return () => {
        ativo = false;
        clearInterval(intervalo);
      };
    }, [pessoaId, podeVerFoco]),
  );

  // Só vale o foco da pessoa desta tela, de quem você segue, e que ainda não venceu.
  const focoDaPessoa = foco !== null && podeVerFoco && foco.userId === pessoaId ? foco : null;
  const agora = useAgora(focoDaPessoa !== null);
  const focoVisivel = focoDaPessoa && focoEstaAtivo(focoDaPessoa, agora) ? focoDaPessoa : null;

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
        {estado.tipo === 'carregando' ? <ActivityIndicator color={cores.primary} /> : null}

        {estado.tipo === 'nao-encontrado' ? (
          <Text style={styles.texto}>Não encontramos @{username}. 🧊</Text>
        ) : null}

        {estado.tipo === 'erro' ? (
          <View style={styles.bloco}>
            <Text style={styles.erro}>{estado.mensagem}</Text>
            <Botao titulo="Tentar de novo" variante="secundario" onPress={carregar} />
          </View>
        ) : null}

        {estado.tipo === 'pronto' ? (
          <View style={styles.bloco}>
            <View style={styles.identidade}>
              <Avatar username={estado.pessoa.username} aparencia={estado.pessoa.aparencia} tamanho={96} />
              <Text style={styles.username}>@{estado.pessoa.username}</Text>
              {estado.pontos !== null ? (
                <Text style={styles.titulo}>{tituloDoNivel(nivelPorPontos(estado.pontos))}</Text>
              ) : null}
            </View>

            {focoVisivel ? <CartaoFocandoAgora foco={focoVisivel} agora={agora} /> : null}

            {estado.pontos !== null ? (
              <CartaoNivel pontos={estado.pontos} />
            ) : (
              <View style={[cartao, styles.bloqueado]}>
                <MaterialIcons name="lock" size={28} color={cores.primaryContainer} />
                <Text style={styles.textoBloqueado}>
                  Siga @{estado.pessoa.username} para ver o nível e os pontos de foco.
                </Text>
              </View>
            )}

            {estado.pessoa.id === meuId ? (
              <Botao titulo="Este é você · ver meu perfil" variante="secundario" onPress={() => router.push('/perfil')} />
            ) : (
              <Botao
                titulo={salvando ? 'Aguarde…' : estado.seguindo ? 'Deixar de seguir' : 'Seguir'}
                icone={estado.seguindo ? 'person-remove' : 'person-add'}
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
    backgroundColor: cores.surface,
  },
  conteudo: {
    padding: espaco.lg,
  },
  bloco: {
    gap: espaco.md,
  },
  identidade: {
    alignItems: 'center',
    gap: espaco.xs,
  },
  username: {
    ...tipografia.headlineLg,
    color: cores.primary,
  },
  titulo: {
    ...tipografia.labelMd,
    color: cores.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bloqueado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm + 4,
  },
  textoBloqueado: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    flex: 1,
  },
  texto: {
    ...tipografia.bodyLg,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
  erro: {
    ...tipografia.bodyMd,
    color: cores.error,
    textAlign: 'center',
  },
});
