import { Stack } from 'expo-router';

import { cores, fontes } from '../../theme';

// Pilha do app logado: as abas embaixo e as telas que abrem por cima delas.
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: cores.surface },
        headerStyle: { backgroundColor: cores.surface },
        headerTintColor: cores.primary,
        headerTitleStyle: { fontFamily: fontes.outfitBold, color: cores.primary },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="sessao" options={{ gestureEnabled: false }} />
      <Stack.Screen name="resultado" options={{ gestureEnabled: false }} />
      <Stack.Screen name="usuario/[username]" options={{ headerShown: true, title: 'Perfil' }} />
    </Stack>
  );
}
