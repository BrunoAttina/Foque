import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalaoFala } from '../components/BalaoFala';
import { Botao } from '../components/Botao';
import { Campo } from '../components/Campo';
import { Mascote } from '../components/Mascote';
import { validarEmail } from '../domain/usuario';
import { entrar, ErroAuth } from '../services/auth';
import { cores, espaco, tipografia } from '../theme';

export default function TelaEntrar() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const erroEmail = validarEmail(email);
    if (erroEmail || !senha) {
      setErro(erroEmail ?? 'Informe sua senha.');
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      // Ao entrar, o layout raiz leva para o app automaticamente.
      await entrar(email, senha);
    } catch (e) {
      setErro(e instanceof ErroAuth ? e.message : 'Algo deu errado. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <View style={styles.topo}>
            <Text style={styles.marca}>Foque</Text>
            <Text style={styles.slogan}>A foca que te ajuda a focar no que importa.</Text>
          </View>

          <View style={styles.mascote}>
            <BalaoFala texto="De volta? Então larga o TikTok e entra logo. 👀" />
            <Mascote tamanho={120} />
          </View>

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
            placeholder="Sua senha"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            onSubmitEditing={enviar}
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <Botao titulo={enviando ? 'Entrando…' : 'Entrar'} icone="ac-unit" onPress={enviar} desativado={enviando} />
          <Botao
            titulo="Criar conta"
            variante="secundario"
            onPress={() => router.replace('/cadastro')}
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
  topo: {
    alignItems: 'center',
  },
  marca: {
    ...tipografia.display,
    color: cores.primary,
  },
  slogan: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
  mascote: {
    alignItems: 'center',
    gap: espaco.xs,
  },
  erro: {
    ...tipografia.bodySm,
    color: cores.error,
  },
});
