import { requireOptionalNativeModule } from 'expo-modules-core';

export interface EstadoTela {
  /** false quando a plataforma ainda não detecta bloqueio (iOS, por enquanto). */
  suportado: boolean;
  /** A tela está ligada e interativa. */
  telaAcesa: boolean;
  /** A tela de bloqueio está ativa. */
  bloqueada: boolean;
  /** Horário (ms) em que a tela apagou pela última vez; 0 se nunca. */
  telaDesligadaEm: number;
  /** Horário (ms) do último desbloqueio do celular; 0 se nunca. */
  desbloqueadoEm: number;
}

interface FocoTelaNativo {
  estado(): EstadoTela;
}

// Opcional: sem o build nativo atualizado (ex.: Expo Go), o app segue sem o módulo.
const nativo = requireOptionalNativeModule<FocoTelaNativo>('FocoTela');

const SEM_SUPORTE: EstadoTela = {
  suportado: false,
  telaAcesa: true,
  bloqueada: false,
  telaDesligadaEm: 0,
  desbloqueadoEm: 0,
};

export function estadoTela(): EstadoTela {
  try {
    return nativo?.estado() ?? SEM_SUPORTE;
  } catch {
    return SEM_SUPORTE;
  }
}
