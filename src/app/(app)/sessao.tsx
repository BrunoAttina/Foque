import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../components/Botao';
import { mensagens } from '../../domain/mensagens';
import { registrarSessaoFinalizada } from '../../services/sincronizacao';
import { useAuth } from '../../store/auth';
import { useSessao } from '../../store/sessao';

function formatarTempo(ms: number) {
  const totalSegundos = Math.ceil(ms / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

export default function TelaSessao() {
  const router = useRouter();
  const status = useSessao((s) => s.status);
  const tarefa = useSessao((s) => s.tarefa);
  const endAt = useSessao((s) => s.endAt);
  const concluir = useSessao((s) => s.concluir);
  const cancelar = useSessao((s) => s.cancelar);

  const [agora, setAgora] = useState(() => Date.now());

  // Sair do app durante a sessão cancela o timer e não dá pontos.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (estado) => {
      if (estado !== 'active') cancelar('saiu');
    });
    return () => subscription.remove();
  }, [cancelar]);

  // O botão voltar do Android encerra a sessão como desistência e mostra o resultado.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      cancelar('desistiu');
      return true;
    });
    return () => subscription.remove();
  }, [cancelar]);

  // Atualiza o relógio e conclui a sessão quando o tempo acaba.
  useEffect(() => {
    if (status !== 'running' || endAt === null) return;
    const intervalo = setInterval(() => {
      const momento = Date.now();
      setAgora(momento);
      if (momento >= endAt) concluir();
    }, 250);
    return () => clearInterval(intervalo);
  }, [status, endAt, concluir]);

  // Quando a sessão termina, de qualquer forma: grava na fila, envia e vai para o resultado.
  useEffect(() => {
    if (status !== 'done' && status !== 'cancelled') return;
    const s = useSessao.getState();
    const userId = useAuth.getState().session?.user.id;
    if (userId && s.sessaoId && s.tarefa && s.inicio !== null && s.fim !== null) {
      // Sem await: a tela de resultado aparece na hora; o envio segue em segundo plano.
      registrarSessaoFinalizada({
        id: s.sessaoId,
        userId,
        tarefa: s.tarefa.nome,
        duracaoMinutos: s.tarefa.duracaoMinutos,
        inicio: new Date(s.inicio).toISOString(),
        fim: new Date(s.fim).toISOString(),
        status: status === 'done' ? 'concluida' : 'cancelada',
      });
    }
    router.replace('/resultado');
  }, [status, router]);

  if (!tarefa) {
    return (
      <SafeAreaView style={styles.tela}>
        <Text style={styles.instrucao}>Nenhuma sessão em andamento.</Text>
        <Botao titulo="Voltar às tarefas" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  const restante = endAt !== null ? Math.max(0, endAt - agora) : 0;

  return (
    <SafeAreaView style={styles.tela}>
      {/* Sem gesto de voltar no iOS: a saída é pelo botão Desistir. */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <View style={styles.centro}>
        <Text style={styles.tarefa}>{tarefa.nome}</Text>
        <Text style={styles.tempo}>{formatarTempo(restante)}</Text>
        <Text style={styles.instrucao}>{mensagens.inicioSessao(tarefa.nome)}</Text>
        <Text style={styles.aviso}>Sair do app cancela a sessão.</Text>
      </View>
      <Botao titulo="Desistir" variante="secundario" onPress={() => cancelar('desistiu')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  tarefa: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  tempo: {
    fontSize: 72,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  instrucao: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  aviso: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
