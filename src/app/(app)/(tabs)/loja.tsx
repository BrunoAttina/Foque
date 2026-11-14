import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BalaoFala } from '../../../components/BalaoFala';
import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { IMAGENS_FOQUE } from '../../../components/imagensFoque';
import { type AparenciaId, dadosDaAparencia, ehAparencia } from '../../../domain/aparencias';
import { falas, moedas as textoMoedas } from '../../../domain/mensagens';
import { ErroLoja, type ItemLoja } from '../../../services/loja';
import { useAparenciaAtual, useAparencias } from '../../../store/aparencia';
import { useAuth } from '../../../store/auth';
import { useLoja } from '../../../store/loja';
import { cartao, cores, espaco, fontes, raio, rotuloSecao, tipografia } from '../../../theme';

// Loja: troca moedas (1 por ponto de foco) por aparências do Foque. Acessórios virão depois.
export default function TelaLoja() {
  const userId = useAuth((s) => s.session?.user.id);
  const saldo = useLoja((s) => s.moedas);
  const itens = useLoja((s) => s.itens);
  const comprados = useLoja((s) => s.comprados);
  const carregada = useLoja((s) => s.carregada);
  const carregar = useLoja((s) => s.carregar);
  const comprar = useLoja((s) => s.comprar);
  const emUso = useAparenciaAtual();
  const escolher = useAparencias((s) => s.escolher);

  const [fala, setFala] = useState(() => falas.loja());
  const [comprando, setComprando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Atualiza saldo e preços sempre que a aba abre.
  useFocusEffect(
    useCallback(() => {
      if (userId) carregar(userId);
    }, [userId, carregar]),
  );

  const aparencias = itens.filter(
    (item): item is ItemLoja & { id: AparenciaId } => item.tipo === 'aparencia' && ehAparencia(item.id),
  );

  async function confirmarCompra(item: ItemLoja & { id: AparenciaId }) {
    const nome = dadosDaAparencia(item.id).nome;
    setComprando(item.id);
    setErro(null);
    try {
      await comprar(item.id);
      // Já sai usando o que acabou de comprar.
      if (userId) escolher(userId, item.id);
      setFala(falas.comprou(nome));
    } catch (e) {
      setErro(e instanceof ErroLoja ? e.message : 'Algo deu errado. Tente de novo.');
    } finally {
      setComprando(null);
    }
  }

  function pedirCompra(item: ItemLoja & { id: AparenciaId }) {
    const nome = dadosDaAparencia(item.id).nome;
    Alert.alert(`Comprar ${nome}?`, `Custa ${textoMoedas(item.preco)}. Você tem ${textoMoedas(saldo)}.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Comprar', onPress: () => confirmarCompra(item) },
    ]);
  }

  return (
    <View style={styles.tela}>
      <CabecalhoApp />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View>
          <Text style={styles.titulo}>Loja</Text>
          <Text style={styles.subtitulo}>Troque suas moedas por visuais do Foque.</Text>
        </View>

        {/* Saldo */}
        <View
          style={[cartao, styles.saldo]}
          accessible
          accessibilityLabel={`Você tem ${textoMoedas(saldo)}. Cada ponto de foco vale 1 moeda.`}
        >
          <View style={styles.moedaGrande}>
            <MaterialIcons name="paid" size={34} color={cores.amber} />
          </View>
          <View style={styles.textosSaldo}>
            <Text style={styles.valorSaldo}>{saldo}</Text>
            <Text style={styles.rotuloSaldo}>{saldo === 1 ? 'moeda' : 'moedas'}</Text>
          </View>
          <Text style={styles.regraSaldo}>1 ponto de foco{'\n'}= 1 moeda</Text>
        </View>

        <BalaoFala texto={fala} />

        {/* Aparências */}
        <View style={styles.secao}>
          <Text style={rotuloSecao}>Aparências</Text>
          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          {aparencias.length === 0 ? (
            <Text style={styles.vazio}>
              {carregada ? 'Nada à venda por enquanto. 🧊' : 'Abrindo a loja... Se demorar, confira sua conexão. 🧊'}
            </Text>
          ) : null}

          {aparencias.map((item) => {
            const dados = dadosDaAparencia(item.id);
            const comprado = comprados.includes(item.id);
            const usando = emUso === item.id;
            const falta = item.preco - saldo;
            return (
              <View key={item.id} style={[cartao, styles.item, usando && styles.itemEmUso]}>
                <Image source={IMAGENS_FOQUE[item.id].parada} style={styles.previa} contentFit="contain" autoplay={false} />
                <View style={styles.textosItem}>
                  <Text style={styles.nomeItem} numberOfLines={1}>
                    {dados.nome}
                  </Text>
                  <Text style={styles.descricaoItem} numberOfLines={2}>
                    {dados.descricao}
                  </Text>

                  {comprado ? (
                    usando ? (
                      <View style={styles.selo}>
                        <MaterialIcons name="check-circle" size={18} color={cores.secondary} />
                        <Text style={styles.textoSelo}>Em uso</Text>
                      </View>
                    ) : (
                      <Botao
                        titulo="Usar"
                        icone="checkroom"
                        variante="secundario"
                        onPress={() => userId && escolher(userId, item.id)}
                      />
                    )
                  ) : (
                    <>
                      <Botao
                        titulo={comprando === item.id ? 'Comprando...' : `${item.preco}`}
                        icone="paid"
                        onPress={() => pedirCompra(item)}
                        desativado={falta > 0 || comprando !== null}
                      />
                      {falta > 0 ? <Text style={styles.falta}>Faltam {textoMoedas(falta)}</Text> : null}
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={[cartao, styles.emBreve]}>
          <MaterialIcons name="auto-awesome" size={28} color={cores.primaryContainer} />
          <View style={styles.textosEmBreve}>
            <Text style={styles.tituloEmBreve}>Em breve</Text>
            <Text style={styles.textoEmBreve}>Acessórios para o Foque: chapéus, óculos e mais.</Text>
          </View>
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
    gap: espaco.md,
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
  saldo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm + 4,
  },
  moedaGrande: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,74,0.12)',
  },
  textosSaldo: {
    flex: 1,
  },
  valorSaldo: {
    fontFamily: fontes.outfitExtraBold,
    fontSize: 32,
    lineHeight: 36,
    color: cores.onSurface,
  },
  rotuloSaldo: {
    ...tipografia.labelLg,
    color: cores.onSurfaceVariant,
  },
  regraSaldo: {
    ...tipografia.labelSm,
    color: cores.secondary,
    textAlign: 'right',
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
    paddingVertical: espaco.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm + 4,
    padding: espaco.sm + 4,
  },
  itemEmUso: {
    borderColor: cores.primaryContainer,
    borderWidth: 2,
  },
  previa: {
    width: 96,
    height: 96,
  },
  textosItem: {
    flex: 1,
    gap: espaco.xs,
  },
  nomeItem: {
    ...tipografia.headlineSm,
    color: cores.onSurface,
  },
  descricaoItem: {
    ...tipografia.bodySm,
    color: cores.onSurfaceVariant,
    marginBottom: espaco.xs,
  },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    alignSelf: 'flex-start',
    backgroundColor: cores.surfaceContainerLow,
    borderRadius: raio.full,
    paddingHorizontal: espaco.sm + 4,
    paddingVertical: espaco.xs + 2,
  },
  textoSelo: {
    ...tipografia.labelLg,
    color: cores.secondary,
  },
  falta: {
    ...tipografia.labelSm,
    color: cores.onSurfaceVariant,
    textAlign: 'center',
  },
  emBreve: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm + 4,
  },
  textosEmBreve: {
    flex: 1,
    gap: 2,
  },
  tituloEmBreve: {
    ...tipografia.headlineSm,
    color: cores.primary,
  },
  textoEmBreve: {
    ...tipografia.bodyMd,
    color: cores.onSurfaceVariant,
  },
});
