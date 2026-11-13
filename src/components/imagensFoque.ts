import type { ImageSource } from 'expo-image';

import type { AparenciaId, EstadoFoque } from '../domain/aparencias';

// GIFs animados (400×400, fundo transparente) em assets/foque/<aparência>/<estado>.gif.
// O require precisa ser estático para o Metro empacotar cada arquivo.
export const IMAGENS_FOQUE: Record<AparenciaId, Record<EstadoFoque, ImageSource>> = {
  padrao: {
    parada: require('../../assets/foque/padrao/parada.gif'),
    acenando: require('../../assets/foque/padrao/acenando.gif'),
    focando: require('../../assets/foque/padrao/focando.gif'),
    comemorando: require('../../assets/foque/padrao/comemorando.gif'),
    triste: require('../../assets/foque/padrao/triste.gif'),
  },
  bebe: {
    parada: require('../../assets/foque/bebe/parada.gif'),
    acenando: require('../../assets/foque/bebe/acenando.gif'),
    focando: require('../../assets/foque/bebe/focando.gif'),
    comemorando: require('../../assets/foque/bebe/comemorando.gif'),
    triste: require('../../assets/foque/bebe/triste.gif'),
  },
  careca: {
    parada: require('../../assets/foque/careca/parada.gif'),
    acenando: require('../../assets/foque/careca/acenando.gif'),
    focando: require('../../assets/foque/careca/focando.gif'),
    comemorando: require('../../assets/foque/careca/comemorando.gif'),
    triste: require('../../assets/foque/careca/triste.gif'),
  },
  ninja: {
    parada: require('../../assets/foque/ninja/parada.gif'),
    acenando: require('../../assets/foque/ninja/acenando.gif'),
    focando: require('../../assets/foque/ninja/focando.gif'),
    comemorando: require('../../assets/foque/ninja/comemorando.gif'),
    triste: require('../../assets/foque/ninja/triste.gif'),
  },
  princesa: {
    parada: require('../../assets/foque/princesa/parada.gif'),
    acenando: require('../../assets/foque/princesa/acenando.gif'),
    focando: require('../../assets/foque/princesa/focando.gif'),
    comemorando: require('../../assets/foque/princesa/comemorando.gif'),
    triste: require('../../assets/foque/princesa/triste.gif'),
  },
};
