import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { moedas, pts } from '../domain/mensagens';
import { progressoNoNivel } from '../domain/niveis';
import { cartao, cores, espaco, tipografia } from '../theme';
import { BarraProgresso } from './BarraProgresso';

interface CartaoNivelProps {
  pontos: number;
  /** Esconde a linha "Rumo a ..." (tela de resultado). */
  semProximoTitulo?: boolean;
  /**
   * Pontos ganhos na sessão que acabou (já incluídos em `pontos`).
   * Mostra os pontos e as moedas ganhos e pinta a barra em duas cores:
   * azul para o que já havia, verde para o que veio deste foco.
   */
  ganhos?: number;
}

/** Cartão "Nível 4: Foca Ártica" com a barra até o próximo nível. */
export function CartaoNivel({ pontos, semProximoTitulo, ganhos }: CartaoNivelProps) {
  const p = progressoNoNivel(pontos);
  // Se o foco fez subir de nível, a barra do nível novo é toda deste foco.
  const anteriores = ganhos === undefined ? 0 : Math.max(p.inicio, pontos - ganhos);
  const fracaoAnterior = ganhos === undefined ? undefined : (anteriores - p.inicio) / (p.proximo - p.inicio);
  return (
    <View style={[cartao, styles.cartao]}>
      <View style={styles.topo}>
        <MaterialIcons name="military-tech" size={28} color={cores.primary} />
        <View style={styles.textos}>
          <Text style={styles.titulo}>
            Nível {p.nivel}: {p.titulo}
          </Text>
          {semProximoTitulo ? null : <Text style={styles.subtitulo}>Rumo a {p.proximoTitulo}</Text>}
        </View>
      </View>
      {ganhos !== undefined ? (
        <View
          style={styles.ganhos}
          accessible
          accessibilityLabel={`Você ganhou ${ganhos} pontos de foco e ${ganhos} moedas`}
        >
          <MaterialIcons name="diamond" size={18} color={cores.primaryContainer} />
          <Text style={styles.textoGanhos}>+{pts(ganhos)}</Text>
          <View style={styles.divisor} />
          <MaterialIcons name="paid" size={18} color={cores.amber} />
          <Text style={styles.textoGanhos}>+{moedas(ganhos)}</Text>
        </View>
      ) : null}
      <View style={styles.valores}>
        <Text style={styles.atual}>{pts(pontos)}</Text>
        <Text style={styles.meta}>{pts(p.proximo)}</Text>
      </View>
      <BarraProgresso fracao={p.fracao} fracaoAnterior={fracaoAnterior} />
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    gap: espaco.sm,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    ...tipografia.headlineSm,
    color: cores.primary,
  },
  subtitulo: {
    ...tipografia.labelSm,
    color: cores.onSurfaceVariant,
  },
  ganhos: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espaco.xs,
  },
  textoGanhos: {
    ...tipografia.labelLg,
    color: cores.primary,
  },
  divisor: {
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: cores.iceBorder,
    marginHorizontal: espaco.xs,
  },
  valores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  atual: {
    ...tipografia.labelSm,
    color: cores.primary,
  },
  meta: {
    ...tipografia.labelSm,
    color: cores.outline,
  },
});
