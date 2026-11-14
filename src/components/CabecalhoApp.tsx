import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { pts } from '../domain/mensagens';
import { progressoNoNivel } from '../domain/niveis';
import { useAparenciaAtual } from '../store/aparencia';
import { useAuth } from '../store/auth';
import { useSessao } from '../store/sessao';
import { cores, espaco, fontes, tipografia } from '../theme';
import { Avatar } from './Avatar';
import { BarraProgresso } from './BarraProgresso';

/** Cabeçalho das abas: nível com a barra até o próximo; @ e avatar levam ao Perfil. */
export function CabecalhoApp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const username = useAuth((s) => s.perfil?.username) ?? '';
  const pontos = useSessao((s) => s.pontosTotais);
  const p = progressoNoNivel(pontos);
  const aparencia = useAparenciaAtual();

  return (
    <View style={[styles.cabecalho, { paddingTop: insets.top + espaco.sm }]}>
      <View
        style={styles.nivel}
        accessible
        accessibilityLabel={`Nível de foco ${p.nivel}: ${pontos} de ${p.proximo} pontos para o próximo nível`}
      >
        <Text style={styles.textoNivel}>Nv.{p.nivel}</Text>
        <View style={styles.progresso}>
          <BarraProgresso fracao={p.fracao} altura={12} />
          <Text style={styles.textoPontos} numberOfLines={1}>
            {pts(pontos)} / {pts(p.proximo)}
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.usuario, pressed && { opacity: 0.6 }]}
        onPress={() => router.navigate('/perfil')}
        accessibilityRole="button"
        accessibilityLabel={`@${username}, abrir perfil`}
        hitSlop={8}
      >
        <Text style={styles.username} numberOfLines={1}>
          @{username}
        </Text>
        <Avatar username={username} aparencia={aparencia} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.md,
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
  nivel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    maxWidth: 200,
  },
  textoNivel: {
    fontFamily: fontes.outfitExtraBold,
    fontSize: 18,
    color: cores.primary,
  },
  progresso: {
    flex: 1,
    gap: 2,
  },
  textoPontos: {
    ...tipografia.labelSm,
    color: cores.onSurfaceVariant,
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
