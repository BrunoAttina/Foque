import { StyleSheet, Text, View } from 'react-native';

import { formatarMinutos, formatarRelogio, tempoDoFoco, textoHa } from '../domain/focoAtivo';
import { emojiDaTarefa } from '../domain/tarefas';
import type { FocoAtivo } from '../services/focoAtivo';
import { cartao, cores, espaco, raio, rotuloSecao, tipografia } from '../theme';
import { BarraProgresso } from './BarraProgresso';

interface CartaoFocandoAgoraProps {
  foco: FocoAtivo;
  /** Horário atual em ms, vindo do relógio da tela (useAgora). */
  agora: number;
}

/** Cartão "Focando agora" do perfil: tarefa, tempo focado, tempo restante e barra de progresso. */
export function CartaoFocandoAgora({ foco, agora }: CartaoFocandoAgoraProps) {
  const tempo = tempoDoFoco(foco, agora);
  const focado = formatarRelogio(tempo.decorridoMs);
  const restante = formatarRelogio(tempo.restanteMs, 'cima');
  return (
    <View
      style={[cartao, styles.cartao]}
      accessible
      accessibilityLabel={`Focando agora em ${foco.tarefa}. Tempo focado: ${focado}. Faltam ${restante}.`}
    >
      <View style={styles.cabecalho}>
        <View style={styles.ponto} />
        <Text style={styles.rotulo}>Focando agora</Text>
      </View>

      <Text style={styles.tarefa} numberOfLines={2}>
        {emojiDaTarefa(foco.tarefa)} {foco.tarefa}
      </Text>
      <Text style={styles.detalhe} numberOfLines={1}>
        Começou {textoHa(tempo.decorridoMs)} · mergulho de {formatarMinutos(foco.duracaoMinutos)}
      </Text>

      <View style={styles.tempos}>
        <View>
          <Text style={styles.legenda}>Focando há</Text>
          <Text style={styles.valor}>{focado}</Text>
        </View>
        <View style={styles.direita}>
          <Text style={styles.legenda}>Faltam</Text>
          <Text style={[styles.valor, styles.valorRestante]}>{restante}</Text>
        </View>
      </View>

      <BarraProgresso fracao={tempo.fracao} altura={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    gap: espaco.sm,
    borderColor: cores.secondaryContainer,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
  },
  ponto: {
    width: 10,
    height: 10,
    borderRadius: raio.full,
    backgroundColor: cores.mint,
  },
  rotulo: {
    ...rotuloSecao,
    color: cores.secondary,
  },
  tarefa: {
    ...tipografia.headlineMd,
    color: cores.onSurface,
  },
  detalhe: {
    ...tipografia.bodySm,
    color: cores.onSurfaceVariant,
  },
  tempos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: espaco.xs,
  },
  direita: {
    alignItems: 'flex-end',
  },
  legenda: {
    ...tipografia.labelSm,
    color: cores.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  valor: {
    ...tipografia.headlineLg,
    color: cores.secondary,
    fontVariant: ['tabular-nums'],
  },
  valorRestante: {
    color: cores.primary,
  },
});
