import { HapticTab } from '@/components/haptic-tab';
<<<<<<< HEAD
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
=======
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
  );
}
>>>>>>> 60d26327694799443115d70120573b63d8c31575

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
<<<<<<< HEAD
          tabBarActiveTintColor: '#ffffff', 
          tabBarInactiveTintColor: '#000000', 
          headerShown: false,
          tabBarButton: HapticTab,
          
      tabBarIconStyle: {
        marginTop: 20,
        alignSelf: 'center'
      },

      tabBarStyle: {
        backgroundColor: '#67C5C0',
        height: 80,
      

        borderTopWidth: 0, 
        elevation: 0,        
        shadowColor: 'transparent' 
      },
    

    }}>
     <Tabs.Screen
        name="homepage"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="house.fill" color={color} />,
        }}
      />
     <Tabs.Screen
        name="pagduda"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={32} name="magnifyingglass" color={color} />
        ),
      }}
     />
=======
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#67C5C0',
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="agendamentos"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="atendimentos"
        options={{
          title: 'Atend.',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="perfil-empresa"
        options={{
          title: 'Empresa',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏢" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="perfil-usuario"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />

>>>>>>> 60d26327694799443115d70120573b63d8c31575
    </Tabs>
  );
}

