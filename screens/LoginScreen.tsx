import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Shield, Lock, User, AlertCircle, X, Eye, EyeOff } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/Card';
import { ErrorCard } from '@/components/ErrorCard';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/styles/spacing';
import axios, { AxiosError } from 'axios';
const { height } = Dimensions.get('window');

export default function LoginScreen() {
  // ...existing code...
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [error, setError] = useState<{ message: string, type: 'warning' | 'error' | 'info' | 'success' } | null>(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const { login, isLoading, clearError, error: authError } = useAuth();

  interface ApiError {
    message: string;
    status?: number;
    data?: any;
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.bezier(0.2, 0, 0.1, 1),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    console.log('[LOGIN_DEBUG] Error state changed:', error);
  }, [error]);

  useEffect(() => {
    console.log('[SESSION_DEBUG] SessionExpiredMessage state changed:', sessionExpiredMessage);
  }, [sessionExpiredMessage]);

  useEffect(() => {
    console.log('[LOGIN_DEBUG] AuthContext error detected:', authError);
    if (authError) {
      if (authError.includes('Nouvelle connexion détectée') ||
        authError.includes('Session expirée') ||
        authError.includes('Connexion interrompue') ||
        authError.includes('session') ||
        authError.includes('Session')) {
        setSessionExpiredMessage(authError);
        console.log('[SESSION_DEBUG] Session expired message set:', authError);
      } else if (!error) {
        let errorType: 'warning' | 'error' | 'info' | 'success' = 'error';
        if (authError.includes('incorrect') || authError.includes('Identifiants')) {
          errorType = 'warning';
        }
        setError({ message: authError, type: errorType });
      }
    }
  }, [authError]);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      const errorMsg = 'Identifiant vide';
      console.error('[VALIDATION]', errorMsg);
      setError({ message: errorMsg, type: 'warning' });
      return;
    }
    if (!password) {
      const errorMsg = 'Mot de passe vide';
      console.error('[VALIDATION]', errorMsg);
      setError({ message: errorMsg, type: 'warning' });
      return;
    }
    console.log('[AUTH] Tentative de connexion initiée', {
      identifier: identifier,
      passwordLength: password.length
    });
    try {
      setError(null);
      await login({
        identifier: identifier,
        password: password
      });
      console.log('[AUTH] Connexion réussie', {
        identifier: identifier,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const apiError = extractApiError(error);
      console.error('[AUTH] Erreur de connexion', {
        error: apiError.message,
        status: apiError.status,
        data: apiError.data,
        identifier: identifier
      });
      const userMessage = apiError.status === 401
        ? 'Identifiant ou mot de passe incorrect'
        : apiError.message || 'Erreur de connexion';
      const errorType = apiError.status === 401 || apiError.status === 404
        ? 'warning'
        : 'error';
      console.log('[LOGIN_DEBUG] Setting error state:', { message: userMessage, type: errorType });
      setError({ message: userMessage, type: errorType });
      setPassword('');
      console.log('[SECURITY] Mot de passe effacé après erreur');
    }
  };

  const extractApiError = (error: unknown): ApiError => {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    } else if (error instanceof Error) {
      const errorDetails = (error as any).details;
      if (errorDetails) {
        return {
          message: errorDetails.userMessage || error.message,
          status: errorDetails.code === 'AUTH_INVALID_CREDENTIALS' ? 401 : undefined,
          data: errorDetails
        };
      }
      return { message: error.message };
    }
    return { message: 'Une erreur inconnue est survenue' };
  };

  const dismissError = () => {
    setError(null);
    setSessionExpiredMessage(null);
    clearError();
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    return 3;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0f172a', '#1e3a8a', '#3b82f6']}
          style={StyleSheet.absoluteFillObject}
        />
        <LoadingSpinner
          title="Connexion en cours..."
          subtitle="Authentification sécurisée"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="always"
        enableOnAndroid={true}
        extraScrollHeight={40}
      >
        <View style={styles.container}>
          <StatusBar style="light" />

          {/* ErrorCard moderne pour les messages de session */}
          <ErrorCard
            visible={!!sessionExpiredMessage}
            title="Session expirée"
            message={sessionExpiredMessage || ''}
            onDismiss={() => setSessionExpiredMessage(null)}
            duration={8000} // 8 secondes pour bien lire le message
          />

          <LinearGradient
            colors={['#020617', '#0f172a', '#1e293b']}
            style={StyleSheet.absoluteFillObject}
          />
          <Animated.View style={[styles.decorativeCircle1, {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.15]
            })
          }]} />
          <Animated.View style={[styles.decorativeCircle2, {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.05]
            })
          }]} />
          <Animated.View style={[styles.decorativeCircle3, {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.08]
            })
          }]} />
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.logoSection,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              <View style={styles.logoContainer}>
                <Animated.View style={[styles.logoBackground, {
                  transform: [{
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }]
                }]}>
                  <Shield size={60} color={COLORS.surface} />
                </Animated.View>
                <View style={styles.logoGlow} />
              </View>
              <Text style={styles.appTitle}>PSR Mobile</Text>
              <Text style={styles.appSubtitle}>Système d'Authentification Sécurisé</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.welcomeText}>Bienvenue</Text>
                  <Text style={styles.loginSubtitle}>
                    Connectez-vous à votre espace sécurisé
                  </Text>
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={identifier}
                      onChangeText={(text) => setIdentifier(text)}
                      placeholder="Identifiant (ex: agent123)"
                      autoCapitalize="none"
                      keyboardType="default"
                      style={{
                        paddingLeft: 44,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: '#f1f5f9',
                        fontSize: 16,
                        color: COLORS.textPrimary,
                        borderWidth: 1,
                        borderColor: COLORS.gray200,
                        marginBottom: 8,
                      }}
                    />
                    <View style={[{ left: 12, top: 14, zIndex: 2, position: 'absolute' }]}>
                      <User size={20} color={COLORS.primary} />
                    </View>
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Mot de passe"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={{
                        paddingLeft: 44,
                        paddingRight: 44,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: '#f1f5f9',
                        fontSize: 16,
                        color: COLORS.textPrimary,
                        borderWidth: 1,
                        borderColor: COLORS.gray200,
                        marginBottom: 8,
                      }}
                    />
                    <View style={[{ left: 12, top: 14, zIndex: 2, position: 'absolute' }]}>
                      <Lock size={18} color={COLORS.primary} />
                    </View>
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 12, top: 12, zIndex: 2 }}
                      onPress={() => setShowPassword((prev) => !prev)}
                      accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? (
                        <EyeOff size={22} color={COLORS.primary} />
                      ) : (
                        <Eye size={22} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.passwordStrength}>
                    {[1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor: getPasswordStrength() >= i
                              ? i === 1 ? COLORS.danger
                                : i === 2 ? COLORS.warning
                                  : COLORS.success
                              : COLORS.gray300
                          }
                        ]}
                      />
                    ))}
                  </View>
                </View>
                <Button
                  title="Se connecter"
                  onPress={handleLogin}
                  disabled={isLoading || !identifier || !password}
                  style={styles.loginButton}
                  textStyle={styles.loginButtonText}
                />
                {error && (
                  <Card style={{
                    ...styles.errorCard,
                    ...(error.type === 'warning' ? styles.warningCard :
                      error.type === 'error' ? styles.errorCardRed :
                        error.type === 'info' ? styles.infoCard :
                          error.type === 'success' ? styles.successCard : {})
                  }}>
                    <View style={styles.errorHeader}>
                      <View style={[
                        styles.errorIcon,
                        error.type === 'warning' ? styles.warningIcon :
                          error.type === 'error' ? styles.errorIconRed :
                            error.type === 'info' ? styles.infoIcon :
                              error.type === 'success' ? styles.successIcon : {}
                      ]}>
                        <AlertCircle size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.errorContent}>
                        <Text style={styles.errorTitle}>
                          {error.type === 'warning' ? 'Erreur' :
                            error.type === 'error' ? 'Erreur' :
                              error.type === 'info' ? 'Information' :
                                error.type === 'success' ? 'Succès' : 'Notification'}
                        </Text>
                        <Text style={styles.errorMessage}>{error.message}</Text>
                      </View>
                      <TouchableOpacity onPress={dismissError} style={styles.dismissButton}>
                        <X size={18} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                )}
              </View>
            </Animated.View>
            <Animated.View
              style={[
                styles.footer,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.securityBadge}>
                <Shield size={16} color={COLORS.primaryLight} />
                <Text style={styles.securityText}>Connexion Sécurisée SSL</Text>
              </View>
              <Text style={styles.footerText}>
                © 2025 République de Djibouti - PSR
              </Text>
            </Animated.View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },

  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(30, 64, 175, 0.15)',
    transform: [{ scale: 1.2 }]
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(147, 197, 253, 0.05)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.3,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(147, 197, 253, 0.3)',
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    zIndex: -1,
  },
  appTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.surface,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    ...TYPOGRAPHY.body,
    color: 'rgba(147, 197, 253, 0.8)',
    textAlign: 'center',
    fontSize: 16,
  },

  // Form Container
  formContainer: {
    marginBottom: SPACING.xxl,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  welcomeText: {
    ...TYPOGRAPHY.h2,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  loginSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },

  // Input Styling
  inputContainer: {
    marginBottom: SPACING.xl,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  inputIconContainer: {
    position: 'absolute',
    left: SPACING.lg,
    top: 5,
    zIndex: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 6,
    borderRadius: 20,
  },

  // Password Strength
  passwordStrength: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: -SPACING.md,
    marginBottom: SPACING.lg,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },

  // Button
  loginButton: {
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },

  // Error
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.danger,
    textAlign: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.3)',
  },
  securityText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(147, 197, 253, 0.9)',
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(148, 163, 184, 0.7)',
    textAlign: 'center',
  },

  // Error Card Styles
  errorCard: {
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
  },
  warningCard: {
    borderLeftColor: COLORS.danger,
    backgroundColor: '#FFF8E1',
  },
  errorCardRed: {
    borderLeftColor: COLORS.danger,
    backgroundColor: '#FFEBEE',
  },
  infoCard: {
    borderLeftColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  successCard: {
    borderLeftColor: COLORS.success,
    backgroundColor: '#E8F5E8',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningIcon: {
    backgroundColor: COLORS.danger,
  },
  errorIconRed: {
    backgroundColor: COLORS.danger,
  },
  infoIcon: {
    backgroundColor: COLORS.primary,
  },
  successIcon: {
    backgroundColor: COLORS.success,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  errorMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  dismissButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
});
