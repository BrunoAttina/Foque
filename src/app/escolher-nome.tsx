import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalaoFala } from '../components/BalaoFala';
import { Botao } from '../components/Botao';
import { Campo } from '../components/Campo';
import { Mascote } from '../components/Mascote';
import { normalizarUsername, validarUsername } from '../domain/usuario';
import { definirUsername, ErroAuth, sair, usernameDisponivel } from '../services/auth';
import { useAuth } from '../store/auth';
import { cores, espaco, tipografia } from '../theme';

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
        <View style={styles.mascote}>
          <BalaoFala texto="Sem @ eu nem sei como te chamar. Escolhe um aí. 🦭" />
          <Mascote tamanho={120} estado="acenando" />
        </View>

        <View>
          <Text style={styles.titulo}>Escolha seu @</Text>
          <Text style={styles.texto}>É assim que outras pessoas vão te encontrar e te seguir no Foque.</Text>
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
          onSubmitEditing={salvar}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Botao titulo={enviando ? 'Salvando…' : 'Continuar'} onPress={salvar} desativado={enviando} />
        <Botao titulo="Tentar carregar de novo" variante="secundario" onPress={recarregarPerfil} desativado={enviando} />
        <Botao titulo="Sair" icone="logout" variante="perigo" onPress={sair} desativado={enviando} />
      </ScrollView>
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
