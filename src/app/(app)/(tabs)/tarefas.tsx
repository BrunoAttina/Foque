import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { Campo } from '../../../components/Campo';
import { pts } from '../../../domain/mensagens';
import { emojiDaTarefa, validarTarefa } from '../../../domain/tarefas';
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
  const [duracao, setDuracao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function adicionarTarefa() {
    const resultado = validarTarefa(nome, duracao);
    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    setSalvando(true);
    try {
      await adicionar(resultado.nome, resultado.duracaoMinutos);
      setNome('');
      setDuracao('');
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
                rotulo="Nova missão"
                placeholder="Ex.: Ler um livro"
                value={nome}
                onChangeText={setNome}
                maxLength={60}
                returnKeyType="next"
              />
              <Campo
                rotulo="Duração (minutos)"
                placeholder="25"
                value={duracao}
                onChangeText={setDuracao}
                keyboardType="number-pad"
                maxLength={3}
                onSubmitEditing={adicionarTarefa}
              />
              {erro ? <Text style={styles.erro}>{erro}</Text> : null}
              <Botao
                titulo={salvando ? 'Salvando…' : 'Adicionar missão'}
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
            <Text style={styles.vazio}>Nenhuma missão ainda. Escolha uma coisa importante para hoje. 🧊</Text>
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
            <Botao titulo="Focar" onPress={() => focar(item)} />
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
