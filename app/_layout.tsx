import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import logo from '../assets/images/logo.png';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

  // DEFINIÇÃO: Esconde o cabeçalho APENAS no Login e Cadastro
  const esconderCabecalhoGlobal = 
    pathname === '/' || 
    pathname === '/index' || 
    pathname === '/cad_cliente' || 
    pathname === '/cad_emp';

  // DEFINIÇÃO: Esconde a seta de voltar nas 4 abas principais da barra inferior
  const esconderSeta =
    pathname.includes('homepage') ||
    pathname.includes('pesquisa_cliente') ||
    pathname.includes('agendamentos') ||
    pathname.includes('atendimentos') ||
    pathname.includes('perfil-usuario') ||
    pathname.includes('perfil-empresa');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: !esconderCabecalhoGlobal,
          header: () => {
            if (esconderCabecalhoGlobal) return null;

            return (
              <View style={{ backgroundColor: '#fff', paddingTop: 45, paddingBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>

                  {!esconderSeta && router.canGoBack() ? (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                      <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 28, marginRight: 10 }} />
                  )}

                  <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#757575', flex: 1 }}>
                    Urban Book
                  </Text>

                  <Image source={logo} style={{ width: 65, height: 60 }} />
                </View>
              </View>
            );
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}