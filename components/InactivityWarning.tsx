/**
 * Composant d'avertissement d'inactivité
 * Affiche un modal avec un compte à rebours avant déconnexion automatique
 */

import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    Animated,
    Easing,
} from 'react-native';
import { Button } from './Button';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING } from '@/styles/spacing';

interface InactivityWarningProps {
    visible: boolean;
    timeRemaining: number; // en millisecondes
    onStayConnected: () => void;
    onLogout: () => void;
}

export const InactivityWarning: React.FC<InactivityWarningProps> = ({
    visible,
    timeRemaining,
    onStayConnected,
    onLogout,
}) => {
    const [countdown, setCountdown] = useState<number>(0);
    const [pulseAnim] = useState(new Animated.Value(1));

    // Animation de pulsation pour attirer l'attention
    useEffect(() => {
        if (visible) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();

            return () => pulse.stop();
        }
    }, [visible, pulseAnim]);

    // Mise à jour du compte à rebours
    useEffect(() => {
        if (visible && timeRemaining > 0) {
            const timer = setInterval(() => {
                const remaining = Math.ceil(timeRemaining / 1000);
                setCountdown(remaining);

                if (remaining <= 0) {
                    clearInterval(timer);
                    onLogout();
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [visible, timeRemaining, onLogout]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getUrgencyLevel = (): 'normal' | 'warning' | 'critical' => {
        if (countdown <= 30) return 'critical';
        if (countdown <= 60) return 'warning';
        return 'normal';
    };

    const urgencyLevel = getUrgencyLevel();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onStayConnected}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ scale: pulseAnim }] }
                    ]}
                >
                    {/* Icône d'avertissement */}
                    <View style={[styles.iconContainer, styles[`iconContainer_${urgencyLevel}`]]}>
                        <Text style={[styles.icon, styles[`icon_${urgencyLevel}`]]}>
                            ⚠️
                        </Text>
                    </View>

                    {/* Titre */}
                    <Text style={[styles.title, styles[`title_${urgencyLevel}`]]}>
                        Session bientôt expirée
                    </Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        Votre session va expirer dans{'\n'}
                        <Text style={[styles.countdown, styles[`countdown_${urgencyLevel}`]]}>
                            {formatTime(countdown)}
                        </Text>
                    </Text>

                    <Text style={styles.subtitle}>
                        Vous serez déconnecté automatiquement par sécurité.
                    </Text>

                    {/* Barre de progression */}
                    <View style={styles.progressContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                styles[`progressBar_${urgencyLevel}`],
                                {
                                    width: `${Math.max(0, (countdown / 120) * 100)}%` // 2 minutes max
                                }
                            ]}
                        />
                    </View>

                    {/* Boutons d'action */}
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Rester connecté"
                            onPress={onStayConnected}
                            style={[styles.button, styles.stayButton]}
                            titleStyle={styles.stayButtonText}
                        />

                        <Button
                            title="Se déconnecter"
                            onPress={onLogout}
                            style={[styles.button, styles.logoutButton]}
                            titleStyle={styles.logoutButtonText}
                        />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.xl,
        width: Math.min(width - spacing.xl * 2, 400),
        alignItems: 'center',
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    iconContainer_normal: {
        backgroundColor: colors.warning + '20',
    },
    iconContainer_warning: {
        backgroundColor: colors.warning + '30',
    },
    iconContainer_critical: {
        backgroundColor: colors.error + '30',
    },
    icon: {
        fontSize: 40,
    },
    icon_normal: {
        color: colors.warning,
    },
    icon_warning: {
        color: colors.warning,
    },
    icon_critical: {
        color: colors.error,
    },
    title: {
        ...typography.h2,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    title_normal: {
        color: colors.warning,
    },
    title_warning: {
        color: colors.warning,
    },
    title_critical: {
        color: colors.error,
    },
    message: {
        ...typography.body,
        textAlign: 'center',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    countdown: {
        ...typography.h1,
        fontWeight: 'bold',
    },
    countdown_normal: {
        color: colors.warning,
    },
    countdown_warning: {
        color: colors.warning,
    },
    countdown_critical: {
        color: colors.error,
    },
    subtitle: {
        ...typography.caption,
        textAlign: 'center',
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    progressContainer: {
        width: '100%',
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        marginBottom: spacing.xl,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    progressBar_normal: {
        backgroundColor: colors.warning,
    },
    progressBar_warning: {
        backgroundColor: colors.warning,
    },
    progressBar_critical: {
        backgroundColor: colors.error,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    button: {
        flex: 1,
        minHeight: 48,
    },
    stayButton: {
        backgroundColor: colors.primary,
    },
    stayButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    logoutButtonText: {
        color: colors.textSecondary,
    },
});
