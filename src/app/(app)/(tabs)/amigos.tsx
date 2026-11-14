import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { Campo } from '../../../components/Campo';
import { Chip } from '../../../components/Chip';
import { LinhaFocando } from '../../../components/LinhaFocando';
import { LinhaPessoa } from '../../../components/LinhaPessoa';
import { useAgora } from '../../../components/useAgora';
import { focoEstaAtivo } from '../../../domain/focoAtivo';
import { mensagens, pts } from '../../../domain/mensagens';
import { tituloDoNivel } from '../../../domain/niveis';
import { nivelPorPontos } from '../../../domain/pontos';
import { normalizarUsername } from '../../../domain/usuario';
import { type FocoAtivo, listarFocandoAgora } from '../../../services/focoAtivo';
import {
  buscarNiveis,
  buscarPessoas,
  ErroSocial,
  listarSeguidores,
  listarSeguindo,
  type Pessoa,
  type PessoaComProgresso,
  type Seguidor,
  seguir,
} from '../../../services/social';
import { useAuth } from '../../../store/auth';
import { cartao, cores, espaco, raio, rotuloSecao, tipografia } from '../../../theme';

/** De quanto em quanto tempo a seção "Focando agora" recarrega com a aba aberta. */
const RECARGA_FOCANDO_MS = 30_000;

export default function TelaAmigos() {
  const router = useRouter();
  const meuId = useAuth((s) => s.session?.user.id);

  const [seguindo, setSeguindo] = useState<PessoaComProgresso[] | null>(null);
  const [seguidores, setSeguidores] = useState<Seguidor[] | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);
  // Nível de quem eu não sigo (seguidores e resultados da busca), por id. O nível é público.
  const [niveis, setNiveis] = useState<Record<string, number>>({});

  // As duas listas começam recolhidas. O Perfil pede para abrir uma delas pelo parâmetro "abrir".
  const { abrir, t } = useLocalSearchParams<{ abrir?: string; t?: string }>();
  const [aberta, setAberta] = useState<{ seguindo: boolean; seguidores: boolean }>({
    seguindo: false,
    seguidores: false,
  });
  const pedido = abrir ? `${abrir}-${t ?? ''}` : null;
  const [pedidoAtendido, setPedidoAtendido] = useState<string | null>(null);
  if (pedido && pedido !== pedidoAtendido) {
    setPedidoAtendido(pedido);
    setAberta({ seguindo: abrir === 'seguindo', seguidores: abrir === 'seguidores' });
  }

  // null: ainda não carregou.
  const [focando, setFocando] = useState<FocoAtivo[] | null>(null);
  const [erroFocando, setErroFocando] = useState(false);

  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<Pessoa[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [seguindoAgora, setSeguindoAgora] = useState<string | null>(null);

  const carregarSeguindo = useCallback(async () => {
    if (!meuId) return;
    try {
      // Do maior para o menor número de pontos.
      const [pessoas, quemMeSegue] = await Promise.all([listarSeguindo(meuId), listarSeguidores(meuId)]);
      setSeguindo(pessoas.sort((a, b) => b.pontosTotais - a.pontosTotais));
      setSeguidores(quemMeSegue);
      setErroLista(null);
      // De quem eu não sigo, os pontos não vêm: busca só o nível.
      const semPontos = quemMeSegue.filter((p) => p.pontosTotais === null).map((p) => p.id);
      const novos = await buscarNiveis(semPontos);
      setNiveis((atual) => ({ ...atual, ...novos }));
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

  const carregarFocando = useCallback(async () => {
    try {
      setFocando(await listarFocandoAgora());
      setErroFocando(false);
    } catch {
      // Não derruba a tela: mantém a última lista (os focos vencem sozinhos pelo relógio).
      setErroFocando(true);
    }
  }, []);

  // "Focando agora": carrega ao abrir a aba e a cada 30 s enquanto ela está aberta.
  useFocusEffect(
    useCallback(() => {
      if (!meuId) return;
      carregarFocando();
      const intervalo = setInterval(carregarFocando, RECARGA_FOCANDO_MS);
      return () => clearInterval(intervalo);
    }, [meuId, carregarFocando]),
  );

  // Um relógio só para a tela toda; parado quando não há ninguém focando.
  const agora = useAgora((focando?.length ?? 0) > 0);
  // Focos que venceram no relógio local somem sem esperar a recarga.
  const focandoAgora = useMemo(
    () => (focando ?? []).filter((foco) => focoEstaAtivo(foco, agora)),
    [focando, agora],
  );
  const idsFocando = useMemo(() => new Set(focandoAgora.map((foco) => foco.userId)), [focandoAgora]);

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
        const novos = await buscarNiveis(pessoas.map((p) => p.id));
        if (!cancelado) {
          setResultados(pessoas);
          setNiveis((atual) => ({ ...atual, ...novos }));
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

  // Nível de qualquer pessoa da tela: pelos pontos de quem eu sigo, ou pelo nível público.
  const nivelDe = useMemo(() => {
    const porId = new Map<string, number>(Object.entries(niveis));
    for (const p of seguindo ?? []) porId.set(p.id, nivelPorPontos(p.pontosTotais));
    return (id: string) => porId.get(id);
  }, [niveis, seguindo]);
  const textoNivel = (id: string) => {
    const nivel = nivelDe(id);
    return nivel === undefined ? undefined : `Nível ${nivel} · ${tituloDoNivel(nivel)}`;
  };

  async function seguirPessoa(pessoa: Pessoa) {
    if (!meuId) return;
    setSeguindoAgora(pessoa.id);
    try {
      await seguir(meuId, pessoa.id);
      await carregarSeguindo();
      // A pessoa nova pode estar focando agora.
      carregarFocando();
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

        {/* Quem eu sigo e está focando agora */}
        <View style={styles.secao}>
          <Text style={rotuloSecao}>
            Focando agora{focandoAgora.length > 0 ? ` (${focandoAgora.length})` : ''}
          </Text>
          {focando === null && !erroFocando ? <ActivityIndicator color={cores.primary} /> : null}
          {focando === null && erroFocando ? (
            <Text style={styles.vazio}>{mensagens.erroFocando}</Text>
          ) : null}
          {focando !== null && focandoAgora.length === 0 ? (
            <Text style={styles.vazio}>{mensagens.ninguemFocando}</Text>
          ) : null}
          {focandoAgora.map((foco) => (
            <LinhaFocando
              key={foco.userId}
              foco={foco}
              agora={agora}
              nivel={nivelDe(foco.userId)}
              onPress={() => router.push(`/usuario/${foco.username}`)}
            />
          ))}
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
              aparencia={pessoa.aparencia}
              detalhe={textoNivel(pessoa.id)}
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

        {/* Quem eu sigo e quem me segue: duas listas recolhidas, que abrem ao tocar. */}
        <View style={styles.secao}>
          {erroLista ? (
            <View style={styles.secao}>
              <Text style={styles.erro}>{erroLista}</Text>
              <Botao titulo="Tentar de novo" variante="secundario" onPress={carregarSeguindo} />
            </View>
          ) : null}

          <CabecalhoLista
            titulo="Seguindo"
            quantidade={seguindo?.length}
            aberta={aberta.seguindo}
            onPress={() => setAberta((a) => ({ ...a, seguindo: !a.seguindo }))}
          />
          {aberta.seguindo ? (
            <View style={styles.itensLista}>
              {seguindo === null && !erroLista ? <ActivityIndicator color={cores.primary} /> : null}
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
                    aparencia={pessoa.aparencia}
                    detalhe={`Nível ${nivel} · ${tituloDoNivel(nivel)}`}
                    destaque={pts(pessoa.pontosTotais)}
                    focando={idsFocando.has(pessoa.id)}
                    onPress={() => router.push(`/usuario/${pessoa.username}`)}
                  />
                );
              })}
            </View>
          ) : null}

          <CabecalhoLista
            titulo="Seguidores"
            quantidade={seguidores?.length}
            aberta={aberta.seguidores}
            onPress={() => setAberta((a) => ({ ...a, seguidores: !a.seguidores }))}
          />
          {aberta.seguidores ? (
            <View style={styles.itensLista}>
              {seguidores === null && !erroLista ? <ActivityIndicator color={cores.primary} /> : null}
              {seguidores?.length === 0 ? (
                <View style={cartao}>
                  <Text style={styles.textoConvite}>
                    Ninguém segue você ainda. Passe o seu @ para os amigos! 🦭
                  </Text>
                </View>
              ) : null}
              {seguidores?.map((pessoa) => {
                const jaSigo = idsSeguindo.has(pessoa.id);
                return (
                  <LinhaPessoa
                    key={pessoa.id}
                    username={pessoa.username}
                    aparencia={pessoa.aparencia}
                    detalhe={textoNivel(pessoa.id) ?? 'Segue você'}
                    focando={idsFocando.has(pessoa.id)}
                    onPress={() => router.push(`/usuario/${pessoa.username}`)}
                    acao={
                      jaSigo ? undefined : (
                        <Botao
                          titulo={seguindoAgora === pessoa.id ? '…' : 'Seguir'}
                          onPress={() => seguirPessoa(pessoa)}
                          desativado={seguindoAgora !== null}
                        />
                      )
                    }
                  />
                );
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

interface CabecalhoListaProps {
  titulo: string;
  /** undefined enquanto carrega. */
  quantidade: number | undefined;
  aberta: boolean;
  onPress: () => void;
}

/** Título de uma lista que abre e fecha: nome, quantidade e a seta que indica o estado. */
function CabecalhoLista({ titulo, quantidade, aberta, onPress }: CabecalhoListaProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ expanded: aberta }}
      accessibilityLabel={`${titulo}: ${quantidade ?? 0}. ${aberta ? 'Toque para recolher' : 'Toque para ver a lista'}`}
      style={({ pressed }) => [styles.cabecalhoLista, aberta && styles.cabecalhoListaAberta, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.tituloLista}>{titulo}</Text>
      <View style={styles.contador}>
        <Text style={styles.textoContador}>{quantidade ?? '–'}</Text>
      </View>
      <Text style={styles.dicaLista}>{aberta ? 'Recolher' : 'Ver lista'}</Text>
      <MaterialIcons name={aberta ? 'expand-less' : 'expand-more'} size={26} color={cores.primary} />
    </Pressable>
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
  cabecalhoLista: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: raio.md,
    borderWidth: 2,
    borderColor: cores.iceBorder,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm + 4,
  },
  cabecalhoListaAberta: {
    borderColor: cores.primaryContainer,
    backgroundColor: cores.surfaceContainerLow,
  },
  tituloLista: {
    ...tipografia.headlineSm,
    color: cores.onSurface,
  },
  contador: {
    minWidth: 28,
    paddingHorizontal: espaco.sm,
    paddingVertical: 2,
    borderRadius: raio.full,
    backgroundColor: cores.primaryFixed,
    alignItems: 'center',
  },
  textoContador: {
    ...tipografia.labelLg,
    color: cores.primary,
  },
  dicaLista: {
    ...tipografia.labelMd,
    color: cores.primary,
    flex: 1,
    textAlign: 'right',
  },
  itensLista: {
    gap: espaco.sm,
    marginBottom: espaco.sm,
  },
  textoConvite: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
});
