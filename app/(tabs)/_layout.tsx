import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';

export default function TabLayout() {
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function carregarTipo() {
      const tipo = await AsyncStorage.getItem('tipo_usuario');
      setTipoUsuario(tipo);
    }
    carregarTipo();
  }, [pathname]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#000000',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarIconStyle: { marginTop: 20, alignSelf: 'center' },
        tabBarStyle: { backgroundColor: '#67C5C0', height: 80, borderTopWidth: 0, elevation: 0, shadowColor: 'transparent' },
      }}
    >
      <Tabs.Screen
        name="homepage"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pesquisa_cliente"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="agendamentos"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={28} color={color} />,
        }}
      />

      {/* REGRA DINÂMICA: Redireciona para o ficheiro certo baseado no tipo logado */}
      <Tabs.Screen
        name="perfil-usuario"
        options={{
          title: '',
          href: tipoUsuario === 'CLIENTE' ? '/perfil-usuario' : null,
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil-empresa"
        options={{
          title: '',
          href: tipoUsuario === 'EMPRESARIO' ? '/perfil-empresa' : null,
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />

      <Tabs.Screen name="atendimentos" options={{ href: null }} />

      <Tabs.Screen name="perfil-empresa-cliente" options={{ href: null }} />
    </Tabs>
  );
}