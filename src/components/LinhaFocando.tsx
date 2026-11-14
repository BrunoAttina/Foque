import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatarRelogio, tempoDoFoco, textoFaltam } from '../domain/focoAtivo';
import { emojiDaTarefa } from '../domain/tarefas';
import type { FocoAtivo } from '../services/focoAtivo';
import { cores, espaco, raio, tipografia } from '../theme';
import { Avatar } from './Avatar';
import { BarraProgresso } from './BarraProgresso';

interface LinhaFocandoProps {
  foco: FocoAtivo;
  /** Horário atual em ms, vindo do relógio da tela (useAgora). */
  agora: number;
  onPress: () => void;
}

/** Pessoa focando agora, na aba Amigos: avatar, @, tarefa, "faltam mm:ss" e barra de progresso. */
export function LinhaFocando({ foco, agora, onPress }: LinhaFocandoProps) {
  const tempo = tempoDoFoco(foco, agora);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`@${foco.username} está focando em ${foco.tarefa}. Faltam ${formatarRelogio(tempo.restanteMs, 'cima')}. Abrir perfil`}
      style={({ pressed }) => [styles.linha, pressed && styles.pressionada]}
    >
      <Avatar username={foco.username} aparencia={foco.aparencia} tamanho={44} />
      <View style={styles.conteudo}>
        <View style={styles.topo}>
          <Text style={styles.username} numberOfLines={1}>
            @{foco.username}
          </Text>
          <Text style={styles.faltam} numberOfLines={1}>
            {textoFaltam(tempo.restanteMs)}
          </Text>
        </View>
        <Text style={styles.tarefa} numberOfLines={1}>
          {emojiDaTarefa(foco.tarefa)} {foco.tarefa}
        </Text>
        <BarraProgresso fracao={tempo.fracao} altura={8} />
      </View>
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
    borderColor: cores.secondaryContainer,
    marginBottom: espaco.sm,
  },
  pressionada: {
    opacity: 0.7,
  },
  conteudo: {
    flex: 1,
    gap: espaco.xs,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
  },
  username: {
    ...tipografia.headlineSm,
    color: cores.onSurface,
    flex: 1,
  },
  faltam: {
    ...tipografia.labelMd,
    color: cores.secondary,
    fontVariant: ['tabular-nums'],
  },
  tarefa: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
  },
});
