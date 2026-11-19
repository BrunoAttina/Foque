import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraProgresso } from '../../components/BarraProgresso';
import { Botao } from '../../components/Botao';
import { SeloConquista } from '../../components/SeloConquista';
import {
  CORES_DAS_CATEGORIAS,
  corDoNivel,
  descricaoDaConquistaFoco,
  MOEDAS_POR_CONQUISTA,
  NOMES_DAS_CATEGORIAS,
  niveisDoFoco,
  progressoDaFixa,
  tituloDaConquistaFoco,
  unidadeDaCategoria,
  type ConquistaFixa,
  type ConquistaFoco,
  type NivelFoco,
  type ProgressoConquistas,
} from '../../domain/conquistas';
import { buscarConquistas, type ConquistasDaPessoa, ErroConquistas } from '../../services/conquistas';
import { useAuth } from '../../store/auth';
import { cartao, cores, espaco, rotuloSecao, tipografia } from '../../theme';

/** 1000 → "1.000". */
function milhar(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** "12 de nov." */
function dataCurta(iso: string): string {
  const meses = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  const d = new Date(iso);
  return `${d.getDate()} de ${meses[d.getMonth()]}`;
}

/** Todas as conquistas de uma pessoa. Do usuário logado, mostra também as que faltam, com o progresso. */
export default function TelaConquistas() {
  const { id, username } = useLocalSearchParams<{ id: string; username?: string }>();
  const meuId = useAuth((s) => s.session?.user.id);
  const meu = !!id && id === meuId;

  const [dados, setDados] = useState<ConquistasDaPessoa | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!id) return;
    try {
      setDados(await buscarConquistas(id, meu));
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroConquistas ? e.message : 'Algo deu errado.');
    }
  }, [id, meu]);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    buscarConquistas(id, meu).then(
      (novos) => {
        if (ativo) setDados(novos);
      },
      (e) => {
        if (ativo) setErro(e instanceof ErroConquistas ? e.message : 'Algo deu errado.');
      },
    );
    return () => {
      ativo = false;
    };
  }, [id, meu]);

  const titulo = meu ? 'Suas conquistas' : username ? `Conquistas de @${username}` : 'Conquistas';

  // Personalizadas: do dono, também as que ainda não viraram conquista (progresso para o nível 1).
  const porFoco = (dados?.porFoco ?? []).filter((f) => f.nivel >= 1 || (meu && f.quantidade > 0));

  // Fixas agrupadas por categoria (as três da loja ficam juntas).
  const grupos: { nome: string; itens: ConquistaFixa[] }[] = [];
  for (const c of dados?.catalogo ?? []) {
    const obtida = dados?.obtidas.some((o) => o.conquistaId === c.id);
    if (!meu && !obtida) continue;
    const nome = NOMES_DAS_CATEGORIAS[c.categoria];
    const grupo = grupos.find((g) => g.nome === nome);
    if (grupo) grupo.itens.push(c);
    else grupos.push({ nome, itens: [c] });
  }

  return (
    <SafeAreaView style={styles.tela} edges={['bottom', 'left', 'right']}>
      <Stack.Screen options={{ title: titulo }} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.subtitulo}>
          Cada conquista vale {MOEDAS_POR_CONQUISTA} moedas.
          {meu ? ' As cinzas ainda faltam.' : ''}
        </Text>

        {dados === null && !erro ? <ActivityIndicator color={cores.primary} /> : null}
        {erro ? (
          <View style={styles.secao}>
            <Text style={styles.erro}>{erro}</Text>
            <Botao titulo="Tentar de novo" variante="secundario" onPress={carregar} />
          </View>
        ) : null}

        {dados ? (
          <>
            <View style={styles.secao}>
              <Text style={rotuloSecao}>Por foco</Text>
              {porFoco.length === 0 ? (
                <Text style={styles.vazio}>
                  {meu
                    ? 'Conclua 5 focos com o mesmo nome para ganhar a primeira conquista desse foco.'
                    : 'Nenhuma conquista por foco ainda.'}
                </Text>
              ) : null}
              {porFoco.map((foco) => (
                <CartaoFoco key={foco.chave} foco={foco} niveis={dados.niveis} />
              ))}
            </View>

            {grupos.map((grupo) => (
              <View key={grupo.nome} style={styles.secao}>
                <Text style={rotuloSecao}>{grupo.nome}</Text>
                {grupo.itens.map((c) => (
                  <CartaoFixa
                    key={c.id}
                    conquista={c}
                    obtidaEm={dados.obtidas.find((o) => o.conquistaId === c.id)?.obtidaEm ?? null}
                    progresso={dados.progresso}
                  />
                ))}
              </View>
            ))}
            {!meu && grupos.length === 0 ? <Text style={styles.vazio}>Nenhuma conquista fixa ainda.</Text> : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function CartaoFoco({ foco, niveis }: { foco: ConquistaFoco; niveis: NivelFoco[] }) {
  const { atual, proximo } = niveisDoFoco(niveis, foco);
  const titulo = atual ? tituloDaConquistaFoco(atual, foco.nome) : foco.nome;
  return (
    <View style={[cartao, styles.cartao]}>
      <SeloConquista icone="emoji-events" cor={corDoNivel(atual)} bloqueada={!atual} arcoIris={atual?.cor === 'arco-iris'} />
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descricao}>{descricaoDaConquistaFoco(foco.quantidade, foco.nome)}</Text>
        {proximo ? (
          <>
            <BarraProgresso fracao={foco.quantidade / proximo.meta} altura={8} />
            <Text style={styles.proximo}>
              {foco.quantidade} de {proximo.meta} para {`"${tituloDaConquistaFoco(proximo, foco.nome)}"`}
            </Text>
          </>
        ) : (
          <Text style={styles.maximo}>Nível máximo! 🎉</Text>
        )}
      </View>
    </View>
  );
}

function CartaoFixa({
  conquista,
  obtidaEm,
  progresso,
}: {
  conquista: ConquistaFixa;
  obtidaEm: string | null;
  progresso: ProgressoConquistas | null;
}) {
  const p = !obtidaEm && progresso ? progressoDaFixa(conquista, progresso) : null;
  return (
    <View style={[cartao, styles.cartao, !obtidaEm && styles.cartaoBloqueado]}>
      <SeloConquista icone={conquista.icone} cor={CORES_DAS_CATEGORIAS[conquista.categoria]} bloqueada={!obtidaEm} />
      <View style={styles.textos}>
        <Text style={[styles.titulo, !obtidaEm && { color: cores.onSurfaceVariant }]}>{conquista.titulo}</Text>
        <Text style={styles.descricao}>{conquista.descricao}</Text>
        {obtidaEm ? <Text style={styles.data}>Obtida em {dataCurta(obtidaEm)}</Text> : null}
        {p ? (
          <>
            <BarraProgresso fracao={p.meta > 0 ? p.valor / p.meta : 0} altura={8} />
            <Text style={styles.proximo}>
              {milhar(Math.min(p.valor, p.meta))} de {milhar(p.meta)} {unidadeDaCategoria(conquista.categoria)}
            </Text>
          </>
        ) : null}
      </View>
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
    paddingBottom: espaco.xl,
    gap: espaco.lg,
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
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm + 4,
    padding: espaco.sm + 4,
  },
  cartaoBloqueado: {
    backgroundColor: cores.surfaceContainerLow,
  },
  textos: {
    flex: 1,
    gap: 3,
  },
  titulo: {
    ...tipografia.headlineSm,
    color: cores.onSurface,
  },
  descricao: {
    ...tipografia.bodySm,
    color: cores.onSurfaceVariant,
  },
  data: {
    ...tipografia.labelSm,
    color: cores.secondary,
  },
  proximo: {
    ...tipografia.labelSm,
    color: cores.primary,
  },
  maximo: {
    ...tipografia.labelMd,
    color: cores.secondary,
  },
});
