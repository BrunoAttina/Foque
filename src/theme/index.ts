// Design system "Glacial Focus Game". Fonte: Documentacao/design.md.
import type { TextStyle, ViewStyle } from 'react-native';

export const cores = {
  // Tokens do design.md
  surface: '#faf8ff',
  surfaceDim: '#d2d9f4',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f3ff',
  surfaceContainer: '#eaedff',
  surfaceContainerHigh: '#e2e7ff',
  surfaceContainerHighest: '#dae2fd',
  onSurface: '#131b2e',
  onSurfaceVariant: '#3e484f',
  outline: '#6e7980',
  outlineVariant: '#bdc8d1',
  primary: '#00668a',
  onPrimary: '#ffffff',
  primaryContainer: '#38bdf8',
  onPrimaryContainer: '#004965',
  primaryFixed: '#c4e7ff',
  primaryFixedDim: '#7bd0ff',
  secondary: '#006c49',
  secondaryContainer: '#6cf8bb',
  onSecondaryContainer: '#00714d',
  tertiary: '#ae3115',
  tertiaryContainer: '#ff947c',
  tertiaryFixed: '#ffdad2',
  onTertiaryFixed: '#3d0600',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Cores da marca citadas no texto do design.md
  arcticDeep: '#0284c7', // base em relevo dos botões primários
  arcticDeeper: '#0369a1',
  mint: '#10b981', // sessões concluídas, progresso
  amber: '#ff6b4a', // urgência, chama, CTA de destaque
  amberDeep: '#dd4b2a',
  iceBorder: '#e0f2fe', // borda das placas de gelo
  iceTrack: '#e2e8f0', // trilho das barras de progresso
  slate: '#0f172a',
} as const;

/** Famílias carregadas em src/app/_layout.tsx. No Android, o peso vem da família, não do fontWeight. */
export const fontes = {
  outfitSemiBold: 'Outfit_600SemiBold',
  outfitBold: 'Outfit_700Bold',
  outfitExtraBold: 'Outfit_800ExtraBold',
  jakartaMedium: 'PlusJakartaSans_500Medium',
  jakartaSemiBold: 'PlusJakartaSans_600SemiBold',
  jakartaBold: 'PlusJakartaSans_700Bold',
  jakartaExtraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

// letterSpacing em "em" no design.md convertido para pixels (em × fontSize).
export const tipografia = {
  display: { fontFamily: fontes.outfitExtraBold, fontSize: 40, lineHeight: 48, letterSpacing: -0.8 },
  displayMobile: { fontFamily: fontes.outfitExtraBold, fontSize: 32, lineHeight: 40, letterSpacing: -0.64 },
  headlineLg: { fontFamily: fontes.outfitBold, fontSize: 28, lineHeight: 36, letterSpacing: -0.42 },
  headlineMd: { fontFamily: fontes.outfitBold, fontSize: 22, lineHeight: 28, letterSpacing: -0.22 },
  headlineSm: { fontFamily: fontes.outfitBold, fontSize: 18, lineHeight: 24 },
  bodyLg: { fontFamily: fontes.jakartaMedium, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: fontes.jakartaMedium, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: fontes.jakartaMedium, fontSize: 12, lineHeight: 16 },
  labelLg: { fontFamily: fontes.jakartaBold, fontSize: 14, lineHeight: 18, letterSpacing: 0.28 },
  labelMd: { fontFamily: fontes.jakartaBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.48 },
  labelSm: { fontFamily: fontes.jakartaExtraBold, fontSize: 10, lineHeight: 14, letterSpacing: 0.6 },
} satisfies Record<string, TextStyle>;

/** Grade de 8 pt. */
export const espaco = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  margemMobile: 16,
} as const;

export const raio = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

/** Sombra difusa das "placas de gelo" (cartões). */
export const sombraCartao: ViewStyle = {
  shadowColor: cores.arcticDeep,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 3,
};

/** Cartão padrão: superfície branca, borda de gelo, raio 16. */
export const cartao: ViewStyle = {
  backgroundColor: cores.surfaceContainerLowest,
  borderRadius: raio.lg,
  borderWidth: 1.5,
  borderColor: cores.iceBorder,
  padding: espaco.md,
  ...sombraCartao,
};

/** Rótulo de seção em caixa alta, como "TEMPO DE MERGULHO". */
export const rotuloSecao: TextStyle = {
  ...tipografia.labelMd,
  color: cores.onSurfaceVariant,
  textTransform: 'uppercase',
  letterSpacing: 1,
};
