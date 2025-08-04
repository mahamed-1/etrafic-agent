import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Shield, LogOut, Bell } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING } from '@/styles/spacing';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isOnline?: boolean;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  isOnline = true,
  notificationCount = 0
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      notificationCount > 0
        ? `Vous avez ${notificationCount} nouvelle${notificationCount > 1 ? 's' : ''} notification${notificationCount > 1 ? 's' : ''}.`
        : 'Aucune notification pour le moment.',
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.agentInfo}>
            <Shield size={24} color={COLORS.surface} />
            <View style={styles.agentDetails}>
              <Text style={styles.appTitle}>PSR Mobile</Text>
              <Text style={styles.agentName}>{user?.name}</Text>
            </View>
          </View>
          <View style={styles.statusInfo}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={handleNotifications}
                activeOpacity={0.6}
              >
                <Bell size={18} color={COLORS.surface} strokeWidth={2} />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeNumber}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <LogOut size={20} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentDetails: {
    marginLeft: SPACING.md,
  },
  appTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.surface,
  },
  agentName: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryLight,
  },
  statusInfo: {
    alignItems: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    padding: SPACING.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badgeNumber: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.surface,
  },
  logoutButton: {
    padding: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.surface,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryLight,
    textAlign: 'center',
  },
});




// import React from 'react';
// import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert } from 'react-native';
// import { Shield, LogOut, Bell } from 'lucide-react-native';
// import { useAuth } from '@/contexts/AuthContext';
// import { COLORS } from '@/styles/colors';
// import { TYPOGRAPHY } from '@/styles/typography';
// import { SPACING } from '@/styles/spacing';

// interface HeaderProps {
//   title: string;
//   subtitle?: string;
//   isOnline?: boolean;
//   notificationCount?: number;
// }

// export const Header: React.FC<HeaderProps> = ({
//   title,
//   subtitle,
//   isOnline = true,
//   notificationCount = 0
// }) => {
//   const { user, logout } = useAuth();

//   const handleLogout = () => {
//     Alert.alert(
//       'Déconnexion',
//       'Êtes-vous sûr de vouloir vous déconnecter ?',
//       [
//         { text: 'Annuler', style: 'cancel' },
//         {
//           text: 'Déconnecter',
//           style: 'destructive',
//           onPress: logout
//         }
//       ]
//     );
//   };

//   const handleNotifications = () => {
//     Alert.alert(
//       'Notifications',
//       notificationCount > 0
//         ? `Vous avez ${notificationCount} nouvelle${notificationCount > 1 ? 's' : ''} notification${notificationCount > 1 ? 's' : ''}.`
//         : 'Aucune notification pour le moment.',
//       [{ text: 'OK' }]
//     );
//   };

//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <View style={styles.agentInfo}>
//             <Shield size={24} color={COLORS.surface} />
//             <View style={styles.agentDetails}>
//               <Text style={styles.appTitle}>PSR Mobile</Text>
//               <Text style={styles.agentName}>{user?.name}</Text>
//             </View>
//           </View>
//           <View style={styles.statusInfo}>
//             <View style={styles.actionButtons}>
//               <TouchableOpacity
//                 style={styles.notificationButton}
//                 onPress={handleNotifications}
//                 activeOpacity={0.6}
//               >
//                 <Bell size={18} color={COLORS.surface} strokeWidth={2} />
//                 {notificationCount > 0 && (
//                   <View style={styles.notificationBadge}>
//                     <Text style={styles.badgeNumber}>
//                       {notificationCount > 9 ? '9+' : notificationCount}
//                     </Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//               <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
//                 <LogOut size={20} color={COLORS.surface} />
//               </TouchableOpacity>
//             </View>
//             <Text style={styles.badgeNumberText}>{user?.identifier}</Text>
//             <Text style={[
//               styles.onlineStatus,
//               { color: isOnline ? COLORS.online : COLORS.offline }
//             ]}>
//               {isOnline ? 'En ligne' : 'Hors ligne'}
//             </Text>
//           </View>
//         </View>
//         <Text style={styles.title}>{title}</Text>
//         {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
//       </View>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: COLORS.primary,
//     paddingTop: 50,
//     paddingBottom: SPACING.xl,
//     paddingHorizontal: SPACING.lg,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: SPACING.md,
//   },
//   agentInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   agentDetails: {
//     marginLeft: SPACING.md,
//   },
//   appTitle: {
//     ...TYPOGRAPHY.h3,
//     color: COLORS.surface,
//   },
//   agentName: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.primaryLight,
//   },
//   statusInfo: {
//     alignItems: 'flex-end',
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: SPACING.xs,
//   },
//   notificationButton: {
//     padding: SPACING.xs,
//     position: 'relative',
//   },
//   notificationBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     backgroundColor: COLORS.danger,
//     borderRadius: 8,
//     minWidth: 16,
//     height: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.primary,
//   },
//   badgeNumber: {
//     fontSize: 9,
//     fontWeight: '700',
//     color: COLORS.surface,
//   },
//   logoutButton: {
//     padding: SPACING.xs,
//   },
//   badgeNumberText: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.surface,
//     fontWeight: '600',
//   },
//   onlineStatus: {
//     ...TYPOGRAPHY.caption,
//     fontWeight: '500',
//   },
//   title: {
//     ...TYPOGRAPHY.h2,
//     color: COLORS.surface,
//     textAlign: 'center',
//     marginBottom: SPACING.sm,
//   },
//   subtitle: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.primaryLight,
//     textAlign: 'center',
//   },
// });

