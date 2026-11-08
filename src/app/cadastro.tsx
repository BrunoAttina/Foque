import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalaoFala } from '../components/BalaoFala';
import { Botao } from '../components/Botao';
import { Campo } from '../components/Campo';
import { Mascote } from '../components/Mascote';
import { normalizarUsername, validarEmail, validarSenha, validarUsername } from '../domain/usuario';
import { cadastrar, ErroAuth, usernameDisponivel } from '../services/auth';
import { cores, espaco, tipografia } from '../theme';

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
          <View style={styles.mascote}>
            <BalaoFala texto="Quase lá! Confirma o e-mail e volta aqui. Eu espero. 🐟" />
            <Mascote tamanho={120} />
          </View>
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
      <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <View style={styles.mascote}>
            <BalaoFala texto="Uma foca nova no pedaço? Escolhe um @ à altura. 🦭" />
            <Mascote tamanho={110} />
          </View>

          <View>
            <Text style={styles.titulo}>Criar conta</Text>
            <Text style={styles.texto}>Seu @ é como outras pessoas vão te encontrar.</Text>
          </View>

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

          <Botao titulo={enviando ? 'Criando conta…' : 'Criar conta'} icone="pets" onPress={enviar} desativado={enviando} />
          <Botao
            titulo="Já tenho conta"
            variante="secundario"
            onPress={() => router.replace('/entrar')}
            desativado={enviando}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.surface,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espaco.lg,
    gap: espaco.md,
  },
  mascote: {
    alignItems: 'center',
    gap: espaco.xs,
  },
  titulo: {
    ...tipografia.headlineLg,
    color: cores.onSurface,
  },
  texto: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
  },
  erro: {
    ...tipografia.bodySm,
    color: cores.error,
  },
});
