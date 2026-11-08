import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { LinhaPessoa } from '../../../components/LinhaPessoa';
import { pts } from '../../../domain/mensagens';
import { tituloDoNivel } from '../../../domain/niveis';
import { nivelPorPontos } from '../../../domain/pontos';
import { ErroSocial, listarSeguindo, type PessoaComProgresso } from '../../../services/social';
import { useAuth } from '../../../store/auth';
import { useSessao } from '../../../store/sessao';
import { cartao, cores, espaco, tipografia } from '../../../theme';

export default function TelaRanking() {
  const router = useRouter();
  const meuId = useAuth((s) => s.session?.user.id);
  const meuUsername = useAuth((s) => s.perfil?.username) ?? '';
  const meusPontos = useSessao((s) => s.pontosTotais);
  const [seguindo, setSeguindo] = useState<PessoaComProgresso[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Recarrega ao voltar para a aba (ex.: depois de seguir alguém).
  useFocusEffect(
    useCallback(() => {
      if (!meuId) return;
      listarSeguindo(meuId)
        .then((pessoas) => {
          setSeguindo(pessoas);
          setErro(null);
        })
        .catch((e) => setErro(e instanceof ErroSocial ? e.message : 'Algo deu errado.'));
    }, [meuId]),
  );

  // Você + quem você segue, do maior para o menor número de pontos.
  const ranking = useMemo(() => {
    if (!seguindo || !meuId) return [];
    return [{ id: meuId, username: meuUsername, pontosTotais: meusPontos }, ...seguindo].sort(
      (a, b) => b.pontosTotais - a.pontosTotais,
    );
  }, [seguindo, meuId, meuUsername, meusPontos]);

  return (
    <View style={styles.tela}>
      <CabecalhoApp />
      <FlatList
        data={ranking}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.conteudo}
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <View>
              <Text style={styles.titulo}>Ranking Ártico 🏆</Text>
              <Text style={styles.subtitulo}>Você e quem você segue, por pontos de foco.</Text>
            </View>
            <Botao titulo="Buscar pessoas" icone="search" variante="secundario" onPress={() => router.push('/buscar')} />
            {seguindo === null && !erro ? <ActivityIndicator color={cores.primary} /> : null}
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          </View>
        }
        renderItem={({ item, index }) => {
          const nivel = nivelPorPontos(item.pontosTotais);
          return (
            <LinhaPessoa
              username={item.username}
              posicao={index + 1}
              detalhe={`Nível ${nivel} · ${tituloDoNivel(nivel)}`}
              destaque={pts(item.pontosTotais)}
              realcada={item.id === meuId}
              onPress={() => router.push(item.id === meuId ? '/perfil' : `/usuario/${item.username}`)}
            />
          );
        }}
        ListFooterComponent={
          seguindo !== null && seguindo.length === 0 ? (
            <View style={[cartao, styles.convite]}>
              <Text style={styles.textoConvite}>
                Um ranking de uma foca só é meio solitário. Siga outras pessoas para competir! 🦭
              </Text>
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.surface,
  },
  conteudo: {
    padding: espaco.margemMobile,
    paddingBottom: espaco.xl,
  },
  cabecalho: {
    gap: espaco.md,
    marginBottom: espaco.md,
  },
  titulo: {
    ...tipografia.headlineLg,
    color: cores.onSurface,
  },
  subtitulo: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
  },
  erro: {
    ...tipografia.bodySm,
    color: cores.error,
  },
  convite: {
    marginTop: espaco.sm,
  },
  textoConvite: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
});
