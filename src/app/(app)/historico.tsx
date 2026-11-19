import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../components/Botao';
import { agruparPorDia, horaLocal, tituloDoDia } from '../../domain/historico';
import { pts } from '../../domain/mensagens';
import { emojiDaTarefa } from '../../domain/tarefas';
import { enviarPendentes } from '../../services/filaSessoes';
import { ErroHistorico, type FocoRealizado, listarFocosRealizados, PAGINA_HISTORICO } from '../../services/sessoes';
import { useAuth } from '../../store/auth';
import { cartao, cores, espaco, raio, rotuloSecao, tipografia } from '../../theme';

/** Histórico de focos: as sessões concluídas, do mais recente para o mais antigo, agrupadas por dia. */
export default function TelaHistorico() {
  const meuId = useAuth((s) => s.session?.user.id);
  // null: ainda não carregou.
  const [focos, setFocos] = useState<FocoRealizado[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [temMais, setTemMais] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [agora] = useState(() => Date.now());

  const carregar = useCallback(async () => {
    // Antes, envia as sessões concluídas sem internet, para entrarem na lista.
    if (meuId) await enviarPendentes(meuId).catch(() => undefined);
    try {
      const pagina = await listarFocosRealizados();
      setFocos(pagina);
      setTemMais(pagina.length === PAGINA_HISTORICO);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroHistorico ? e.message : 'Algo deu errado.');
    }
  }, [meuId]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      if (meuId) await enviarPendentes(meuId).catch(() => undefined);
      try {
        const pagina = await listarFocosRealizados();
        if (!ativo) return;
        setFocos(pagina);
        setTemMais(pagina.length === PAGINA_HISTORICO);
      } catch (e) {
        if (ativo) setErro(e instanceof ErroHistorico ? e.message : 'Algo deu errado.');
      }
    })();
    return () => {
      ativo = false;
    };
  }, [meuId]);

  async function carregarMais() {
    if (!focos || focos.length === 0 || carregandoMais) return;
    setCarregandoMais(true);
    try {
      const ultimo = focos[focos.length - 1];
      const pagina = await listarFocosRealizados(new Date(ultimo.fim).toISOString());
      setFocos([...focos, ...pagina]);
      setTemMais(pagina.length === PAGINA_HISTORICO);
      setErro(null);
    } catch (e) {
      setErro(e instanceof ErroHistorico ? e.message : 'Algo deu errado.');
    } finally {
      setCarregandoMais(false);
    }
  }

  const secoes = useMemo(
    () =>
      agruparPorDia(focos ?? []).map((grupo) => ({
        titulo: tituloDoDia(grupo.dia, agora),
        minutos: grupo.itens.reduce((soma, f) => soma + f.duracaoMinutos, 0),
        data: grupo.itens,
      })),
    [focos, agora],
  );

  return (
    <SafeAreaView style={styles.tela} edges={['bottom', 'left', 'right']}>
      <SectionList
        sections={secoes}
        keyExtractor={(foco) => foco.id}
        contentContainerStyle={styles.conteudo}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.topo}>
            <Text style={styles.subtitulo}>Todos os focos que você concluiu.</Text>
            {erro ? (
              <View style={styles.blocoErro}>
                <Text style={styles.erro}>{erro}</Text>
                <Botao titulo="Tentar de novo" variante="secundario" onPress={carregar} />
              </View>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.cabecalhoDia}>
            <Text style={rotuloSecao}>{section.titulo}</Text>
            <Text style={styles.totalDia}>{section.minutos} min</Text>
          </View>
        )}
        renderItem={({ item }) => <LinhaHistorico foco={item} />}
        ListEmptyComponent={
          focos === null ? (
            erro ? undefined : <ActivityIndicator color={cores.primary} style={styles.vazio} />
          ) : (
            <Text style={styles.vazio}>Nenhum foco concluído ainda. O primeiro vai aparecer aqui. 🧊</Text>
          )
        }
        ListFooterComponent={
          temMais ? (
            <Botao
              titulo={carregandoMais ? 'Carregando…' : 'Ver mais antigos'}
              variante="secundario"
              onPress={carregarMais}
              desativado={carregandoMais}
            />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

function LinhaHistorico({ foco }: { foco: FocoRealizado }) {
  return (
    <View
      style={[cartao, styles.linha]}
      accessible
      accessibilityLabel={`${foco.tarefa}, ${foco.duracaoMinutos} minutos, terminou às ${horaLocal(foco.fim)}, ${pts(foco.pontos)}`}
    >
      <Text style={styles.emoji}>{emojiDaTarefa(foco.tarefa)}</Text>
      <View style={styles.textos}>
        <Text style={styles.nome} numberOfLines={2}>
          {foco.tarefa}
        </Text>
        <Text style={styles.detalhe}>
          {horaLocal(foco.inicio)} – {horaLocal(foco.fim)} · {foco.duracaoMinutos} min
        </Text>
      </View>
      <Text style={styles.pontos}>+{pts(foco.pontos)}</Text>
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
    gap: espaco.sm,
  },
  topo: {
    gap: espaco.sm,
  },
  subtitulo: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
  },
  blocoErro: {
    gap: espaco.sm,
  },
  erro: {
    ...tipografia.bodySm,
    color: cores.error,
  },
  cabecalhoDia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: espaco.md,
    paddingHorizontal: espaco.xs,
  },
  totalDia: {
    ...tipografia.labelMd,
    color: cores.secondary,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm + 4,
    padding: espaco.sm + 4,
  },
  emoji: {
    fontSize: 22,
    width: 40,
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 40,
    backgroundColor: cores.surfaceContainerLow,
    borderRadius: raio.md,
    overflow: 'hidden',
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  nome: {
    ...tipografia.headlineSm,
    color: cores.onSurface,
  },
  detalhe: {
    ...tipografia.labelMd,
    color: cores.onSurfaceVariant,
  },
  pontos: {
    ...tipografia.labelLg,
    color: cores.primary,
  },
  vazio: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
    marginTop: espaco.lg,
  },
});
