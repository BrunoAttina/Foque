import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../components/Botao';
import { Campo } from '../components/Campo';
import { normalizarUsername, validarEmail, validarSenha, validarUsername } from '../domain/usuario';
import { cadastrar, ErroAuth, usernameDisponivel } from '../services/auth';

export default function TelaCadastro() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmarEmail, setConfirmarEmail] = useState(false);

  async function enviar() {
    const nome = normalizarUsername(username);
    const erroValidacao = validarUsername(nome) ?? validarEmail(email) ?? validarSenha(senha);
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
      const entrou = await cadastrar(email, senha, nome);
      // Se já entrou, o layout raiz leva para o app. Senão, falta confirmar o e-mail.
      if (!entrou) setConfirmarEmail(true);
    } catch (e) {
      setErro(e instanceof ErroAuth ? e.message : 'Algo deu errado. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  if (confirmarEmail) {
    return (
      <SafeAreaView style={styles.tela}>
        <ScrollView contentContainerStyle={styles.conteudo}>
          <Text style={styles.titulo}>Confirme seu e-mail</Text>
          <Text style={styles.texto}>
            Enviamos um link de confirmação para {email.trim()}. Abra o link e depois volte aqui para entrar.
          </Text>
          <Botao titulo="Ir para o login" onPress={() => router.replace('/entrar')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.texto}>Escolha seu @. É assim que outras pessoas vão te encontrar.</Text>

        <Campo
          rotulo="Nome de usuário"
          prefixo="@"
          value={username}
          onChangeText={(texto) => setUsername(normalizarUsername(texto))}
          placeholder="seu.nome"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          autoComplete="username-new"
        />
        <Campo
          rotulo="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Campo
          rotulo="Senha"
          value={senha}
          onChangeText={setSenha}
          placeholder="Pelo menos 8 caracteres"
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          onSubmitEditing={enviar}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Botao titulo={enviando ? 'Criando conta…' : 'Criar conta'} onPress={enviar} desativado={enviando} />
        <Botao
          titulo="Já tenho conta"
          variante="secundario"
          onPress={() => router.replace('/entrar')}
          desativado={enviando}
        />
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
