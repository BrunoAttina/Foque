import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BalaoFala } from '../../../components/BalaoFala';
import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { Chip } from '../../../components/Chip';
import { Mascote } from '../../../components/Mascote';
import { falas } from '../../../domain/mensagens';
import { emojiDaTarefa, feitaHoje, MISSOES_SUGERIDAS, TEMPO_PADRAO } from '../../../domain/tarefas';
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
  const [erro, setErro] = useState<string | null>(null);

  // Horário de quando a aba ganhou foco: define o que é "hoje" para os focos diários.
  const [hoje, setHoje] = useState(() => Date.now());
  useFocusEffect(
    useCallback(() => {
      setHoje(Date.now());
    }, []),
  );

  // Sem escolha: o primeiro foco que ainda não foi feito hoje.
  const tarefa =
    tarefas.find((t) => t.id === selecionadaId) ??
    tarefas.find((t) => !feitaHoje(t, hoje)) ??
    tarefas[0] ??
    null;

  const fala = useMemo(
    () => (tarefa ? falas.provocacao(tarefa.nome, tarefa.duracaoMinutos) : falas.semMissao()),
    [tarefa],
  );

  async function criarSugerida(nome: string) {
    try {
      // Sugestão rápida: foco de uma vez (some ao concluir).
      const criada = await adicionar(nome, TEMPO_PADRAO, false);
      setSelecionadaId(criada.id);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroTarefas ? e.message : 'Algo deu errado. Tente de novo.');
    }
  }

  function focar() {
    if (!tarefa) return;
    // A sessão dura o tempo cadastrado no foco.
    iniciar(tarefa, Date.now());
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
                    accessibilityLabel={`${t.nome}, ${t.duracaoMinutos} minutos${t.repeteDiariamente ? ', todo dia' : ''}${feitaHoje(t, hoje) ? ', feito hoje' : ''}`}
                    style={({ pressed }) => [styles.itemTarefa, ativa && styles.itemTarefaAtiva, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.emojiMissao}>{emojiDaTarefa(t.nome)}</Text>
                    <Text style={[styles.nomeTarefa, ativa && { color: cores.primary }]} numberOfLines={1}>
                      {t.nome}
                    </Text>
                    {feitaHoje(t, hoje) ? (
                      <MaterialIcons name="check-circle" size={18} color={cores.secondary} />
                    ) : t.repeteDiariamente ? (
                      <MaterialIcons name="repeat" size={18} color={cores.onSurfaceVariant} />
                    ) : null}
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
