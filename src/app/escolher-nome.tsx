import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../components/Botao';
import { Campo } from '../components/Campo';
import { normalizarUsername, validarUsername } from '../domain/usuario';
import { definirUsername, ErroAuth, sair, usernameDisponivel } from '../services/auth';
import { useAuth } from '../store/auth';

// Para quem entrou sem @ (ex.: login social, ou @ ocupado no momento do cadastro).
export default function TelaEscolherNome() {
  const session = useAuth((s) => s.session);
  const recarregarPerfil = useAuth((s) => s.recarregarPerfil);
  const [username, setUsername] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function salvar() {
    if (!session) return;
    const nome = normalizarUsername(username);
    const erroValidacao = validarUsername(nome);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      if (!(await usernameDisponivel(nome))) {
        setErro(`O @${nome} já está em uso. Escolha outro.`);
        return;
      }
      await definirUsername(session.user.id, nome);
      // Com o @ salvo, o layout raiz leva para o app.
      await recarregarPerfil();
    } catch (e) {
      setErro(e instanceof ErroAuth ? e.message : 'Algo deu errado. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Escolha seu @</Text>
        <Text style={styles.texto}>É assim que outras pessoas vão te encontrar e te seguir no Foque.</Text>

        <Campo
          rotulo="Nome de usuário"
          prefixo="@"
          value={username}
          onChangeText={(texto) => setUsername(normalizarUsername(texto))}
          placeholder="seu.nome"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          onSubmitEditing={salvar}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Botao titulo={enviando ? 'Salvando…' : 'Continuar'} onPress={salvar} desativado={enviando} />
        <Botao titulo="Tentar carregar de novo" variante="secundario" onPress={recarregarPerfil} desativado={enviando} />
        <Botao titulo="Sair" variante="secundario" onPress={sair} desativado={enviando} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#fff',
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
  },
  texto: {
    fontSize: 16,
    color: '#4b5563',
  },
  erro: {
    color: '#b91c1c',
  },
});
