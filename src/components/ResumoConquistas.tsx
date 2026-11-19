import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CORES_DAS_CATEGORIAS,
  corDoNivel,
  niveisDoFoco,
  tituloDaConquistaFoco,
} from '../domain/conquistas';
import { buscarConquistas, type ConquistasDaPessoa } from '../services/conquistas';
import { cartao, cores, espaco, rotuloSecao, tipografia } from '../theme';
import { SeloConquista } from './SeloConquista';

/** Quantos selos o resumo mostra. */
const SELOS_NO_RESUMO = 6;

interface ResumoConquistasProps {
  userId: string;
  username: string;
  /** É o perfil do usuário logado. */
  meu: boolean;
}

interface ItemResumo {
  chave: string;
  titulo: string;
  icone: string;
  cor: string;
  arcoIris: boolean;
  data: string;
}

/** Seção "Conquistas" do Perfil: as mais recentes em selos e o botão "Ver todas". */
export function ResumoConquistas({ userId, username, meu }: ResumoConquistasProps) {
  const router = useRouter();
  const [dados, setDados] = useState<ConquistasDaPessoa | null>(null);
  const [erro, setErro] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      buscarConquistas(userId, false).then(
        (novos) => {
          if (!ativo) return;
          setDados(novos);
          setErro(false);
        },
        () => {
          if (ativo) setErro(true);
        },
      );
      return () => {
        ativo = false;
      };
    }, [userId]),
  );

  const itens: ItemResumo[] = [];
  if (dados) {
    for (const foco of dados.porFoco) {
      if (foco.nivel < 1) continue;
      const { atual } = niveisDoFoco(dados.niveis, foco);
      if (!atual) continue;
      itens.push({
        chave: `foco-${foco.chave}`,
        titulo: tituloDaConquistaFoco(atual, foco.nome),
        icone: 'emoji-events',
        cor: corDoNivel(atual),
        arcoIris: atual.cor === 'arco-iris',
        data: foco.nivelEm ?? '',
      });
    }
    for (const obtida of dados.obtidas) {
      const c = dados.catalogo.find((x) => x.id === obtida.conquistaId);
      if (!c) continue;
      itens.push({
        chave: `fixa-${c.id}`,
        titulo: c.titulo,
        icone: c.icone,
        cor: CORES_DAS_CATEGORIAS[c.categoria],
        arcoIris: false,
        data: obtida.obtidaEm,
      });
    }
    itens.sort((a, b) => b.data.localeCompare(a.data));
  }

  function verTodas() {
    router.push({ pathname: '/conquistas', params: { id: userId, username } });
  }

  return (
    <View style={[cartao, styles.cartao]}>
      <View style={styles.topo}>
        <Text style={rotuloSecao}>Conquistas{dados ? ` (${itens.length})` : ''}</Text>
        <Pressable onPress={verTodas} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.verTodas}>Ver todas</Text>
        </Pressable>
      </View>

      {dados === null && !erro ? <ActivityIndicator color={cores.primary} /> : null}
      {erro && dados === null ? <Text style={styles.vazio}>Não foi possível carregar as conquistas.</Text> : null}
      {dados && itens.length === 0 ? (
        <Text style={styles.vazio}>
          {meu
            ? 'Nenhuma conquista ainda. Conclua focos para ganhar a primeira! 🧊'
            : `@${username} ainda não tem conquistas.`}
        </Text>
      ) : null}

      {itens.length > 0 ? (
        <Pressable onPress={verTodas} accessibilityRole="button" accessibilityLabel="Ver todas as conquistas">
          <View style={styles.grade}>
            {itens.slice(0, SELOS_NO_RESUMO).map((item) => (
              <View key={item.chave} style={styles.item}>
                <SeloConquista icone={item.icone} cor={item.cor} arcoIris={item.arcoIris} />
                <Text style={styles.tituloItem} numberOfLines={2}>
                  {item.titulo}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    gap: espaco.sm,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verTodas: {
    ...tipografia.labelMd,
    color: cores.primary,
  },
  vazio: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: espaco.md,
  },
  item: {
    width: '33.33%',
    alignItems: 'center',
    gap: espaco.xs,
    paddingHorizontal: 2,
  },
  tituloItem: {
    ...tipografia.labelSm,
    color: cores.onSurface,
    textAlign: 'center',
  },
});
