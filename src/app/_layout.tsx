import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useAuth } from '../store/auth';

// Mantém a splash até a sessão salva no aparelho ser lida.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const carregando = useAuth((s) => s.carregando);
  const session = useAuth((s) => s.session);
  const perfil = useAuth((s) => s.perfil);

  useEffect(() => useAuth.getState().iniciar(), []);

  useEffect(() => {
    if (!carregando) SplashScreen.hide();
  }, [carregando]);

  const logado = session !== null;
  // Logado, perfil já carregado e sem @: precisa escolher antes de usar o app.
  const precisaNome = logado && perfil !== undefined && !perfil?.username;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
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
