import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';

interface NotificationTabIconProps {
    size: number;
    color: string;
}

export const NotificationTabIcon: React.FC<NotificationTabIconProps> = ({ size, color }) => {
    const { unreadCount } = useNotificationContext();

    return (
        <View style={styles.container}>
            <Bell size={size} color={color} />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: COLORS.danger,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    badgeText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.surface,
        fontSize: 9,
        fontWeight: '700',
    },
});
