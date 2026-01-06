import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '@/services/notificationService';
import { Notification, PaginatedNotifications } from '@/types/notification';

export type NotificationFilter = 'all' | 'unread';

interface UseNotificationsStrategyOptions {
    filter: NotificationFilter;
    autoRefresh?: boolean;
    refreshInterval?: number;
    pageSize?: number;
}

interface UseNotificationsStrategyReturn {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    hasNext: boolean;
    totalElements: number;
    // Actions
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearError: () => void;
}

/**
 * Hook intelligent qui utilise l'API optimale selon le filtre
 */
export const useNotificationsStrategy = (
    options: UseNotificationsStrategyOptions
): UseNotificationsStrategyReturn => {
    const {
        filter,
        autoRefresh = true,
        refreshInterval = 30000,
        pageSize = 20
    } = options;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    // Variables pour gérer la pagination côté client (pour unread)
    const [allUnreadNotifications, setAllUnreadNotifications] = useState<Notification[]>([]);

    /**
     * Stratégie 1: Pour filter = 'all'
     * Utilise l'API paginée /notifications
     */
    const fetchAllNotifications = useCallback(async (page = 0, append = false) => {
        try {
            setLoading(true);
            setError(null);

            console.log(`📋 Récupération toutes notifications - Page: ${page}`);
            const data = await NotificationService.getNotifications(page, pageSize);

            if (append) {
                setNotifications(prev => [...prev, ...data.notifications]);
            } else {
                setNotifications(data.notifications);
                setCurrentPage(data.currentPage);
            }

            setHasNext(data.hasNext);
            setTotalElements(data.totalElements);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la récupération');
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    /**
     * Stratégie 2: Pour filter = 'unread'
     * Utilise l'API dédiée /notifications/unread (plus efficace)
     */
    const fetchUnreadNotifications = useCallback(async (page = 0, append = false) => {
        try {
            setLoading(true);
            setError(null);

            if (page === 0 || allUnreadNotifications.length === 0) {
                // Premier chargement : récupérer toutes les non lues
                console.log('📬 Récupération notifications non lues');
                const unreadData = await NotificationService.getUnreadNotifications();
                setAllUnreadNotifications(unreadData);

                // Paginer côté client
                const startIndex = 0;
                const endIndex = pageSize;
                const firstPage = unreadData.slice(startIndex, endIndex);

                setNotifications(firstPage);
                setCurrentPage(0);
                setHasNext(unreadData.length > pageSize);
                setTotalElements(unreadData.length);
            } else {
                // Pages suivantes : paginer les données déjà chargées
                const startIndex = page * pageSize;
                const endIndex = startIndex + pageSize;
                const nextPage = allUnreadNotifications.slice(startIndex, endIndex);

                if (append) {
                    setNotifications(prev => [...prev, ...nextPage]);
                } else {
                    setNotifications(nextPage);
                }

                setCurrentPage(page);
                setHasNext(endIndex < allUnreadNotifications.length);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la récupération');
        } finally {
            setLoading(false);
        }
    }, [pageSize, allUnreadNotifications]);

    /**
     * Fonction principale qui choisit la stratégie
     */
    const fetchNotifications = useCallback(async (page = 0, append = false) => {
        if (filter === 'unread') {
            await fetchUnreadNotifications(page, append);
        } else {
            await fetchAllNotifications(page, append);
        }
    }, [filter, fetchUnreadNotifications, fetchAllNotifications]);

    /**
     * Récupère le compteur de non lues (toujours utile)
     */
    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Erreur compteur non lues:', err);
        }
    }, []);

    /**
     * Actions publiques
     */
    const refresh = useCallback(async () => {
        // Reset pagination pour unread
        if (filter === 'unread') {
            setAllUnreadNotifications([]);
        }

        await Promise.all([
            fetchNotifications(0, false),
            fetchUnreadCount()
        ]);
    }, [fetchNotifications, fetchUnreadCount, filter]);

    const loadMore = useCallback(async () => {
        if (hasNext && !loading) {
            await fetchNotifications(currentPage + 1, true);
        }
    }, [hasNext, loading, currentPage, fetchNotifications]);

    const markAsRead = useCallback(async (id: number) => {
        try {
            await NotificationService.markAsRead(id.toString());

            // Mise à jour locale
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );

            // Si on était dans les non lues, retirer de la liste
            if (filter === 'unread') {
                setAllUnreadNotifications(prev =>
                    prev.filter(n => n.id !== id)
                );
                setNotifications(prev =>
                    prev.filter(n => n.id !== id)
                );
            }

            // Décrémenter le compteur
            setUnreadCount(prev => Math.max(0, prev - 1));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur marquage');
        }
    }, [filter]);

    const markAllAsRead = useCallback(async () => {
        try {
            await NotificationService.markAllAsRead();

            // Si on affiche les non lues, vider la liste
            if (filter === 'unread') {
                setNotifications([]);
                setAllUnreadNotifications([]);
                setTotalElements(0);
                setHasNext(false);
            } else {
                // Sinon, marquer toutes comme lues
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, isRead: true }))
                );
            }

            setUnreadCount(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur marquage global');
        }
    }, [filter]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Chargement initial quand le filtre change
    useEffect(() => {
        refresh();
    }, [filter]); // Se déclenche quand on change de filtre

    // Auto-refresh du compteur
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchUnreadCount]);

    return {
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
    };
};
