import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/screens/LoginScreen';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { COLORS } from '@/styles/colors';
import { SPACING } from '@/styles/spacing';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner
          title="Initialisation..."
          subtitle="Vérification de la session"
        />
      </View>
    );
  }

  if (!isAuthenticated) {
    // Renvoyer LoginScreen dans un conteneur complet pour éviter les problèmes de navigation
    return (
      <View style={styles.fullScreenContainer}>
        <LoginScreen />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  fullScreenContainer: {
    flex: 1,
  },
});

// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import { useAuth } from '@/contexts/AuthContext';
// import LoginScreen from '@/screens/LoginScreen';
// import { LoadingSpinner } from '@/components/LoadingSpinner';
// import { UnauthorizedScreen } from '@/screens/UnauthorizedScreen';
// import { COLORS } from '@/styles/colors';
// import { SPACING } from '@/styles/spacing';

// interface AuthGuardProps {
//   children: React.ReactNode;
// }

// export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
//   const { isAuthenticated, isLoading, user } = useAuth();

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <LoadingSpinner
//           title="Vérification de session"
//           subtitle="Authentification en cours..."
//         />
//       </View>
//     );
//   }

//   if (!isAuthenticated) {
//     return <LoginScreen />;
//   }

//   if (user?.role !== 'agent') {
//     return <UnauthorizedScreen />;
//   }

//   return <>{children}</>;
// };

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     justifyContent: 'center',
//     padding: SPACING.lg,
//   },
// });