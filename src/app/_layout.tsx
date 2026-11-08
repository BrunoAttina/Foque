import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { sincronizar } from '../services/sincronizacao';
import { useAuth } from '../store/auth';

// Mantém a splash até a sessão salva no aparelho ser lida.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const carregando = useAuth((s) => s.carregando);
  const session = useAuth((s) => s.session);
  const perfil = useAuth((s) => s.perfil);

  useEffect(() => useAuth.getState().iniciar(), []);

  // Ao voltar para o app, tenta enviar sessões que ficaram na fila offline.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (estado) => {
      const userId = useAuth.getState().session?.user.id;
      if (estado === 'active' && userId) sincronizar(userId);
    });
    return () => subscription.remove();
  }, []);

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
