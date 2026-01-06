import { Tabs } from 'expo-router';
import { FileText, User, HomeIcon, Bell } from 'lucide-react-native';
import { NotificationTabIcon } from '@/components/NotificationTabIcon';
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
        tabBarActiveTintColor: COLORS.primary, // Maintenant vert emerald-600
        tabBarInactiveTintColor: COLORS.gray500,
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
            <HomeIcon size={size} color={color} />
          ),
        }}
      />

      {/* Routes cachées mais accessibles via navigation programmatique */}
      <Tabs.Screen
        name="scan"
        options={{
          href: null, // Cache l'onglet mais garde la route accessible
        }}
      />

      <Tabs.Screen
        name="control"
        options={{
          href: null, // Cache l'onglet mais garde la route accessible
        }}
      />

      <Tabs.Screen
        name="violations"
        options={{
          href: null, // Cache l'onglet mais garde la route accessible
        }}
      />

      <Tabs.Screen
        name="infraction"
        options={{
          title: 'Infractions',
          tabBarIcon: ({ size, color }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ size, color }) => (
            <NotificationTabIcon size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}