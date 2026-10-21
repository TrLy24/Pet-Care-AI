import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { darkTheme, lightTheme } from '../presentation/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <PaperProvider theme={scheme === 'dark' ? darkTheme : lightTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}