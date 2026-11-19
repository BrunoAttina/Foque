import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { FAIXAS_ARCO_IRIS } from '../domain/conquistas';
import { cores } from '../theme';

type NomeIcone = ComponentProps<typeof MaterialIcons>['name'];

interface SeloConquistaProps {
  icone: string;
  cor: string;
  tamanho?: number;
  /** Ainda não obtida: cinza com cadeado. */
  bloqueada?: boolean;
  /** Fundo em faixas coloridas (nível "arco-íris polar"). */
  arcoIris?: boolean;
}

/** Selo redondo de uma conquista: ícone branco sobre a cor da categoria ou do nível. */
export function SeloConquista({ icone, cor, tamanho = 48, bloqueada, arcoIris }: SeloConquistaProps) {
  const nome = (bloqueada ? 'lock' : icone) as NomeIcone;
  return (
    <View
      style={[
        styles.selo,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          backgroundColor: bloqueada ? cores.surfaceContainerHighest : cor,
          borderColor: bloqueada ? cores.outlineVariant : 'rgba(255,255,255,0.7)',
        },
      ]}
    >
      {arcoIris && !bloqueada ? (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.faixas}>
            {FAIXAS_ARCO_IRIS.map((c) => (
              <View key={c} style={[styles.faixa, { backgroundColor: c }]} />
            ))}
          </View>
        </View>
      ) : null}
      <MaterialIcons name={nome} size={tamanho * 0.5} color={bloqueada ? cores.outline : '#ffffff'} />
    </View>
  );
}

const styles = StyleSheet.create({
  selo: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  faixas: {
    flex: 1,
    flexDirection: 'row',
    transform: [{ rotate: '20deg' }, { scale: 1.6 }],
  },
  faixa: {
    flex: 1,
  },
});
