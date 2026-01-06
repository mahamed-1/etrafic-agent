/**
 * Hook pour récupérer le nombre de notifications non lues
 * Utilise l'API GET /api/v1/notifications/unread/count
 */

import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

interface UseUnreadCountOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    onError?: (error: Error) => void;
}

interface UseUnreadCountReturn {
    count: number;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    clearError: () => void;
}

export function useUnreadNotificationCount(options: UseUnreadCountOptions = {}): UseUnreadCountReturn {
    const {
        autoRefresh = true,
        refreshInterval = 30000, // 30 secondes par défaut
        onError
    } = options;

    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated } = useAuth();

    /**
     * Récupère le nombre de notifications non lues
     */
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) {
            setCount(0);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const unreadCount = await NotificationService.getUnreadCount();
            setCount(unreadCount);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du nombre de notifications';
            setError(errorMessage);
            setCount(0);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, onError]);

    /**
     * Rafraîchit le nombre de notifications non lues
     */
    const refresh = useCallback(async () => {
        await fetchUnreadCount();
    }, [fetchUnreadCount]);

    /**
     * Efface l'erreur
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Effet pour le chargement initial
     */
    useEffect(() => {
        if (isAuthenticated) {
            // Délai de 2 secondes pour laisser le temps à l'authentification de se stabiliser
            const delay = setTimeout(() => {
                fetchUnreadCount();
            }, 2000);

            return () => clearTimeout(delay);
        }
    }, [isAuthenticated, fetchUnreadCount]);

    /**
     * Effet pour le rafraîchissement automatique
     */
    useEffect(() => {
        if (!autoRefresh || !isAuthenticated) {
            return;
        }

        // Délai initial plus long pour le premier rafraîchissement automatique
        const initialDelay = setTimeout(() => {
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, refreshInterval);

            return () => clearInterval(interval);
        }, 10000); // Attendre 10 secondes avant de commencer le rafraîchissement automatique

        return () => clearTimeout(initialDelay);
    }, [autoRefresh, refreshInterval, isAuthenticated, fetchUnreadCount]);

    return {
        count,
        loading,
        error,
        refresh,
        clearError,
    };
}
