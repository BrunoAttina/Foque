import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../components/Botao';
import { Campo } from '../components/Campo';
import { validarEmail } from '../domain/usuario';
import { entrar, ErroAuth } from '../services/auth';

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
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Foque</Text>
        <Text style={styles.subtitulo}>Foque no que realmente importa.</Text>

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

        <Botao titulo={enviando ? 'Entrando…' : 'Entrar'} onPress={enviar} desativado={enviando} />
        <Botao
          titulo="Criar conta"
          variante="secundario"
          onPress={() => router.replace('/cadastro')}
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
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  erro: {
    color: '#b91c1c',
  },
});
