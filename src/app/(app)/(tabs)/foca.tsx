import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BalaoFala } from '../../../components/BalaoFala';
import { Botao } from '../../../components/Botao';
import { CabecalhoApp } from '../../../components/CabecalhoApp';
import { IMAGENS_FOQUE } from '../../../components/imagensFoque';
import { Mascote } from '../../../components/Mascote';
import { APARENCIAS, type AparenciaId, dadosDaAparencia } from '../../../domain/aparencias';
import { falas } from '../../../domain/mensagens';
import { useAparenciaAtual, useAparencias } from '../../../store/aparencia';
import { useAuth } from '../../../store/auth';
import { cartao, cores, espaco, raio, rotuloSecao, tipografia } from '../../../theme';

// Espaço do mascote: dicas do roteiro e escolha da aparência do Foque.
export default function TelaFoca() {
  const userId = useAuth((s) => s.session?.user.id);
  const atual = useAparenciaAtual();
  const escolher = useAparencias((s) => s.escolher);
  const [fala, setFala] = useState(() => falas.dica());

  function trocar(id: AparenciaId) {
    if (!userId || id === atual) return;
    escolher(userId, id);
    setFala(falas.novaAparencia(dadosDaAparencia(id).nome));
  }

  return (
    <View style={styles.tela}>
      <CabecalhoApp />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View>
          <Text style={styles.titulo}>Foque, a foca</Text>
          <Text style={styles.subtitulo}>Exigente, sarcástica e torcendo por você.</Text>
        </View>

        <View style={styles.mascote}>
          <BalaoFala texto={fala} />
          <Mascote tamanho={190} />
        </View>

        <Botao titulo="Outra dica" icone="lightbulb" variante="secundario" onPress={() => setFala(falas.dica())} />

        {/* Aparência */}
        <View style={styles.secao}>
          <Text style={rotuloSecao}>Aparência do Foque</Text>
          <View style={styles.grade}>
            {APARENCIAS.map((a) => (
              <OpcaoAparencia
                key={a.id}
                id={a.id}
                nome={a.nome}
                descricao={a.descricao}
                ativa={a.id === atual}
                onPress={() => trocar(a.id)}
              />
            ))}
          </View>
        </View>

        <View style={[cartao, styles.emBreve]}>
          <MaterialIcons name="checkroom" size={28} color={cores.primaryContainer} />
          <View style={styles.textosEmBreve}>
            <Text style={styles.tituloEmBreve}>Em breve</Text>
            <Text style={styles.textoEmBreve}>
              Acessórios, cores e novas aparências para deixar o Foque do seu jeito.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface OpcaoAparenciaProps {
  id: AparenciaId;
  nome: string;
  descricao: string;
  ativa: boolean;
  onPress: () => void;
}

function OpcaoAparencia({ id, nome, descricao, ativa, onPress }: OpcaoAparenciaProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: ativa }}
      accessibilityLabel={`${nome}. ${descricao}`}
      style={({ pressed }) => [
        styles.opcao,
        ativa && styles.opcaoAtiva,
        pressed && { transform: [{ translateY: 2 }] },
      ]}
    >
      {/* Só a escolhida anima, para poupar bateria. */}
      <Image source={IMAGENS_FOQUE[id].parada} style={styles.previa} contentFit="contain" autoplay={ativa} />
      <Text style={[styles.nomeOpcao, ativa && { color: cores.primary }]} numberOfLines={1}>
        {nome}
      </Text>
      {ativa ? (
        <View style={styles.selo}>
          <MaterialIcons name="check" size={14} color={cores.onPrimaryContainer} />
        </View>
      ) : null}
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
  secao: {
    gap: espaco.sm,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaco.sm,
  },
  opcao: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.xs,
    borderRadius: raio.md,
    borderWidth: 2,
    borderColor: cores.iceBorder,
    backgroundColor: cores.surfaceContainerLowest,
  },
  opcaoAtiva: {
    borderColor: cores.primaryContainer,
    backgroundColor: cores.surfaceContainerLow,
  },
  previa: {
    width: 76,
    height: 76,
  },
  nomeOpcao: {
    ...tipografia.labelLg,
    color: cores.onSurface,
  },
  selo: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primaryContainer,
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
