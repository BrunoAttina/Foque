import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../components/Botao';
import { pontosDeFoco } from '../../domain/mensagens';
import { nivelPorPontos, pontosParaNivel } from '../../domain/pontos';
import { validarTarefa } from '../../domain/tarefas';
import { sair } from '../../services/auth';
import { ErroTarefas } from '../../services/tarefas';
import { useAuth } from '../../store/auth';
import { useSessao } from '../../store/sessao';
import { type Tarefa, useTarefas } from '../../store/tarefas';

export default function TelaTarefas() {
  const router = useRouter();
  const tarefas = useTarefas((s) => s.tarefas);
  const adicionar = useTarefas((s) => s.adicionar);
  const remover = useTarefas((s) => s.remover);
  const pontosTotais = useSessao((s) => s.pontosTotais);
  const iniciar = useSessao((s) => s.iniciar);
  const username = useAuth((s) => s.perfil?.username);

  const [nome, setNome] = useState('');
  const [duracao, setDuracao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const carregandoTarefas = useTarefas((s) => s.carregando);

  const nivel = nivelPorPontos(pontosTotais);
  const faltam = pontosParaNivel(nivel + 1) - pontosTotais;

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
    <SafeAreaView style={styles.tela}>
      <FlatList
        data={tarefas}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <View style={styles.topo}>
              <View>
                <Text style={styles.titulo}>Foque</Text>
                {username ? <Text style={styles.textoSuave}>@{username}</Text> : null}
              </View>
              <Botao titulo="Sair" variante="secundario" onPress={sair} />
            </View>

            <View style={styles.progresso}>
              <Text style={styles.nivel}>Nível de foco {nivel}</Text>
              <Text style={styles.textoSuave}>
                {pontosDeFoco(pontosTotais)} · faltam {faltam} para o nível {nivel + 1}
              </Text>
            </View>

            <View style={styles.acoesSociais}>
              <View style={styles.acaoSocial}>
                <Botao titulo="Buscar pessoas" variante="secundario" onPress={() => router.push('/buscar')} />
              </View>
              <View style={styles.acaoSocial}>
                <Botao titulo="Seguindo" variante="secundario" onPress={() => router.push('/seguindo')} />
              </View>
            </View>

            <Text style={styles.subtitulo}>Tarefas do dia</Text>

            <TextInput
              style={styles.campo}
              placeholder="Ex.: Ler um livro"
              value={nome}
              onChangeText={setNome}
              maxLength={60}
              returnKeyType="next"
            />
            <TextInput
              style={styles.campo}
              placeholder="Duração em minutos"
              value={duracao}
              onChangeText={setDuracao}
              keyboardType="number-pad"
              maxLength={3}
              onSubmitEditing={adicionarTarefa}
            />
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
            <Botao
              titulo={salvando ? 'Salvando…' : 'Adicionar tarefa'}
              onPress={adicionarTarefa}
              desativado={salvando}
            />
          </View>
        }
        ListEmptyComponent={
          carregandoTarefas ? (
            <ActivityIndicator style={styles.vazio} />
          ) : (
            <Text style={[styles.textoSuave, styles.vazio]}>
              Nenhuma tarefa ainda. Escolha uma coisa importante para hoje.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemTexto}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.textoSuave}>{item.duracaoMinutos} min</Text>
            </View>
            <View style={styles.itemAcoes}>
              <Botao titulo="Remover" variante="secundario" onPress={() => removerTarefa(item.id)} />
              <Botao titulo="Focar" onPress={() => focar(item)} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#fff',
  },
  conteudo: {
    padding: 16,
    gap: 12,
  },
  acoesSociais: {
    flexDirection: 'row',
    gap: 8,
  },
  acaoSocial: {
    flex: 1,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cabecalho: {
    gap: 12,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
  },
  progresso: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  nivel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  erro: {
    color: '#b91c1c',
  },
  textoSuave: {
    color: '#6b7280',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 16,
  },
  item: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  itemTexto: {
    gap: 2,
  },
  itemNome: {
    fontSize: 17,
    fontWeight: '600',
  },
  itemAcoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
