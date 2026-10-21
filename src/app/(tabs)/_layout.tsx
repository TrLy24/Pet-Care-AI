import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTheme } from 'react-native-paper';

type IconProps = ComponentProps<typeof MaterialCommunityIcons>;

const icon =
  (name: IconProps['name']) =>
  ({ color, size }: { color: IconProps['color']; size: number }) => (
    <MaterialCommunityIcons name={name} color={color} size={size} />
  );

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: { backgroundColor: theme.colors.surface },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >

      <Tabs.Screen name="index" options={{ title: 'Thú cưng', tabBarIcon: icon('paw') }} />
      <Tabs.Screen name="scan" options={{ title: 'Nhận diện', tabBarIcon: icon('camera') }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Dinh dưỡng', tabBarIcon: icon('food-apple') }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat AI', tabBarIcon: icon('chat') }} />
    </Tabs>
  );
}