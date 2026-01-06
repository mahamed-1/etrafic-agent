import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import {
    Bell,
    BellOff,
    Filter,
    CheckCircle2,
    Trash2,
    RotateCcw,
    Search,
    Settings,
    Archive,
    ChevronDown
} from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';

import { Header } from '@/components/Header';
import { NotificationItem } from '@/components/NotificationItem';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ErrorCard } from '@/components/ErrorCard';
import { useNotificationsStrategy, NotificationFilter } from '@/hooks/useNotificationsStrategy';
import { Notification } from '@/types/notification';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING } from '@/styles/spacing';

export default function NotificationsScreen() {
    const params = useLocalSearchParams();
    const initialFilter = (params.filter as NotificationFilter) || 'unread'; // Défaut sur 'unread'
    const [filter, setFilter] = useState<NotificationFilter>(initialFilter);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        refresh();
        if (params?.filter === 'unread') {
            setFilter('unread');
        }
    }, [params?.filter]);

    const {
        notifications,
        unreadCount,
        loading,
        error,
        hasNext,
        totalElements,
        refresh,
        loadMore,
        markAsRead,
        markAllAsRead,
        clearError
    } = useNotificationsStrategy({
        filter,
        autoRefresh: true,
        refreshInterval: 30000
    });

    const handleLoadMore = async () => {
        if (hasNext && !loadingMore) {
            setLoadingMore(true);
            await loadMore();
            setLoadingMore(false);
        }
    };

    const handleNotificationPress = (notification: Notification) => {
        // Ici vous pouvez ajouter la navigation vers les détails
        Alert.alert(
            notification.title,
            notification.message,
            [{ text: 'OK' }]
        );
    };

    const handleMarkAllAsRead = () => {
        if (unreadCount === 0) return;

        Alert.alert(
            'Marquer tout comme lu',
            `Êtes-vous sûr de vouloir marquer toutes les ${unreadCount} notifications non lues comme lues ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer',
                    onPress: markAllAsRead
                }
            ]
        );
    };

    const renderEmptyState = () => (
        <Card style={styles.emptyCard}>
            <BellOff size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {filter === 'unread'
                    ? 'Toutes vos notifications ont été lues'
                    : 'Les nouvelles notifications apparaîtront ici'
                }
            </Text>
        </Card>
    );

    const renderNotification = ({ item }: { item: Notification }) => (
        <NotificationItem
            notification={item}
            onPress={handleNotificationPress}
            onMarkAsRead={markAsRead}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    };

    // Avec la nouvelle stratégie, pas besoin de filtrer côté client
    // Le hook retourne déjà les bonnes notifications selon le filtre
    const filteredNotifications = notifications;

    return (
        <View style={styles.container}>
            <Header
                title="Notifications"
            />

            <View style={styles.content}>
                {/* Ligne avec filtres à gauche et actions à droite */}
                <View style={styles.topActionsContainer}>
                    {/* Boutons de filtres à gauche */}
                    <View style={styles.filtersContainer}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filter === 'all' && styles.activeFilterButton
                            ]}
                            onPress={() => setFilter('all')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                filter === 'all' && styles.activeFilterButtonText
                            ]}>
                                Toutes
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filter === 'unread' && styles.activeFilterButton
                            ]}
                            onPress={() => setFilter('unread')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                filter === 'unread' && styles.activeFilterButtonText
                            ]}>
                                Non lues {unreadCount > 0 && `(${unreadCount})`}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Boutons d'action à droite */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={refresh}
                            disabled={loading}
                        >
                            <RotateCcw size={16} color={COLORS.primary} />
                        </TouchableOpacity>

                        {unreadCount > 0 && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleMarkAllAsRead}
                            >
                                <CheckCircle2 size={16} color={COLORS.success} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Gestion des erreurs */}
                {error && (
                    <ErrorCard
                        visible={!!error}
                        title="Erreur"
                        message={error}
                        onDismiss={clearError}
                    />
                )}

                {/* Liste des notifications */}
                <FlatList
                    data={filteredNotifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                            colors={[COLORS.primary]}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={!loading ? renderEmptyState : null}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    topActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    filtersContainer: {
        flexDirection: 'row',
        gap: 8,
        flex: 1,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    activeFilterButton: {
        backgroundColor: 'rgb(22, 39, 75)',
        borderColor: 'rgb(22, 39, 75)',
        shadowColor: 'rgb(22, 39, 75)',
        shadowOpacity: 0.3,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#495057',
        textAlign: 'center',
    },
    activeFilterButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    list: {
        flex: 1,
    },
    loadingFooter: {
        padding: SPACING.lg,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    loadingText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    emptyCard: {
        alignItems: 'center',
        padding: SPACING.xl,
        marginTop: SPACING.xl,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    emptySubtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
