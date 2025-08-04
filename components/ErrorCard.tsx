import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { COLORS } from '@/styles/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/styles/spacing';
import { TYPOGRAPHY } from '@/styles/typography';

interface ErrorCardProps {
    visible: boolean;
    title: string;
    message: string;
    onDismiss: () => void;
    duration?: number;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
    visible,
    title,
    message,
    onDismiss,
    duration = 5000,
}) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Debug: Afficher les props reçues
    console.log('[DEBUG] 🃏 ErrorCard props:', {
        visible,
        title: title || 'EMPTY_TITLE',
        message: message || 'EMPTY_MESSAGE',
        hasOnDismiss: !!onDismiss,
        timestamp: new Date().toISOString()
    });

    const dismissCard = () => {
        console.log('[DEBUG] 🃏 ErrorCard dismissCard called');

        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            console.log('[DEBUG] 🃏 ErrorCard dismiss animation completed, calling onDismiss');
            onDismiss();
        });
    };

    useEffect(() => {
        console.log('[DEBUG] 🃏 ErrorCard useEffect triggered:', {
            visible,
            title: title || 'EMPTY_TITLE',
            message: message || 'EMPTY_MESSAGE'
        });

        if (visible) {
            console.log('[DEBUG] 🃏 ErrorCard showing...');

            // Pas d'animation pour debug - affichage direct
            slideAnim.setValue(0);
            opacityAnim.setValue(1);

            // Auto-dismiss après la durée spécifiée
            const timer = setTimeout(() => {
                console.log('[DEBUG] 🃏 ErrorCard auto-dismiss triggered');
                dismissCard();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            console.log('[DEBUG] 🃏 ErrorCard hiding...');
            slideAnim.setValue(-100);
            opacityAnim.setValue(0);
        }
    }, [visible, title, message]);

    console.log('[DEBUG] 🃏 ErrorCard render:', {
        visible,
        willReturn: !visible,
        title: title || 'NO_TITLE',
        message: message || 'NO_MESSAGE'
    });

    if (!visible) {
        console.log('[DEBUG] 🃏 ErrorCard returning null because visible=false');
        return null;
    }

    console.log('[DEBUG] 🃏 ErrorCard WILL RENDER - visible=true');

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: 'rgba(255, 0, 0, 0.3)', // Rouge visible pour debug
                }
            ]}
        >
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <AlertCircle size={24} color={COLORS.surface} />
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{title || 'NO TITLE'}</Text>
                    <Text style={styles.message}>{message || 'NO MESSAGE'}</Text>
                </View>

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={dismissCard}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <X size={20} color={COLORS.surface} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Augmenté pour éviter la status bar
        left: SPACING.md,
        right: SPACING.md,
        zIndex: 999999, // Z-index très élevé
        elevation: 999, // Pour Android
    },
    card: {
        backgroundColor: COLORS.danger,
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        minHeight: 70,
        ...SHADOWS.lg,
        elevation: 20, // Ombre élevée pour Android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    iconContainer: {
        marginRight: SPACING.sm,
    },
    contentContainer: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    title: {
        color: COLORS.surface,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        ...TYPOGRAPHY.semiBold,
    },
    message: {
        color: COLORS.surface,
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.9,
        ...TYPOGRAPHY.regular,
    },
    closeButton: {
        padding: 4,
    },
});
