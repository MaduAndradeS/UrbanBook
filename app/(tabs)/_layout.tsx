import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
        name="index"
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
    </Tabs>
  );
}
