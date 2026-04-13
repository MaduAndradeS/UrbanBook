import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
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

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      
      <Stack
        screenOptions={{
          header: ({ navigation, route, options, back }) => (
            <View style={{ backgroundColor: '#fff', paddingTop: 40, paddingBottom: 10 }}>

              {/* TOPO - título */}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#757575' , paddingLeft: 20 }}>
                  Urban Book
                </Text>
                <Image source={logo} style={{ width: 60, height: 60, marginLeft: 120 }} />
              </View>

              {/* BOTÃO DE VOLTAR (embaixo) */}
              {back && (
                <TouchableOpacity
                  onPress={navigation.goBack}
                  style={{ marginTop: -10, marginLeft: 20 }}
                >
                  <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
              )}

            </View>
          ),
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}