import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/Avatar';
import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { CartaoNivel } from '../../../components/CartaoNivel';
import { tituloDoNivel } from '../../../domain/niveis';
import { nivelPorPontos } from '../../../domain/pontos';
import { sair } from '../../../services/auth';
import { contarSessoesConcluidas } from '../../../services/sessoes';
import { contarConexoes } from '../../../services/social';
import { useAparenciaAtual } from '../../../store/aparencia';
import { useAuth } from '../../../store/auth';
import { useSessao } from '../../../store/sessao';
import { cartao, cores, espaco, tipografia } from '../../../theme';

export default function TelaMeuPerfil() {
  const router = useRouter();
  const username = useAuth((s) => s.perfil?.username) ?? '';
  const meuId = useAuth((s) => s.session?.user.id);
  const aparencia = useAparenciaAtual();
  const [conexoes, setConexoes] = useState<{ seguindo: number; seguidores: number } | null>(null);
  const pontos = useSessao((s) => s.pontosTotais);
  const [sessoes, setSessoes] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      contarSessoesConcluidas().then(setSessoes);
      // Sem conexão: mantém os últimos números.
      if (meuId) contarConexoes(meuId).then(setConexoes, () => undefined);
    }, [meuId]),
  );

  const nivel = nivelPorPontos(pontos);

  return (
    <View style={styles.tela}>
      <CabecalhoApp />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.identidade}>
          <Avatar username={username} aparencia={aparencia} tamanho={96} />
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.titulo}>{tituloDoNivel(nivel)}</Text>

          {/* Tocar abre a aba Amigos com a lista correspondente aberta. */}
          <View style={styles.conexoes}>
            <Conexao
              valor={conexoes?.seguindo}
              rotulo="Seguindo"
              onPress={() => router.navigate({ pathname: '/amigos', params: { abrir: 'seguindo', t: String(Date.now()) } })}
            />
            <View style={styles.divisorConexoes} />
            <Conexao
              valor={conexoes?.seguidores}
              rotulo={conexoes?.seguidores === 1 ? 'Seguidor' : 'Seguidores'}
              onPress={() =>
                router.navigate({ pathname: '/amigos', params: { abrir: 'seguidores', t: String(Date.now()) } })
              }
            />
          </View>
        </View>

        <CartaoNivel pontos={pontos} />

        <View style={styles.estatisticas}>
          <Estatistica valor={String(pontos)} rotulo="Pontos de foco" />
          <Estatistica valor={sessoes === null ? '–' : String(sessoes)} rotulo="Sessões concluídas" />
          <Estatistica valor={String(nivel)} rotulo="Nível de foco" />
        </View>

        <Botao titulo="Encontrar amigos" icone="person-add" variante="secundario" onPress={() => router.push('/amigos')} />
        <Botao titulo="Sair da conta" icone="logout" variante="perigo" onPress={sair} />
      </ScrollView>
    </View>
  );
}

function Conexao({ valor, rotulo, onPress }: { valor: number | undefined; rotulo: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${valor ?? 0} ${rotulo}. Abre a lista na aba Amigos.`}
      style={({ pressed }) => [styles.conexao, pressed && { opacity: 0.6 }]}
      hitSlop={6}
    >
      <Text style={styles.valorConexao}>{valor ?? '–'}</Text>
      <Text style={styles.rotuloConexao}>{rotulo}</Text>
    </Pressable>
  );
}

function Estatistica({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={[cartao, styles.estatistica]}>
      <Text style={styles.valor}>{valor}</Text>
      <Text style={styles.rotulo}>{rotulo}</Text>
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
    gap: espaco.md,
    paddingBottom: espaco.xl,
  },
  identidade: {
    alignItems: 'center',
    gap: espaco.xs,
    marginTop: espaco.sm,
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
  conexoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.lg,
    marginTop: espaco.sm,
  },
  conexao: {
    alignItems: 'center',
    minWidth: 88,
  },
  valorConexao: {
    ...tipografia.headlineMd,
    color: cores.onSurface,
  },
  rotuloConexao: {
    ...tipografia.labelMd,
    color: cores.primary,
  },
  divisorConexoes: {
    width: 2,
    height: 28,
    borderRadius: 1,
    backgroundColor: cores.iceBorder,
  },
  estatisticas: {
    flexDirection: 'row',
    gap: espaco.sm,
  },
  estatistica: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: espaco.xs,
  },
  valor: {
    ...tipografia.headlineMd,
    color: cores.onSurface,
  },
  rotulo: {
    ...tipografia.labelSm,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
});
