import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalaoFala } from '../../components/BalaoFala';
import { Botao } from '../../components/Botao';
import { CartaoNivel } from '../../components/CartaoNivel';
import { Mascote } from '../../components/Mascote';
import { SeloConquista } from '../../components/SeloConquista';
import { useConquistasNovas } from '../../components/useConquistasNovas';
import { falas, mensagens } from '../../domain/mensagens';
import { tituloDoNivel } from '../../domain/niveis';
import { nivelPorPontos } from '../../domain/pontos';
import { useAuth } from '../../store/auth';
import { useSessao } from '../../store/sessao';
import { cores, espaco, raio, tipografia } from '../../theme';

export default function TelaResultado() {
  const router = useRouter();
  const status = useSessao((s) => s.status);
  const motivo = useSessao((s) => s.motivoCancelamento);
  const pontosUltimaSessao = useSessao((s) => s.pontosUltimaSessao);
  const pontosTotais = useSessao((s) => s.pontosTotais);

  const concluida = status === 'done';
  const userId = useAuth((s) => s.session?.user.id);
  // Conquistas que este foco liberou (o servidor confere ao registrar a sessão).
  const novas = useConquistasNovas(userId, concluida);
  const [fala] = useState(() => (concluida ? falas.concluida() : falas.cancelada()));
  const nivelAtual = nivelPorPontos(pontosTotais);
  const subiuDeNivel = concluida && nivelPorPontos(pontosTotais - pontosUltimaSessao) < nivelAtual;

  // Na conclusão, o cartão de nível já mostra o que foi ganho; a frase só aparece quando o foco é perdido.
  const mensagem = concluida ? null : motivo === 'saiu' ? mensagens.saiuDoApp : mensagens.desistiu;

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

        {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}

        {subiuDeNivel ? (
          <View style={styles.subiu}>
            <MaterialIcons name="celebration" size={24} color="#ffffff" />
            <Text style={styles.textoSubiu}>
              {mensagens.subiuDeNivel(nivelAtual)} {tituloDoNivel(nivelAtual)}!
            </Text>
          </View>
        ) : null}

        {novas.map((c) => (
          <View key={c.chave} style={styles.conquista} accessible accessibilityLabel={`Conquista desbloqueada: ${c.titulo}. Mais ${c.moedas} moedas`}>
            <SeloConquista icone={c.icone} cor={c.cor} tamanho={44} />
            <View style={styles.textosConquista}>
              <Text style={styles.rotuloConquista}>Conquista desbloqueada!</Text>
              <Text style={styles.tituloConquista}>{c.titulo}</Text>
            </View>
            <Text style={styles.moedasConquista}>+{c.moedas}</Text>
            <MaterialIcons name="paid" size={18} color={cores.amber} />
          </View>
        ))}

        <CartaoNivel pontos={pontosTotais} semProximoTitulo ganhos={concluida ? pontosUltimaSessao : undefined} />
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
  mensagem: {
    ...tipografia.bodyLg,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
  conquista: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: raio.lg,
    borderWidth: 2,
    borderColor: cores.secondaryContainer,
    padding: espaco.sm + 4,
  },
  textosConquista: {
    flex: 1,
  },
  rotuloConquista: {
    ...tipografia.labelSm,
    color: cores.secondary,
    textTransform: 'uppercase',
  },
  tituloConquista: {
    ...tipografia.headlineSm,
    color: cores.onSurface,
  },
  moedasConquista: {
    ...tipografia.labelLg,
    color: cores.primary,
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
