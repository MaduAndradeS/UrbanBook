import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
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
        name="pesquisa_cliente"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={32} name="magnifyingglass" color={color} />
        ),
      }}
     />
     <Tabs.Screen
        name="agendamentos"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={32} name="calendar" color={color} />
        ),
      }}
     />
     <Tabs.Screen
        name="perfil-usuario"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={32} name="person.circle" color={color} />
        ),
      }}
     />
     <Tabs.Screen
        name="perfil-empresa"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={32} name="circle" color={color} />
        ),
      }}
     />
    </Tabs>
  );
}

