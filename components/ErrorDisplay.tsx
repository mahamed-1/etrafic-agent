import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { AlertCircle, Wifi, Server, Shield, Clock, RefreshCw } from 'lucide-react-native';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';
import { ErrorDetails } from '@/services/errorService';

interface ErrorDisplayProps {
    error: ErrorDetails | null;
    onRetry?: () => void;
    onDismiss?: () => void;
    visible: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error,
    onRetry,
    onDismiss,
    visible
}) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible && error) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, error, fadeAnim]);

    if (!error || !visible) return null;

    const getErrorIcon = (category: ErrorDetails['category']) => {
        switch (category) {
            case 'network':
                return Wifi;
            case 'server':
                return Server;
            case 'auth':
                return Shield;
            default:
                return AlertCircle;
        }
    };

    const getErrorColor = (severity: ErrorDetails['severity']) => {
        switch (severity) {
            case 'critical':
                return COLORS.danger;
            case 'high':
                return COLORS.danger;
            case 'medium':
                return COLORS.warning;
            default:
                return COLORS.info;
        }
    };

    const IconComponent = getErrorIcon(error.category);
    const errorColor = getErrorColor(error.severity);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={[styles.errorCard, { borderLeftColor: errorColor }]}>
                {/* Header avec icône */}
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: errorColor }]}>
                        <IconComponent size={20} color={COLORS.surface} />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Erreur de connexion</Text>
                        <Text style={styles.code}>{error.code}</Text>
                    </View>
                    {onDismiss && (
                        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
                            <Text style={styles.dismissText}>×</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Message utilisateur */}
                <Text style={styles.message}>{error.userMessage}</Text>

                {/* Informations techniques (en mode développement) */}
                {__DEV__ && (
                    <View style={styles.techInfo}>
                        <Text style={styles.techLabel}>Détails techniques:</Text>
                        <Text style={styles.techMessage}>{error.message}</Text>
                        <Text style={styles.timestamp}>
                            <Clock size={12} color={COLORS.textSecondary} /> {' '}
                            {new Date(error.timestamp).toLocaleString('fr-FR')}
                        </Text>
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                    {onRetry && (
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: errorColor }]}
                            onPress={onRetry}
                        >
                            <RefreshCw size={16} color={COLORS.surface} />
                            <Text style={styles.retryText}>Réessayer</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.lg,
    },
    errorCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    headerText: {
        flex: 1,
    },
    title: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    code: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontFamily: 'monospace',
        marginTop: 2,
    },
    dismissButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dismissText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    message: {
        ...TYPOGRAPHY.body,
        color: COLORS.textPrimary,
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    techInfo: {
        backgroundColor: COLORS.gray50,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.md,
    },
    techLabel: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    techMessage: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontFamily: 'monospace',
        fontSize: 11,
    },
    timestamp: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textLight,
        marginTop: SPACING.xs,
        fontSize: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    retryText: {
        ...TYPOGRAPHY.body,
        color: COLORS.surface,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
});
