import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { type ColorValue, type GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores, fontes } from '../../../theme';

type NomeIcone = ComponentProps<typeof MaterialIcons>['name'];

function icone(nome: NomeIcone) {
  return ({ color }: { color: ColorValue }) => (
    // A barra de abas sempre passa as cores de tabBarActive/InactiveTintColor (strings).
    <MaterialIcons name={nome} size={24} color={color as string} />
  );
}

/** Botão central elevado da aba Focar, com a base em relevo do design.md. */
function BotaoFocar({ onPress, ativo }: { onPress?: (e: GestureResponderEvent) => void; ativo?: boolean }) {
  return (
    <View style={styles.areaFocar}>
      <Pressable
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityLabel="Focar"
        accessibilityState={{ selected: ativo }}
        style={styles.baseFocar}
      >
        {({ pressed }) => (
          <View style={[styles.faceFocar, pressed ? { marginTop: 3, marginBottom: 1 } : { marginBottom: 4 }]}>
            <MaterialIcons name="timer" size={30} color={ativo ? cores.onPrimaryContainer : cores.primary} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

export default function AbasLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.primary,
        tabBarInactiveTintColor: cores.onSurfaceVariant,
        tabBarLabelStyle: { fontFamily: fontes.jakartaExtraBold, fontSize: 10, letterSpacing: 0.6 },
        tabBarStyle: {
          height: 68 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
          backgroundColor: cores.surfaceContainerLowest,
          borderTopWidth: 0,
          shadowColor: cores.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 12,
        },
        sceneStyle: { backgroundColor: cores.surface },
      }}
    >
      <Tabs.Screen name="ranking" options={{ title: 'Ranking', tabBarIcon: icone('emoji-events') }} />
      <Tabs.Screen name="tarefas" options={{ title: 'Tarefas', tabBarIcon: icone('checklist') }} />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Focar',
          tabBarLabel: () => null,
          tabBarButton: ({ onPress, accessibilityState }) => (
            <BotaoFocar onPress={onPress} ativo={accessibilityState?.selected} />
          ),
        }}
      />
      <Tabs.Screen name="foca" options={{ title: 'Foca', tabBarIcon: icone('pets') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icone('account-circle') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  areaFocar: {
    flex: 1,
    alignItems: 'center',
  },
  baseFocar: {
    marginTop: -22,
    width: 60,
    borderRadius: 30,
    backgroundColor: cores.arcticDeep,
  },
  faceFocar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
