import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, raio, tipografia } from '../theme';
import { Avatar } from './Avatar';

interface LinhaPessoaProps {
  username: string;
  /** Aparência do Foque que a pessoa usa (a foto do perfil). */
  aparencia?: string;
  /** Texto abaixo do @, como "Nível 3 · Foca Nadadora". */
  detalhe?: string;
  /** Posição no ranking (1, 2, 3...). */
  posicao?: number;
  /** Texto à direita, como "200 pts". */
  destaque?: string;
  /** Realça a linha (ex.: você no ranking). */
  realcada?: boolean;
  /** Elemento à direita no lugar da seta (ex.: botão Seguir). */
  acao?: ReactNode;
  /** Mostra o selo "focando" (a pessoa está numa sessão de foco agora). */
  focando?: boolean;
  onPress: () => void;
}

const MEDALHAS = ['🥇', '🥈', '🥉'];

export function LinhaPessoa({ username, aparencia, detalhe, posicao, destaque, realcada, acao, focando, onPress }: LinhaPessoaProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir perfil de @${username}${focando ? ', focando agora' : ''}`}
      style={({ pressed }) => [styles.linha, realcada && styles.realcada, pressed && styles.pressionada]}
    >
      {posicao !== undefined ? (
        <Text style={styles.posicao}>{MEDALHAS[posicao - 1] ?? `${posicao}º`}</Text>
      ) : null}
      <Avatar username={username} aparencia={aparencia} tamanho={44} />
      <View style={styles.textos}>
        <Text style={styles.username} numberOfLines={1}>
          @{username}
        </Text>
        {detalhe ? <Text style={styles.detalhe}>{detalhe}</Text> : null}
        {focando ? (
          <View style={styles.selo}>
            <View style={styles.seloPonto} />
            <Text style={styles.seloTexto}>focando</Text>
          </View>
        ) : null}
      </View>
      {destaque ? <Text style={styles.destaque}>{destaque}</Text> : null}
      {acao ?? <MaterialIcons name="chevron-right" size={24} color={cores.outlineVariant} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm + 4,
    paddingVertical: espaco.sm + 4,
    paddingHorizontal: espaco.sm + 4,
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: raio.lg,
    borderWidth: 1.5,
    borderColor: cores.iceBorder,
    marginBottom: espaco.sm,
  },
  realcada: {
    backgroundColor: cores.primaryFixed,
    borderColor: cores.primaryContainer,
  },
  pressionada: {
    opacity: 0.7,
  },
  posicao: {
    ...tipografia.headlineSm,
    color: cores.onSurfaceVariant,
    minWidth: 28,
    textAlign: 'center',
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  username: {
    ...tipografia.headlineSm,
    color: cores.onSurface,
  },
  detalhe: {
    ...tipografia.bodySm,
    color: cores.onSurfaceVariant,
  },
  destaque: {
    ...tipografia.labelLg,
    color: cores.primary,
  },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espaco.xs,
    marginTop: 2,
  },
  seloPonto: {
    width: 8,
    height: 8,
    borderRadius: raio.full,
    backgroundColor: cores.mint,
  },
  seloTexto: {
    ...tipografia.labelSm,
    color: cores.secondary,
    textTransform: 'uppercase',
  },
});
