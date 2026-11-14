import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ehAparencia } from '../domain/aparencias';
import { cores, fontes } from '../theme';
import { IMAGENS_FOQUE } from './imagensFoque';

interface AvatarProps {
  username: string;
  tamanho?: number;
  /** Aparência do Foque que a pessoa usa. Sem ela (ou se for desconhecida), mostra a inicial do @. */
  aparencia?: string | null;
}

/** Foto de perfil: a foca que a pessoa está usando, parada, dentro de um círculo. */
export function Avatar({ username, tamanho = 32, aparencia }: AvatarProps) {
  const circulo = [styles.circulo, { width: tamanho, height: tamanho, borderRadius: tamanho / 2 }];

  if (ehAparencia(aparencia)) {
    return (
      <View style={circulo}>
        <Image
          key={aparencia}
          source={IMAGENS_FOQUE[aparencia].parada}
          style={{ width: tamanho * 0.92, height: tamanho * 0.92 }}
          contentFit="contain"
          autoplay={false}
          transition={null}
        />
      </View>
    );
  }

  return (
    <View style={circulo}>
      <Text style={[styles.inicial, { fontSize: tamanho * 0.45 }]}>{username[0]?.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circulo: {
    backgroundColor: cores.primaryFixed,
    borderWidth: 2,
    borderColor: cores.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inicial: {
    fontFamily: fontes.outfitExtraBold,
    color: cores.primary,
  },
});
