import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react-native';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    type: ToastType;
    title: string;
    message?: string;
    onClose?: () => void;
}

const getToastConfig = (type: ToastType) => {
    switch (type) {
        case 'success':
            return {
                backgroundColor: COLORS.success,
                borderColor: COLORS.success,
                icon: CheckCircle,
                iconColor: COLORS.surface,
            };
        case 'error':
            return {
                backgroundColor: COLORS.danger,
                borderColor: COLORS.danger,
                icon: AlertCircle,
                iconColor: COLORS.surface,
            };
        case 'warning':
            return {
                backgroundColor: COLORS.warning,
                borderColor: COLORS.warning,
                icon: AlertTriangle,
                iconColor: COLORS.surface,
            };
        case 'info':
            return {
                backgroundColor: COLORS.info,
                borderColor: COLORS.info,
                icon: Info,
                iconColor: COLORS.surface,
            };
        default:
            return {
                backgroundColor: COLORS.gray500,
                borderColor: COLORS.gray500,
                icon: Info,
                iconColor: COLORS.surface,
            };
    }
};

export const Toast: React.FC<ToastProps> = ({ type, title, message, onClose }) => {
    const config = getToastConfig(type);
    const IconComponent = config.icon;

    return (
        <View style={[styles.container, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <IconComponent size={24} color={config.iconColor} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {message && <Text style={styles.message}>{message}</Text>}
                </View>

                {onClose && (
                    <View style={styles.closeContainer}>
                        <X size={20} color={config.iconColor} onPress={onClose} />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        marginHorizontal: SPACING.lg,
        marginVertical: SPACING.sm,
        shadowColor: COLORS.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    iconContainer: {
        marginRight: SPACING.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        ...TYPOGRAPHY.h4,
        color: COLORS.surface,
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    message: {
        ...TYPOGRAPHY.body,
        color: COLORS.surface,
        opacity: 0.9,
    },
    closeContainer: {
        marginLeft: SPACING.md,
        padding: SPACING.xs,
    },
});
