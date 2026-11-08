import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/Avatar';
import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { CartaoNivel } from '../../../components/CartaoNivel';
import { tituloDoNivel } from '../../../domain/niveis';
import { nivelPorPontos } from '../../../domain/pontos';
import { sair } from '../../../services/auth';
import { contarSessoesConcluidas } from '../../../services/sessoes';
import { useAuth } from '../../../store/auth';
import { useSessao } from '../../../store/sessao';
import { cartao, cores, espaco, tipografia } from '../../../theme';

export default function TelaMeuPerfil() {
  const router = useRouter();
  const username = useAuth((s) => s.perfil?.username) ?? '';
  const pontos = useSessao((s) => s.pontosTotais);
  const [sessoes, setSessoes] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      contarSessoesConcluidas().then(setSessoes);
    }, []),
  );

  const nivel = nivelPorPontos(pontos);

  return (
    <View style={styles.tela}>
      <CabecalhoApp />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.identidade}>
          <Avatar username={username} tamanho={96} />
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.titulo}>{tituloDoNivel(nivel)}</Text>
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
