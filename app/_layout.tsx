import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import logo from '../assets/images/logo.png';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const telaAtual = segments[segments.length - 1];

  const esconderVoltar =
    telaAtual === 'homepage' ||
    telaAtual === 'atendimentos' ||
    telaAtual === 'agendamentos' ||
    telaAtual === 'perfil-usuario' ||
    telaAtual === 'pesquisa_cliente';

  const mostrarCabecalho = 
    telaAtual !== 'atendimentos' && 
    telaAtual !== 'agendamentos';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      
      <Stack
        screenOptions={{
          headerShown: mostrarCabecalho, // Destrói a parede invisível que bloqueava o sininho
          header: ({ navigation, back }) => (
            <View style={{ backgroundColor: '#fff', paddingTop: 45, paddingBottom: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  marginTop: 0,
                }}
              >

                {!esconderVoltar ? (
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginRight: 10 }}
                  >
                    <Ionicons name="chevron-back" size={28} color="#000" />
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 28, marginRight: 10 }} />
                )}

                {/* TEXTO (mais à esquerda) */}
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: 'bold',
                    color: '#757575',
                    flex: 1, // ocupa espaço disponível
                  }}
                >
                  Urban Book
                </Text>

                {/* LOGO (direita fixa) */}
                <Image source={logo} style={{ width: 65, height: 60 }} />

              </View>
            </View>
          ),
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: mostrarCabecalho }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}