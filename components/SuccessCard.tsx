import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { X, CheckCircle } from 'lucide-react-native';
import { COLORS } from '@/styles/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/styles/spacing';
import { TYPOGRAPHY } from '@/styles/typography';

interface SuccessCardProps {
    visible: boolean;
    title: string;
    message?: string;
    onDismiss: () => void;
    duration?: number;
}

const { width } = Dimensions.get('window');

export const SuccessCard: React.FC<SuccessCardProps> = ({
    visible,
    title,
    message,
    onDismiss,
    duration = 3000,
}) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Animation d'entrée
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-dismiss après la durée spécifiée
            const timer = setTimeout(() => {
                dismissCard();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            dismissCard();
        }
    }, [visible]);

    const dismissCard = () => {
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
            onDismiss();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <CheckCircle size={24} color={COLORS.surface} />
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {message && <Text style={styles.message}>{message}</Text>}
                </View>

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={dismissCard}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <X size={20} color={COLORS.surface} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: SPACING.md,
        right: SPACING.md,
        zIndex: 9999,
    },
    card: {
        backgroundColor: COLORS.success,
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        minHeight: 70,
        ...SHADOWS.lg,
        elevation: 8,
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
