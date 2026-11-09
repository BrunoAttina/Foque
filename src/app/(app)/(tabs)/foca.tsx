import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BalaoFala } from '../../../components/BalaoFala';
import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { Mascote } from '../../../components/Mascote';
import { falas } from '../../../domain/mensagens';
import { cartao, cores, espaco, tipografia } from '../../../theme';

// Espaço do mascote: dicas do roteiro agora; personalização da foca no futuro.
export default function TelaFoca() {
  const [dica, setDica] = useState(() => falas.dica());

  return (
    <View style={styles.tela}>
      <CabecalhoApp />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View>
          <Text style={styles.titulo}>Foque, a foca</Text>
          <Text style={styles.subtitulo}>Exigente, sarcástica e torcendo por você.</Text>
        </View>

        <View style={styles.mascote}>
          <BalaoFala texto={dica} />
          <Mascote tamanho={190} />
        </View>

        <Botao titulo="Outra dica" icone="lightbulb" variante="secundario" onPress={() => setDica(falas.dica())} />

        <View style={[cartao, styles.emBreve]}>
          <MaterialIcons name="pets" size={28} color={cores.primaryContainer} />
          <View style={styles.textosEmBreve}>
            <Text style={styles.tituloEmBreve}>Em breve</Text>
            <Text style={styles.textoEmBreve}>Personalize o Foque e conheça ele melhor.</Text>
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
  mascote: {
    alignItems: 'center',
    gap: espaco.xs,
    marginTop: espaco.sm,
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
