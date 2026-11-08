import { Stack } from 'expo-router';

// Telas do app para quem está logado e já tem @.
// As telas sociais têm cabeçalho com botão de voltar.
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="buscar" options={{ headerShown: true, title: 'Buscar pessoas' }} />
      <Stack.Screen name="seguindo" options={{ headerShown: true, title: 'Seguindo' }} />
      <Stack.Screen name="perfil/[username]" options={{ headerShown: true, title: 'Perfil' }} />
    </Stack>
  );
}
