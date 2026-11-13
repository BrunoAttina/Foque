import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { Campo } from '../../../components/Campo';
import { Chip } from '../../../components/Chip';
import { LinhaPessoa } from '../../../components/LinhaPessoa';
import { pts } from '../../../domain/mensagens';
import { tituloDoNivel } from '../../../domain/niveis';
import { nivelPorPontos } from '../../../domain/pontos';
import { normalizarUsername } from '../../../domain/usuario';
import {
  buscarPessoas,
  ErroSocial,
  listarSeguindo,
  type Pessoa,
  type PessoaComProgresso,
  seguir,
} from '../../../services/social';
import { useAuth } from '../../../store/auth';
import { cartao, cores, espaco, rotuloSecao, tipografia } from '../../../theme';

export default function TelaAmigos() {
  const router = useRouter();
  const meuId = useAuth((s) => s.session?.user.id);

  const [seguindo, setSeguindo] = useState<PessoaComProgresso[] | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);

  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<Pessoa[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [seguindoAgora, setSeguindoAgora] = useState<string | null>(null);

  const carregarSeguindo = useCallback(async () => {
    if (!meuId) return;
    try {
      // Do maior para o menor número de pontos.
      const pessoas = await listarSeguindo(meuId);
      setSeguindo(pessoas.sort((a, b) => b.pontosTotais - a.pontosTotais));
      setErroLista(null);
    } catch (e) {
      setErroLista(e instanceof ErroSocial ? e.message : 'Algo deu errado.');
    }
  }, [meuId]);

  // Recarrega ao voltar para a aba (ex.: depois de deixar de seguir no perfil).
  useFocusEffect(
    useCallback(() => {
      carregarSeguindo();
    }, [carregarSeguindo]),
  );

  function mudarTermo(texto: string) {
    const novo = normalizarUsername(texto);
    setTermo(novo);
    if (novo.length === 0) {
      setResultados([]);
      setErroBusca(null);
    }
  }

  // Busca 300 ms depois que a pessoa para de digitar.
  useEffect(() => {
    // Campo vazio: mudarTermo já limpou os resultados.
    if (!meuId || termo.length === 0) return;
    let cancelado = false;
    const espera = setTimeout(async () => {
      setBuscando(true);
      try {
        const pessoas = await buscarPessoas(termo, meuId);
        if (!cancelado) {
          setResultados(pessoas);
          setErroBusca(null);
        }
      } catch (e) {
        if (!cancelado) setErroBusca(e instanceof ErroSocial ? e.message : 'Algo deu errado.');
      } finally {
        if (!cancelado) setBuscando(false);
      }
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [termo, meuId]);

  const idsSeguindo = useMemo(() => new Set((seguindo ?? []).map((p) => p.id)), [seguindo]);

  async function seguirPessoa(pessoa: Pessoa) {
    if (!meuId) return;
    setSeguindoAgora(pessoa.id);
    try {
      await seguir(meuId, pessoa.id);
      await carregarSeguindo();
      setErroBusca(null);
    } catch (e) {
      setErroBusca(e instanceof ErroSocial ? e.message : 'Algo deu errado.');
    } finally {
      setSeguindoAgora(null);
    }
  }

  return (
    <View style={styles.tela}>
      <CabecalhoApp />
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={styles.titulo}>Amigos 🦭</Text>
          <Text style={styles.subtitulo}>Siga seus amigos e acompanhe o foque deles.</Text>
        </View>

        {/* Encontrar amigos */}
        <View style={styles.secao}>
          <Campo
            rotulo="Encontrar amigos"
            prefixo="@"
            value={termo}
            onChangeText={mudarTermo}
            placeholder="nome.de.usuario"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
          {buscando ? <ActivityIndicator color={cores.primary} /> : null}
          {erroBusca ? <Text style={styles.erro}>{erroBusca}</Text> : null}

          {termo && !buscando && !erroBusca && resultados.length === 0 ? (
            <Text style={styles.vazio}>Nenhuma foca encontrada com @{termo}. 🧊</Text>
          ) : null}

          {resultados.map((pessoa) => (
            <LinhaPessoa
              key={pessoa.id}
              username={pessoa.username}
              onPress={() => router.push(`/usuario/${pessoa.username}`)}
              acao={
                idsSeguindo.has(pessoa.id) ? (
                  <Chip icone="check-circle" corIcone={cores.secondary} texto="Seguindo" />
                ) : (
                  <Botao
                    titulo={seguindoAgora === pessoa.id ? '…' : 'Seguir'}
                    onPress={() => seguirPessoa(pessoa)}
                    desativado={seguindoAgora !== null}
                  />
                )
              }
            />
          ))}
        </View>

        {/* Amigos já seguidos */}
        <View style={styles.secao}>
          <Text style={rotuloSecao}>Seguindo{seguindo ? ` (${seguindo.length})` : ''}</Text>
          {seguindo === null && !erroLista ? <ActivityIndicator color={cores.primary} /> : null}
          {erroLista ? (
            <View style={styles.secao}>
              <Text style={styles.erro}>{erroLista}</Text>
              <Botao titulo="Tentar de novo" variante="secundario" onPress={carregarSeguindo} />
            </View>
          ) : null}

          {seguindo?.length === 0 ? (
            <View style={cartao}>
              <Text style={styles.textoConvite}>
                Você ainda não segue ninguém. Procure seus amigos pelo @ aqui em cima! 🦭
              </Text>
            </View>
          ) : null}

          {seguindo?.map((pessoa) => {
            const nivel = nivelPorPontos(pessoa.pontosTotais);
            return (
              <LinhaPessoa
                key={pessoa.id}
                username={pessoa.username}
                detalhe={`Nível ${nivel} · ${tituloDoNivel(nivel)}`}
                destaque={pts(pessoa.pontosTotais)}
                onPress={() => router.push(`/usuario/${pessoa.username}`)}
              />
            );
          })}
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
    gap: espaco.lg,
    paddingBottom: espaco.xl,
  },
  titulo: {
    ...tipografia.headlineLg,
    color: cores.onSurface,
  },
  subtitulo: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
  },
  secao: {
    gap: espaco.sm,
  },
  erro: {
    ...tipografia.bodySm,
    color: cores.error,
  },
  vazio: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
  textoConvite: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
});
