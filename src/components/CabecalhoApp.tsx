import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { nivelPorPontos } from '../domain/pontos';
import { useAuth } from '../store/auth';
import { useSessao } from '../store/sessao';
import { cores, espaco, tipografia } from '../theme';
import { Avatar } from './Avatar';
import { Chip } from './Chip';

/** Cabeçalho das abas: pontos e nível em chips, @ e avatar à direita. */
export function CabecalhoApp() {
  const insets = useSafeAreaInsets();
  const username = useAuth((s) => s.perfil?.username) ?? '';
  const pontos = useSessao((s) => s.pontosTotais);

  return (
    <View style={[styles.cabecalho, { paddingTop: insets.top + espaco.sm }]}>
      <View style={styles.chips}>
        <Chip icone="diamond" corIcone={cores.primaryContainer} texto={String(pontos)} />
        <Chip icone="military-tech" corIcone={cores.amber} texto={`Nv ${nivelPorPontos(pontos)}`} />
      </View>
      <View style={styles.usuario}>
        <Text style={styles.username} numberOfLines={1}>
          @{username}
        </Text>
        <Avatar username={username} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.sm,
    paddingHorizontal: espaco.margemMobile,
    paddingBottom: espaco.sm,
    backgroundColor: cores.surface,
    shadowColor: cores.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
    zIndex: 10,
  },
  chips: {
    flexDirection: 'row',
    gap: espaco.xs,
  },
  usuario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    flexShrink: 1,
  },
  username: {
    ...tipografia.headlineSm,
    color: cores.primary,
    flexShrink: 1,
  },
});
