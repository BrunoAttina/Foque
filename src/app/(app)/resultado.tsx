import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalaoFala } from '../../components/BalaoFala';
import { Botao } from '../../components/Botao';
import { CartaoNivel } from '../../components/CartaoNivel';
import { Mascote } from '../../components/Mascote';
import { falas, mensagens, pts } from '../../domain/mensagens';
import { tituloDoNivel } from '../../domain/niveis';
import { nivelPorPontos } from '../../domain/pontos';
import { useSessao } from '../../store/sessao';
import { cores, espaco, raio, tipografia } from '../../theme';

export default function TelaResultado() {
  const router = useRouter();
  const status = useSessao((s) => s.status);
  const motivo = useSessao((s) => s.motivoCancelamento);
  const pontosUltimaSessao = useSessao((s) => s.pontosUltimaSessao);
  const pontosTotais = useSessao((s) => s.pontosTotais);

  const concluida = status === 'done';
  const [fala] = useState(() => (concluida ? falas.concluida() : falas.cancelada()));
  const nivelAtual = nivelPorPontos(pontosTotais);
  const subiuDeNivel = concluida && nivelPorPontos(pontosTotais - pontosUltimaSessao) < nivelAtual;

  let mensagem = mensagens.sessaoConcluida(pontosUltimaSessao);
  if (!concluida) mensagem = motivo === 'saiu' ? mensagens.saiuDoApp : mensagens.desistiu;

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={[styles.titulo, { color: concluida ? cores.secondary : cores.tertiary }]}>
          {concluida ? 'Parabéns pelo foco!' : 'O gelo quebrou'}
        </Text>

        <View style={styles.mascote}>
          <BalaoFala texto={fala} />
          <Mascote tamanho={150} estado={concluida ? 'comemorando' : 'triste'} />
        </View>

        {concluida ? (
          <View style={styles.pontos}>
            <MaterialIcons name="diamond" size={28} color={cores.primaryContainer} />
            <Text style={styles.textoPontos}>+{pts(pontosUltimaSessao)}</Text>
            <View style={styles.divisor} />
            <MaterialIcons name="paid" size={26} color={cores.amber} />
            <Text style={styles.textoPontos}>+{pontosUltimaSessao}</Text>
          </View>
        ) : null}

        <Text style={styles.mensagem}>{mensagem}</Text>

        {subiuDeNivel ? (
          <View style={styles.subiu}>
            <MaterialIcons name="celebration" size={24} color="#ffffff" />
            <Text style={styles.textoSubiu}>
              {mensagens.subiuDeNivel(nivelAtual)} {tituloDoNivel(nivelAtual)}!
            </Text>
          </View>
        ) : null}

        <CartaoNivel pontos={pontosTotais} />
      </ScrollView>

      <Botao titulo={concluida ? 'Foque mais!' : 'Tentar de novo'} icone="ac-unit" grande onPress={voltar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.surface,
    padding: espaco.lg,
    gap: espaco.md,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: espaco.md,
  },
  titulo: {
    ...tipografia.displayMobile,
    textAlign: 'center',
  },
  mascote: {
    alignItems: 'center',
    gap: espaco.xs,
  },
  pontos: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: espaco.sm,
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: raio.full,
    borderWidth: 2,
    borderColor: cores.iceBorder,
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.sm,
  },
  divisor: {
    width: 2,
    height: 24,
    borderRadius: 1,
    backgroundColor: cores.iceBorder,
    marginHorizontal: espaco.xs,
  },
  textoPontos: {
    ...tipografia.headlineLg,
    color: cores.primary,
  },
  mensagem: {
    ...tipografia.bodyLg,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
  subiu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
    backgroundColor: cores.amber,
    borderRadius: raio.lg,
    padding: espaco.md,
    borderBottomWidth: 4,
    borderBottomColor: cores.amberDeep,
  },
  textoSubiu: {
    ...tipografia.headlineSm,
    color: '#ffffff',
    flexShrink: 1,
    textAlign: 'center',
  },
});
