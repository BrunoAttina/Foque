import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../components/Botao';
import { mensagens, pontosDeFoco } from '../../domain/mensagens';
import { nivelPorPontos } from '../../domain/pontos';
import { useSessao } from '../../store/sessao';

export default function TelaResultado() {
  const router = useRouter();
  const status = useSessao((s) => s.status);
  const motivo = useSessao((s) => s.motivoCancelamento);
  const pontosUltimaSessao = useSessao((s) => s.pontosUltimaSessao);
  const pontosTotais = useSessao((s) => s.pontosTotais);

  const concluida = status === 'done';
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
      <View style={styles.centro}>
        <Text style={[styles.titulo, !concluida && styles.tituloCancelado]}>
          {concluida ? 'Muito bem!' : 'Sessão encerrada'}
        </Text>
        <Text style={styles.mensagem}>{mensagem}</Text>
        {subiuDeNivel ? <Text style={styles.nivel}>{mensagens.subiuDeNivel(nivelAtual)}</Text> : null}
        <Text style={styles.total}>
          Nível de foco {nivelAtual} · {pontosDeFoco(pontosTotais)}
        </Text>
      </View>
      <Botao titulo="Voltar às tarefas" onPress={voltar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    gap: 16,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  titulo: {
    fontSize: 30,
    fontWeight: '700',
    color: '#15803d',
  },
  tituloCancelado: {
    color: '#374151',
  },
  mensagem: {
    fontSize: 18,
    textAlign: 'center',
  },
  nivel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d4ed8',
    textAlign: 'center',
  },
  total: {
    fontSize: 16,
    color: '#6b7280',
  },
});
