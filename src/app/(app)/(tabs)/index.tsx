import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BalaoFala } from '../../../components/BalaoFala';
import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { Chip } from '../../../components/Chip';
import { Mascote } from '../../../components/Mascote';
import { falas, pts } from '../../../domain/mensagens';
import { emojiDaTarefa, MISSOES_SUGERIDAS, TEMPOS_SUGERIDOS, tempoSugeridoMaisProximo } from '../../../domain/tarefas';
import { ErroTarefas } from '../../../services/tarefas';
import { useSessao } from '../../../store/sessao';
import { useTarefas } from '../../../store/tarefas';
import { cartao, cores, espaco, raio, rotuloSecao, tipografia } from '../../../theme';

export default function TelaFocar() {
  const router = useRouter();
  const iniciar = useSessao((s) => s.iniciar);
  const tarefas = useTarefas((s) => s.tarefas);
  const adicionar = useTarefas((s) => s.adicionar);

  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const [tempo, setTempo] = useState(30);
  const [erro, setErro] = useState<string | null>(null);

  const tarefa = tarefas.find((t) => t.id === selecionadaId) ?? tarefas[0] ?? null;

  // Ao trocar de foco, o tempo vai para a opção mais próxima da duração dele (ajuste durante o render, sem efeito).
  const [missaoDoTempo, setMissaoDoTempo] = useState<string | undefined>(undefined);
  if (tarefa && tarefa.id !== missaoDoTempo) {
    setMissaoDoTempo(tarefa.id);
    setTempo(tempoSugeridoMaisProximo(tarefa.duracaoMinutos));
  }

  // Só os tempos fixos: a duração cadastrada no foco não vira opção extra.
  const opcoes = TEMPOS_SUGERIDOS;

  const fala = useMemo(
    () => (tarefa ? falas.provocacao(tarefa.nome, tempo) : falas.semMissao()),
    [tarefa, tempo],
  );

  async function criarSugerida(nome: string) {
    try {
      const criada = await adicionar(nome, tempo);
      setSelecionadaId(criada.id);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroTarefas ? e.message : 'Algo deu errado. Tente de novo.');
    }
  }

  function focar() {
    if (!tarefa) return;
    iniciar({ ...tarefa, duracaoMinutos: tempo }, Date.now());
    router.push('/sessao');
  }

  return (
    <View style={styles.tela}>
      <CabecalhoApp />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.mascote}>
          <BalaoFala texto={fala} />
          <Mascote tamanho={150} />
        </View>

        {/* Tempo de foco */}
        <View style={styles.secao}>
          <View style={styles.linhaSecao}>
            <Text style={rotuloSecao}>Tempo de Foco</Text>
            <View style={styles.recompensa}>
              <MaterialIcons name="bolt" size={14} color={cores.secondary} />
              <Text style={styles.textoRecompensa}>
                {tempo >= 45 ? '+Recompensa alta' : '1 ponto por minuto'}
              </Text>
            </View>
          </View>
          <View style={styles.tempos}>
            {opcoes.map((minutos) => (
              <OpcaoTempo
                key={minutos}
                minutos={minutos}
                ativa={minutos === tempo}
                onPress={() => setTempo(minutos)}
              />
            ))}
          </View>
        </View>

        {/* Tarefas que precisam do seu foco: a lista dos focos cadastrados. */}
        <View style={styles.secao}>
          <View style={styles.linhaSecao}>
            <Text style={[rotuloSecao, styles.rotuloTarefas]}>Tarefas que precisam do seu foco</Text>
            <Pressable
              onPress={() => router.push('/tarefas')}
              accessibilityRole="button"
              accessibilityLabel="Gerenciar focos"
              hitSlop={10}
            >
              <MaterialIcons name="tune" size={20} color={cores.primary} />
            </Pressable>
          </View>

          {tarefas.length > 0 ? (
            <View style={styles.lista} accessibilityRole="radiogroup">
              {tarefas.map((t) => {
                const ativa = t.id === tarefa?.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setSelecionadaId(t.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: ativa }}
                    accessibilityLabel={`${t.nome}, ${t.duracaoMinutos} minutos`}
                    style={({ pressed }) => [styles.itemTarefa, ativa && styles.itemTarefaAtiva, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.emojiMissao}>{emojiDaTarefa(t.nome)}</Text>
                    <Text style={[styles.nomeTarefa, ativa && { color: cores.primary }]} numberOfLines={1}>
                      {t.nome}
                    </Text>
                    <Text style={styles.duracaoTarefa}>{t.duracaoMinutos} min</Text>
                    <MaterialIcons
                      name={ativa ? 'radio-button-checked' : 'radio-button-unchecked'}
                      size={20}
                      color={ativa ? cores.primaryContainer : cores.outlineVariant}
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={[cartao, styles.missao]}>
              <Text style={styles.semMissao}>Nenhum foco cadastrado. Escolha um para começar:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {MISSOES_SUGERIDAS.map((nome) => (
                  <Chip key={nome} emoji={emojiDaTarefa(nome)} texto={nome} onPress={() => criarSugerida(nome)} />
                ))}
              </ScrollView>
            </View>
          )}
          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        </View>

        {/* Regra do gelo fino */}
        <View style={styles.regra}>
          <MaterialIcons name="warning" size={22} color={cores.tertiary} />
          <View style={styles.textosRegra}>
            <Text style={styles.tituloRegra}>Regra do Gelo Fino</Text>
            <Text style={styles.textoRegra}>
              A cada 1 minuto de foco você ganha 1 ponto. Pode bloquear a tela e deixar o celular de lado, mas se
              sair do app, o gelo quebra e a sessão é perdida!
            </Text>
          </View>
        </View>

        <View style={styles.cta}>
          <Botao
            titulo="Focar"
            icone="ac-unit"
            grande
            onPress={focar}
            desativado={!tarefa}
          />
          <View style={styles.vigiando}>
            <MaterialIcons name="verified" size={14} color={cores.secondary} />
            <Text style={styles.textoVigiando}>Foque estará vigiando sua tela</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function OpcaoTempo({ minutos, ativa, onPress }: { minutos: number; ativa: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: ativa }}
      accessibilityLabel={`${minutos} minutos, ${minutos} pontos`}
      style={[styles.baseTempo, { backgroundColor: ativa ? cores.arcticDeep : cores.surfaceContainerHighest }]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.faceTempo,
            { backgroundColor: ativa ? cores.primaryContainer : cores.surfaceContainerLowest },
            pressed ? { marginTop: 2, marginBottom: 1 } : { marginBottom: ativa ? 4 : 3 },
          ]}
        >
          <Text style={[styles.minutos, ativa && { color: cores.onPrimaryContainer }]}>{minutos}</Text>
          <Text style={[styles.min, ativa && { color: cores.onPrimaryContainer }]}>min</Text>
          <Text style={[styles.pts, ativa && styles.ptsAtivo]}>+{pts(minutos)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.surface,
  },
  conteudo: {
    padding: espaco.margemMobile,
    gap: espaco.md,
    paddingBottom: espaco.xl,
  },
  mascote: {
    alignItems: 'center',
    gap: espaco.xs,
  },
  secao: {
    gap: espaco.sm,
  },
  linhaSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: espaco.xs,
  },
  recompensa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  textoRecompensa: {
    ...tipografia.labelSm,
    color: cores.secondary,
  },
  tempos: {
    flexDirection: 'row',
    gap: espaco.sm,
  },
  baseTempo: {
    flex: 1,
    borderRadius: raio.md,
  },
  faceTempo: {
    borderRadius: raio.md,
    alignItems: 'center',
    paddingVertical: espaco.sm + 2,
    borderWidth: 1,
    borderColor: cores.iceBorder,
  },
  minutos: {
    ...tipografia.headlineMd,
    color: cores.onSurface,
  },
  min: {
    ...tipografia.labelSm,
    color: cores.onSurfaceVariant,
  },
  pts: {
    ...tipografia.labelSm,
    color: cores.primary,
    marginTop: espaco.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  ptsAtivo: {
    color: cores.onPrimaryContainer,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: raio.full,
    overflow: 'hidden',
  },
  missao: {
    gap: espaco.sm,
    padding: espaco.sm + 2,
  },
  rotuloTarefas: {
    flex: 1,
  },
  lista: {
    gap: espaco.sm,
  },
  itemTarefa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: raio.md,
    borderWidth: 2,
    borderColor: cores.iceBorder,
    paddingHorizontal: espaco.sm + 4,
    paddingVertical: espaco.sm + 2,
  },
  itemTarefaAtiva: {
    borderColor: cores.primaryContainer,
    backgroundColor: cores.surfaceContainerLow,
  },
  nomeTarefa: {
    ...tipografia.headlineSm,
    color: cores.onSurface,
    flex: 1,
  },
  duracaoTarefa: {
    ...tipografia.labelMd,
    color: cores.onSurfaceVariant,
  },
  missaoAtual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    backgroundColor: cores.surfaceContainerLow,
    borderRadius: raio.base,
    padding: espaco.sm,
  },
  emojiMissao: {
    fontSize: 22,
  },
  nomeMissao: {
    ...tipografia.headlineSm,
    color: cores.primary,
    flex: 1,
  },
  semMissao: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    paddingHorizontal: espaco.xs,
  },
  chips: {
    gap: espaco.sm,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  erro: {
    ...tipografia.bodySm,
    color: cores.error,
  },
  regra: {
    flexDirection: 'row',
    gap: espaco.sm,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,218,210,0.45)',
    borderRadius: raio.lg,
    padding: espaco.md,
  },
  textosRegra: {
    flex: 1,
    gap: 2,
  },
  tituloRegra: {
    ...tipografia.labelLg,
    color: cores.onTertiaryFixed,
  },
  textoRegra: {
    ...tipografia.bodySm,
    color: cores.onSurfaceVariant,
    lineHeight: 18,
  },
  cta: {
    gap: espaco.sm,
    alignItems: 'stretch',
  },
  vigiando: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.xs,
  },
  textoVigiando: {
    ...tipografia.labelSm,
    color: cores.onSurfaceVariant,
  },
});
