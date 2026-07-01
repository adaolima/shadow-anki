import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { initDb } from '../src/lib/db';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  useEffect(() => {
    void initDb();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Shadow Anki' }} />
      <Stack.Screen name="add" options={{ title: 'Add Video' }} />
      <Stack.Screen name="practice/[id]" options={{ title: 'Practice' }} />
    </Stack>
  );
}
