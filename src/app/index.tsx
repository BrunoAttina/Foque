import { useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { nivelPorPontos } from '../domain/pontos';
import { useSessao } from '../store/sessao';

// Duração da sessão de teste, em minutos. Para testar com 20 min, use 20.
const TEMPO_MINUTOS = 1;
const TEMPO_MS = TEMPO_MINUTOS * 60 * 1000;

function formatarTempo(ms: number) {
  const totalSegundos = Math.ceil(ms / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

export default function TelaSessao() {
  const status = useSessao((s) => s.status);
  const endAt = useSessao((s) => s.endAt);
  const pontosTotais = useSessao((s) => s.pontosTotais);
  const pontosUltimaSessao = useSessao((s) => s.pontosUltimaSessao);
  const iniciar = useSessao((s) => s.iniciar);
  const concluir = useSessao((s) => s.concluir);
  const cancelar = useSessao((s) => s.cancelar);

  const [agora, setAgora] = useState(() => Date.now());

  // Sair do app durante a sessão cancela o timer e não dá pontos.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (estado) => {
      if (useSessao.getState().status === 'running' && estado !== 'active') {
        cancelar();
      }
    });
    return () => subscription.remove();
  }, [cancelar]);

  // Atualiza o relógio e conclui a sessão quando o tempo acaba.
  useEffect(() => {
    if (status !== 'running' || endAt === null) return;

    const intervalo = setInterval(() => {
      const momento = Date.now();
      setAgora(momento);
      if (momento >= endAt) {
        concluir(TEMPO_MINUTOS);
      }
    }, 250);

    return () => clearInterval(intervalo);
  }, [status, endAt, concluir]);

  function comecarSessao() {
    const inicio = Date.now();
    setAgora(inicio);
    iniciar(TEMPO_MS, inicio);
  }

  const restante = endAt !== null ? Math.max(0, endAt - agora) : TEMPO_MS;

  let mensagem = '';
  if (status === 'done') mensagem = `Sessão concluída! Você ganhou ${pontosUltimaSessao} ponto(s) de foco.`;
  if (status === 'cancelled') mensagem = 'Você saiu do Foque e a sessão foi encerrada. Desta vez, sem pontos.';

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Foque</Text>
      <Text style={styles.tempo}>{formatarTempo(restante)}</Text>

      {status === 'running' ? (
        <Text style={styles.instrucao}>Deixe o celular de lado. Sair do app cancela a sessão.</Text>
      ) : null}

      {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}

      <Text style={styles.pontos}>Pontos de foco: {pontosTotais}</Text>
      <Text style={styles.nivel}>Nível de foco: {nivelPorPontos(pontosTotais)}</Text>

      <Pressable
        onPress={comecarSessao}
        disabled={status === 'running'}
        style={({ pressed }) => [
          styles.botao,
          status === 'running' && styles.botaoDesativado,
          pressed && styles.botaoPressionado,
        ]}
      >
        <Text style={styles.textoBotao}>
          {status === 'running' ? 'Sessão em andamento' : 'Iniciar sessão de teste'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
  },
  tempo: {
    fontSize: 64,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  instrucao: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  mensagem: {
    fontSize: 16,
    textAlign: 'center',
  },
  pontos: {
    fontSize: 18,
    fontWeight: '600',
  },
  nivel: {
    fontSize: 16,
    color: '#555',
  },
  botao: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  botaoDesativado: {
    backgroundColor: '#9ca3af',
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
