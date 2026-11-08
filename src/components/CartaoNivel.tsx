import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { pts } from '../domain/mensagens';
import { progressoNoNivel } from '../domain/niveis';
import { cartao, cores, espaco, tipografia } from '../theme';
import { BarraProgresso } from './BarraProgresso';

/** Cartão "Nível 4: Foca Ártica" com a barra até o próximo nível. */
export function CartaoNivel({ pontos }: { pontos: number }) {
  const p = progressoNoNivel(pontos);
  return (
    <View style={[cartao, styles.cartao]}>
      <View style={styles.topo}>
        <MaterialIcons name="military-tech" size={28} color={cores.primary} />
        <View style={styles.textos}>
          <Text style={styles.titulo}>
            Nível {p.nivel}: {p.titulo}
          </Text>
          <Text style={styles.subtitulo}>Rumo a {p.proximoTitulo}</Text>
        </View>
      </View>
      <View style={styles.valores}>
        <Text style={styles.atual}>{pts(pontos)}</Text>
        <Text style={styles.meta}>{pts(p.proximo)}</Text>
      </View>
      <BarraProgresso fracao={p.fracao} />
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
