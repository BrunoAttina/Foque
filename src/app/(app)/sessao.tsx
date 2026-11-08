import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalaoFala } from '../../components/BalaoFala';
import { BarraProgresso } from '../../components/BarraProgresso';
import { Botao } from '../../components/Botao';
import { Mascote } from '../../components/Mascote';
import { falas } from '../../domain/mensagens';
import { emojiDaTarefa } from '../../domain/tarefas';
import { registrarSessaoFinalizada } from '../../services/sincronizacao';
import { useAuth } from '../../store/auth';
import { useSessao } from '../../store/sessao';
import { cores, espaco, fontes, raio, tipografia } from '../../theme';

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
  const [fala] = useState(() => falas.duranteSessao());

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
        <Text style={styles.aviso}>Nenhuma sessão em andamento.</Text>
        <Botao titulo="Voltar" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  const totalMs = tarefa.duracaoMinutos * 60 * 1000;
  const restante = endAt !== null ? Math.max(0, endAt - agora) : 0;

  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.missao}>
        <Text style={styles.emoji}>{emojiDaTarefa(tarefa.nome)}</Text>
        <Text style={styles.nomeMissao} numberOfLines={1}>
          {tarefa.nome}
        </Text>
      </View>

      <View style={styles.centro}>
        <BalaoFala texto={fala} />
        <Mascote tamanho={120} />

        <View style={styles.relogio}>
          <MaterialIcons name="ac-unit" size={22} color={cores.primaryContainer} />
          <Text style={styles.tempo} accessibilityLabel={`Faltam ${formatarTempo(restante)}`}>
            {formatarTempo(restante)}
          </Text>
          <Text style={styles.recompensa}>+{tarefa.duracaoMinutos} pts ao final</Text>
        </View>

        <View style={styles.barra}>
          <BarraProgresso fracao={1 - restante / totalMs} />
        </View>
      </View>

      <View style={styles.rodape}>
        <View style={styles.regra}>
          <MaterialIcons name="warning" size={18} color={cores.tertiary} />
          <Text style={styles.textoRegra}>Sair do app ou bloquear a tela quebra o gelo.</Text>
        </View>
        <Botao titulo="Desistir" icone="heart-broken" variante="secundario" onPress={() => cancelar('desistiu')} />
      </View>
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
  aviso: {
    ...tipografia.bodyLg,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
  missao: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: espaco.sm,
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: raio.full,
    borderWidth: 1.5,
    borderColor: cores.iceBorder,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
    maxWidth: '100%',
  },
  emoji: {
    fontSize: 18,
  },
  nomeMissao: {
    ...tipografia.headlineSm,
    color: cores.primary,
    flexShrink: 1,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
  },
  relogio: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: cores.surfaceContainerLowest,
    borderWidth: 10,
    borderColor: cores.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: cores.arcticDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  tempo: {
    fontFamily: fontes.outfitExtraBold,
    fontSize: 60,
    lineHeight: 68,
    letterSpacing: -1.2,
    color: cores.onSurface,
    fontVariant: ['tabular-nums'],
  },
  recompensa: {
    ...tipografia.labelMd,
    color: cores.secondary,
  },
  barra: {
    width: '100%',
    marginTop: espaco.sm,
  },
  rodape: {
    gap: espaco.sm + 4,
  },
  regra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.xs,
  },
  textoRegra: {
    ...tipografia.bodySm,
    color: cores.onSurfaceVariant,
  },
});
