import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { Campo } from '../../../components/Campo';
import { Chip } from '../../../components/Chip';
import { pts } from '../../../domain/mensagens';
import { emojiDaTarefa, feitaHoje, TEMPO_PADRAO, TEMPOS_SUGERIDOS, validarTarefa } from '../../../domain/tarefas';
import { ErroTarefas } from '../../../services/tarefas';
import { useSessao } from '../../../store/sessao';
import { type Tarefa, useTarefas } from '../../../store/tarefas';
import { cartao, cores, espaco, raio, rotuloSecao, tipografia } from '../../../theme';

export default function TelaTarefas() {
  const router = useRouter();
  const tarefas = useTarefas((s) => s.tarefas);
  const carregando = useTarefas((s) => s.carregando);
  const adicionar = useTarefas((s) => s.adicionar);
  const remover = useTarefas((s) => s.remover);
  const iniciar = useSessao((s) => s.iniciar);

  const [nome, setNome] = useState('');
  const [duracao, setDuracao] = useState<number>(TEMPO_PADRAO);
  // false: o foco é apagado ao ser concluído. true: fica na lista e volta todo dia.
  const [repete, setRepete] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  // Horário de quando a aba ganhou foco: define o que é "hoje" para os focos diários.
  const [hoje, setHoje] = useState(() => Date.now());
  useFocusEffect(
    useCallback(() => {
      setHoje(Date.now());
    }, []),
  );
  const [salvando, setSalvando] = useState(false);

  async function adicionarTarefa() {
    const resultado = validarTarefa(nome, duracao);
    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    setSalvando(true);
    try {
      await adicionar(resultado.nome, resultado.duracaoMinutos, repete);
      setNome('');
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroTarefas ? e.message : 'Algo deu errado. Tente de novo.');
    } finally {
      setSalvando(false);
    }
  }

  async function removerTarefa(id: string) {
    try {
      await remover(id);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroTarefas ? e.message : 'Algo deu errado. Tente de novo.');
    }
  }

  function focar(tarefa: Tarefa) {
    iniciar(tarefa, Date.now());
    router.push('/sessao');
  }

  return (
    <View style={styles.tela}>
      <CabecalhoApp />
      <FlatList
        data={tarefas}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <View>
              <Text style={styles.titulo}>Seus Focos</Text>
              <Text style={styles.subtitulo}>O que merece seu foco hoje?</Text>
            </View>

            <View style={[cartao, styles.formulario]}>
              <Campo
                rotulo="Novo foco"
                placeholder="Ex.: Ler um livro"
                value={nome}
                onChangeText={setNome}
                maxLength={60}
                returnKeyType="done"
              />

              <View style={styles.grupo}>
                <Text style={rotuloSecao}>Duração</Text>
                <View style={styles.duracoes} accessibilityRole="radiogroup">
                  {TEMPOS_SUGERIDOS.map((minutos) => (
                    <View key={minutos} style={styles.duracao}>
                      <Chip
                        texto={`${minutos} min`}
                        ativo={duracao === minutos}
                        onPress={() => setDuracao(minutos)}
                      />
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.grupo}>
                <Text style={rotuloSecao}>Depois de concluir</Text>
                <View style={styles.opcoes} accessibilityRole="radiogroup">
                  <Chip icone="looks-one" texto="Apagar o foco" ativo={!repete} onPress={() => setRepete(false)} />
                  <Chip icone="repeat" texto="Repetir todo dia" ativo={repete} onPress={() => setRepete(true)} />
                </View>
                <Text style={styles.ajuda}>
                  {repete
                    ? 'O foco fica na lista e volta todo dia. Bom para um hábito, como ler 30 minutos por dia.'
                    : 'O foco some da lista assim que você concluir. Bom para uma tarefa de uma vez só.'}
                </Text>
              </View>

              {erro ? <Text style={styles.erro}>{erro}</Text> : null}
              <Botao
                titulo={salvando ? 'Salvando…' : 'Adicionar foco'}
                icone="add"
                onPress={adicionarTarefa}
                desativado={salvando}
              />
            </View>

            {tarefas.length > 0 ? <Text style={rotuloSecao}>Na fila ({tarefas.length})</Text> : null}
          </View>
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator color={cores.primary} style={styles.vazio} />
          ) : (
            <Text style={styles.vazio}>Nenhum foco na fila. Escolha uma coisa importante para hoje. 🧊</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={[cartao, styles.item]}>
            <Text style={styles.emoji}>{emojiDaTarefa(item.nome)}</Text>
            <View style={styles.itemTexto}>
              <Text style={styles.itemNome} numberOfLines={2}>
                {item.nome}
              </Text>
              <Text style={styles.itemDetalhe}>
                {item.duracaoMinutos} min · +{pts(item.duracaoMinutos)}
              </Text>
              <View style={styles.selo}>
                <MaterialIcons
                  name={feitaHoje(item, hoje) ? 'check-circle' : item.repeteDiariamente ? 'repeat' : 'looks-one'}
                  size={14}
                  color={feitaHoje(item, hoje) ? cores.secondary : cores.onSurfaceVariant}
                />
                <Text style={[styles.textoSelo, feitaHoje(item, hoje) && { color: cores.secondary }]}>
                  {feitaHoje(item, hoje)
                    ? 'Todo dia · feito hoje'
                    : item.repeteDiariamente
                      ? 'Todo dia'
                      : 'Uma vez'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => removerTarefa(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Remover ${item.nome}`}
              hitSlop={8}
              style={({ pressed }) => [styles.remover, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="delete-outline" size={22} color={cores.outline} />
            </Pressable>
            <Botao titulo={feitaHoje(item, hoje) ? 'De novo' : 'Focar'} onPress={() => focar(item)} />
          </View>
        )}
      />
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
    gap: espaco.sm + 4,
    paddingBottom: espaco.xl,
  },
  cabecalho: {
    gap: espaco.md,
    marginBottom: espaco.xs,
  },
  titulo: {
    ...tipografia.headlineLg,
    color: cores.onSurface,
  },
  subtitulo: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
  },
  formulario: {
    gap: espaco.md,
  },
  grupo: {
    gap: espaco.sm,
  },
  duracoes: {
    flexDirection: 'row',
    gap: espaco.xs,
  },
  duracao: {
    flex: 1,
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaco.sm,
  },
  ajuda: {
    ...tipografia.bodySm,
    color: cores.onSurfaceVariant,
  },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  textoSelo: {
    ...tipografia.labelSm,
    color: cores.onSurfaceVariant,
  },
  erro: {
    ...tipografia.bodySm,
    color: cores.error,
  },
  vazio: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
    marginTop: espaco.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm + 4,
    padding: espaco.sm + 4,
  },
  emoji: {
    fontSize: 26,
    width: 44,
    height: 44,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 44,
    backgroundColor: cores.surfaceContainerLow,
    borderRadius: raio.md,
    overflow: 'hidden',
  },
  itemTexto: {
    flex: 1,
    gap: 2,
  },
  itemNome: {
    ...tipografia.headlineSm,
    color: cores.onSurface,
  },
  itemDetalhe: {
    ...tipografia.labelMd,
    color: cores.primary,
  },
  remover: {
    padding: espaco.xs,
  },
});
