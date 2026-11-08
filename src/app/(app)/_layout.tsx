import { Stack } from 'expo-router';

// Telas do app para quem está logado e já tem @.
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
