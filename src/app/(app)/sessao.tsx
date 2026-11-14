import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, BackHandler, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BalaoFala } from '../../components/BalaoFala';
import { BarraProgresso } from '../../components/BarraProgresso';
import { Botao } from '../../components/Botao';
import { Mascote } from '../../components/Mascote';
import { estadoTela } from '../../../modules/foco-tela';
import { decidirRetorno, foiBloqueio } from '../../domain/bloqueio';
import { falas, pts } from '../../domain/mensagens';
import { emojiDaTarefa } from '../../domain/tarefas';
import { registrarSessaoFinalizada } from '../../services/sincronizacao';
import { useAuth } from '../../store/auth';
import { useSessao } from '../../store/sessao';
import { cores, espaco, fontes, raio, tipografia } from '../../theme';

// Tamanhos ideais do mascote e do círculo do relógio (telas com altura sobrando).
const MASCOTE_MAX = 120;
const RELOGIO_MAX = 190;
const RELOGIO_MIN = 120;
const MASCOTE_MIN = 56; // abaixo disso o mascote some para o relógio caber
const VAO_PALCO = espaco.sm;
/** Altura que o palco (mascote + relógio) ocupa quando há espaço para os tamanhos ideais. */
const PALCO_MAX = MASCOTE_MAX + VAO_PALCO + RELOGIO_MAX;
/** Janelas mais baixas que isso usam margens e vãos menores. */
const ALTURA_COMPACTA = 700;

/** Divide a altura do palco entre o mascote e o círculo do relógio, sem passar dos tamanhos ideais. */
function dividirPalco(altura: number) {
  if (altura >= PALCO_MAX) return { mascote: MASCOTE_MAX, relogio: RELOGIO_MAX, vao: VAO_PALCO };
  const vao = espaco.xs;
  const util = Math.max(0, altura - vao);
  const relogio = Math.min(RELOGIO_MAX, Math.max(RELOGIO_MIN, Math.round(util * 0.62)));
  const sobra = Math.min(MASCOTE_MAX, Math.floor(util - relogio));
  return { mascote: sobra >= MASCOTE_MIN ? sobra : 0, relogio: Math.min(relogio, Math.max(0, Math.floor(altura))), vao };
}

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

  // Altura real do palco (mascote + relógio), medida no layout. Antes da primeira medida, uma estimativa.
  const { height: alturaJanela } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [alturaPalco, setAlturaPalco] = useState<number | null>(null);

  // Horário em que a tela foi bloqueada durante a sessão (null = não está bloqueada).
  const bloqueadoEm = useRef<number | null>(null);

  // Bloquear a tela pode: o timer continua (ele usa o horário final, não um contador).
  // Sair do app (home, trocar de app) cancela a sessão e não dá pontos.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (estado) => {
      if (useSessao.getState().status !== 'running') return;
      const momento = Date.now();

      if (estado === 'active') {
        const inicioBloqueio = bloqueadoEm.current;
        if (inicioBloqueio === null) return;
        bloqueadoEm.current = null;
        const decisao = decidirRetorno({
          bloqueadoEm: inicioBloqueio,
          endAt: useSessao.getState().endAt ?? momento,
          desbloqueadoEm: estadoTela().desbloqueadoEm,
          agora: momento,
        });
        if (decisao === 'concluir') concluir();
        else if (decisao === 'cancelar') cancelar('saiu');
        return;
      }

      // Saindo do primeiro plano.
      if (bloqueadoEm.current !== null) return; // já registrado como bloqueio
      const tela = estadoTela();
      if (foiBloqueio(tela, momento)) {
        bloqueadoEm.current = momento;
        return;
      }
      // Onde a detecção existe (Android), "inactive" é passageiro: decide no "background".
      if (tela.suportado && estado === 'inactive') return;
      cancelar('saiu');
    });
    return () => subscription.remove();
  }, [cancelar, concluir]);

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
      // Depois de um bloqueio, quem decide é o retorno ao app (pode ter usado o celular).
      if (momento >= endAt && bloqueadoEm.current === null) concluir();
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

  const compacta = alturaJanela < ALTURA_COMPACTA;
  // Estimativa para o primeiro quadro: janela menos margens, pílula (43), rodapé (~82),
  // balão de 3 linhas (111), barra (16) e vãos. O onLayout do palco corrige em seguida.
  const estimativa =
    alturaJanela - insets.top - insets.bottom - (compacta ? 2 * espaco.md : 2 * espaco.lg) - 43 - 82 -
    2 * (compacta ? espaco.sm : espaco.md) - 111 - 16 - 2 * espaco.sm;
  const palco = dividirPalco(Math.min(PALCO_MAX, alturaPalco ?? estimativa));
  const escala = palco.relogio / RELOGIO_MAX;
  const tamanhoTempo = Math.round(46 * escala);

  return (
    <SafeAreaView style={[styles.tela, compacta && styles.telaCompacta]}>
      <View style={styles.missao}>
        <Text style={styles.emoji}>{emojiDaTarefa(tarefa.nome)}</Text>
        <Text style={styles.nomeMissao} numberOfLines={1}>
          {tarefa.nome}
        </Text>
      </View>

      <View style={styles.centro}>
        <BalaoFala texto={fala} />

        {/* Palco: ocupa o que sobra entre o balão e a barra (até o tamanho ideal) e dita os tamanhos. */}
        <View
          style={[styles.palco, { gap: palco.vao }]}
          onLayout={(e) => setAlturaPalco(Math.round(e.nativeEvent.layout.height))}
        >
          {palco.mascote > 0 ? <Mascote tamanho={palco.mascote} estado="focando" /> : null}

          <View
            style={[
              styles.relogio,
              {
                width: palco.relogio,
                height: palco.relogio,
                borderRadius: palco.relogio / 2,
                borderWidth: escala < 0.9 ? 6 : 8,
              },
            ]}
          >
            <MaterialIcons name="ac-unit" size={escala < 0.9 ? 18 : 22} color={cores.primaryContainer} />
            <Text
              style={[styles.tempo, { fontSize: tamanhoTempo, lineHeight: Math.round(tamanhoTempo * 1.17) }]}
              accessibilityLabel={`Faltam ${formatarTempo(restante)}`}
            >
              {formatarTempo(restante)}
            </Text>
            <Text style={styles.recompensa}>+{pts(tarefa.duracaoMinutos)} ao final</Text>
          </View>
        </View>

        <View style={styles.barra}>
          <BarraProgresso fracao={1 - restante / totalMs} />
        </View>
      </View>

      <View style={[styles.rodape, compacta && styles.rodapeCompacto]}>
        <View style={styles.regra}>
          <MaterialIcons name="warning" size={18} color={cores.tertiary} />
          <Text style={styles.textoRegra}>Pode bloquear a tela. Sair do app quebra o gelo.</Text>
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
  telaCompacta: {
    paddingVertical: espaco.md,
    gap: espaco.sm,
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
  // flex 1 com teto: em tela alta fica no tamanho ideal e o conjunto continua centralizado;
  // em tela baixa encolhe para o espaço que sobra, e o conteúdo se ajusta a essa altura.
  palco: {
    flex: 1,
    maxHeight: PALCO_MAX,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  relogio: {
    width: RELOGIO_MAX,
    height: RELOGIO_MAX,
    borderRadius: RELOGIO_MAX / 2,
    backgroundColor: cores.surfaceContainerLowest,
    borderWidth: 8,
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
    fontSize: 46,
    lineHeight: 54,
    letterSpacing: -0.9,
    color: cores.onSurface,
    fontVariant: ['tabular-nums'],
  },
  recompensa: {
    ...tipografia.labelMd,
    color: cores.secondary,
  },
  barra: {
    width: '100%',
  },
  rodape: {
    gap: espaco.sm + 4,
  },
  rodapeCompacto: {
    gap: espaco.sm,
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
