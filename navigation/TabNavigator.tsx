import { Tabs } from 'expo-router';
import { Chrome as Home, ScanLine, Car, FileText } from 'lucide-react-native';
import { COLORS } from '@/styles/colors';

export default function TabNavigator() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray200,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ size, color }) => (
            <ScanLine size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="control"
        options={{
          title: 'Contrôle',
          tabBarIcon: ({ size, color }) => (
            <Car size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="violations"
        options={{
          title: 'Infractions',
          tabBarIcon: ({ size, color }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />

        <Tabs.Screen
        name="infraction"
        options={{
          title: 'List des Infraction',
          tabBarIcon: ({ size, color }) => (
            <Car size={size} color={color} />
          ),
        }}
      /> 
    </Tabs>
  );
}