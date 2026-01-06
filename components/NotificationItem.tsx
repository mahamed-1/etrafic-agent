import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
    Bell,
    AlertTriangle,
    CheckCircle,
    Info,
    X,
    Clock,
    Shield,
    FileText,
    Megaphone,
    MoreVertical,
    Eye,
    EyeOff
} from 'lucide-react-native';
import { Notification } from '@/types/notification';
import { NotificationService } from '@/services/notificationService';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING } from '@/styles/spacing';

interface NotificationItemProps {
    notification: Notification;
    onPress?: (notification: Notification) => void;
    onMarkAsRead?: (id: number) => void;
    showMarkAsRead?: boolean;
    compact?: boolean; // Mode compact pour listes denses
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onPress,
    onMarkAsRead,
    showMarkAsRead = true,
    compact = false
}) => {
    // Déterminer l'icône et la couleur selon le type de notification
    const getNotificationStyle = () => {
        // Pour le moment, seul SYSTEM existe, mais préparé pour l'extensibilité
        const baseStyle = {
            icon: Bell,
            backgroundColor: COLORS.primary,
            lightBackground: `${COLORS.primary}15`, // 15% d'opacité
            borderColor: COLORS.primary,
        };

        // Ajout de variation selon l'urgence (basé sur le contenu)
        const isUrgent = notification.title.toLowerCase().includes('urgent') ||
            notification.message.toLowerCase().includes('urgent');
        const isWarning = notification.title.toLowerCase().includes('attention') ||
            notification.message.toLowerCase().includes('attention');

        if (isUrgent) {
            return {
                ...baseStyle,
                icon: AlertTriangle,
                backgroundColor: COLORS.danger,
                lightBackground: `${COLORS.danger}15`,
                borderColor: COLORS.danger,
            };
        }

        if (isWarning) {
            return {
                ...baseStyle,
                icon: AlertTriangle,
                backgroundColor: COLORS.warning,
                lightBackground: `${COLORS.warning}15`,
                borderColor: COLORS.warning,
            };
        }

        return baseStyle;
    };

    const notificationStyle = getNotificationStyle();
    const IconComponent = notificationStyle.icon;

    const handlePress = () => {
        if (onPress) {
            onPress(notification);
        }

        // Marquer automatiquement comme lu lors du clic
        if (!notification.isRead && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
    };

    const handleMarkAsRead = (e: any) => {
        e.stopPropagation();
        if (onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
    };

    const formatRelativeTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'À l\'instant';
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
        if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;

        // Pour les dates plus anciennes, formater manuellement
        const diffInDays = Math.floor(diffInMinutes / 1440);
        if (diffInDays === 1) return 'Hier';
        if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

        // Format date complète
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <TouchableOpacity
            style={[
                compact ? styles.compactContainer : styles.container,
                !notification.isRead && styles.unread,
                {
                    borderLeftColor: notification.isRead ? COLORS.gray200 : notificationStyle.borderColor,
                    backgroundColor: notification.isRead ? COLORS.surface : notificationStyle.lightBackground
                }
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Header avec icône et informations */}
            <View style={compact ? styles.compactHeader : styles.header}>
                {/* Icône avec background coloré */}
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: notificationStyle.backgroundColor }
                ]}>
                    <IconComponent
                        size={compact ? 16 : 20}
                        color={COLORS.surface}
                        strokeWidth={2}
                    />
                </View>

                {/* Contenu principal */}
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text
                            style={[
                                compact ? styles.compactTitle : styles.title,
                                !notification.isRead && styles.unreadText
                            ]}
                            numberOfLines={compact ? 1 : 2}
                        >
                            {notification.title}
                        </Text>

                        {/* Badge non lu */}
                        {!notification.isRead && (
                            <View style={[styles.unreadBadge, { backgroundColor: notificationStyle.backgroundColor }]}>
                                <Text style={styles.unreadBadgeText}>•</Text>
                            </View>
                        )}
                    </View>

                    {/* Message */}
                    {!compact && (
                        <Text
                            style={[
                                styles.message,
                                !notification.isRead && styles.unreadMessageText
                            ]}
                            numberOfLines={2}
                        >
                            {notification.message}
                        </Text>
                    )}

                    {/* Footer avec time et actions */}
                    <View style={styles.footer}>
                        <View style={styles.timeContainer}>
                            <Clock size={12} color={COLORS.textSecondary} />
                            <Text style={styles.timestamp}>
                                {formatRelativeTime(notification.createdAt)}
                            </Text>
                        </View>

                        {/* Statut de lecture */}
                        <View style={styles.statusContainer}>
                            {notification.isRead ? (
                                <View style={styles.readStatus}>
                                    <Eye size={12} color={COLORS.textSecondary} />
                                    <Text style={styles.statusText}>Lu</Text>
                                </View>
                            ) : (
                                <View style={styles.unreadStatus}>
                                    <EyeOff size={12} color={notificationStyle.backgroundColor} />
                                    <Text style={[styles.statusText, { color: notificationStyle.backgroundColor }]}>
                                        Non lu
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Bouton d'action */}
                {showMarkAsRead && !notification.isRead && (
                    <TouchableOpacity
                        style={[styles.actionButton, { borderColor: notificationStyle.backgroundColor }]}
                        onPress={handleMarkAsRead}
                    >
                        <CheckCircle size={16} color={notificationStyle.backgroundColor} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Conteneurs principaux
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.md,
        marginVertical: SPACING.xs,
        marginHorizontal: SPACING.sm,
        borderLeftWidth: 4,
        shadowColor: COLORS.gray800,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    compactContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: SPACING.sm,
        marginVertical: SPACING.xs / 2,
        marginHorizontal: SPACING.sm,
        borderLeftWidth: 3,
        shadowColor: COLORS.gray800,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    unread: {
        shadowOpacity: 0.15,
        elevation: 4,
    },

    // Headers
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.sm,
    },
    compactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },

    // Icône
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },

    // Contenu
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    title: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        flex: 1,
        marginRight: SPACING.sm,
        lineHeight: 22,
    },
    compactTitle: {
        ...TYPOGRAPHY.bodyLarge,
        color: COLORS.textPrimary,
        flex: 1,
        marginRight: SPACING.sm,
        fontWeight: '600',
    },
    unreadText: {
        fontWeight: '700',
        color: COLORS.gray900,
    },

    // Badge non lu
    unreadBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
    },
    unreadBadgeText: {
        fontSize: 8,
        color: COLORS.surface,
        fontWeight: 'bold',
    },

    // Message
    message: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: SPACING.sm,
    },
    unreadMessageText: {
        color: COLORS.textPrimary,
        fontWeight: '500',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.xs,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    timestamp: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontSize: 11,
    },

    // Statut
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.xs,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: COLORS.gray100,
    },
    unreadStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.xs,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: `${COLORS.primary}10`,
    },
    statusText: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },

    // Bouton d'action
    actionButton: {
        padding: SPACING.sm,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: COLORS.surface,
        shadowColor: COLORS.gray800,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
});

export default NotificationItem;
