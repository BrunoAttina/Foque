import {
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { sincronizar } from '../services/sincronizacao';
import { useAuth } from '../store/auth';
import { cores } from '../theme';

// Mantém a splash até as fontes e a sessão salva no aparelho estarem prontas.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const carregando = useAuth((s) => s.carregando);
  const session = useAuth((s) => s.session);
  const perfil = useAuth((s) => s.perfil);

  const [fontesProntas, erroFontes] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => useAuth.getState().iniciar(), []);

  // Ao voltar para o app, tenta enviar sessões que ficaram na fila offline.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (estado) => {
      const userId = useAuth.getState().session?.user.id;
      if (estado === 'active' && userId) sincronizar(userId);
    });
    return () => subscription.remove();
  }, []);

  // Se as fontes falharem, segue com as do sistema em vez de travar na splash.
  const pronto = !carregando && (fontesProntas || erroFontes !== null);
  useEffect(() => {
    if (pronto) SplashScreen.hide();
  }, [pronto]);

  // Só desenha depois das fontes: texto renderizado antes fica com a fonte do sistema.
  // A splash continua visível até aqui.
  if (!fontesProntas && !erroFontes) return null;

  const logado = session !== null;
  // Logado, perfil já carregado e sem @: precisa escolher antes de usar o app.
  const precisaNome = logado && perfil !== undefined && !perfil?.username;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.surface } }}>
        <Stack.Protected guard={logado && !precisaNome}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        <Stack.Protected guard={precisaNome}>
          <Stack.Screen name="escolher-nome" />
        </Stack.Protected>

        <Stack.Protected guard={!logado}>
          <Stack.Screen name="entrar" />
          <Stack.Screen name="cadastro" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
