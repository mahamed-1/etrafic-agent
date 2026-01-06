import { apiService } from './api';
import { Notification, ApiNotificationResponse, PaginatedNotifications } from '@/types/notification';
import { LOG_CONFIG } from '@/constants/config';

export class NotificationService {
    /**
     * Récupère le nombre de notifications non lues
     */
    static async getUnreadCount(): Promise<number> {
        try {
            if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
                console.log('🔔 Récupération du nombre de notifications non lues depuis /notifications/unread/count');
            }

            const response = await apiService.get('/notifications/unread/count');
            const count = response.data;

            if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
                console.log('🔔 Nombre de notifications non lues:', count);
            }

            return typeof count === 'number' ? count : 0;
        } catch (error: any) {
            if (LOG_CONFIG.ENABLE_ERROR_LOGS) {
                console.error('❌ Erreur lors de la récupération du nombre de notifications non lues:', error);
                console.error('❌ Status:', error?.response?.status);
                console.error('❌ Data:', error?.response?.data);
            }
            return 0;
        }
    }

    /**
     * Récupère uniquement les notifications non lues
     */
    static async getUnreadNotifications(): Promise<Notification[]> {
        try {
            if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
                console.log('📬 Récupération des notifications non lues uniquement');
            }

            // Récupérer toutes les notifications et filtrer les non lues
            const response = await apiService.get('/notifications', {
                params: { page: 0, size: 100 } // Récupérer un grand nombre pour avoir toutes les non lues
            });

            const apiData: ApiNotificationResponse = response.data;

            // Filtrer seulement les non lues
            const unreadNotifications: Notification[] = (apiData.content || [])
                .filter(item => !item.isRead) // Filtrer les non lues
                .map(item => ({
                    id: item.id || Math.random(),
                    recipient: item.recipient || '',
                    title: item.title || 'Notification',
                    message: item.message || '',
                    type: 'SYSTEM' as const,
                    isRead: false, // Forcé à false puisqu'on filtre les non lues
                    metadata: item.metadata,
                    createdAt: item.createdAt || new Date().toISOString(),
                    readAt: item.readAt
                }));

            if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
                console.log('📬 Notifications non lues récupérées:', unreadNotifications.length);
            }

            return unreadNotifications;
        } catch (error: any) {
            if (LOG_CONFIG.ENABLE_ERROR_LOGS) {
                console.error('❌ Erreur lors de la récupération des notifications non lues:', error);
            }
            return [];
        }
    }

    /**
     * Récupère les notifications paginées
     */
    static async getNotifications(page = 0, size = 20): Promise<PaginatedNotifications> {
        try {
            if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
                console.log('📬 Récupération des notifications, page:', page, 'size:', size);
            }

            const response = await apiService.get('/notifications', {
                params: { page, size }
            });

            const apiData: ApiNotificationResponse = response.data;

            if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
                console.log('📬 Notifications récupérées:', {
                    totalElements: apiData.totalElements,
                    currentPage: apiData.number,
                    count: apiData.content?.length || 0
                });
            }

            // Transformation des données API vers notre format simplifié
            const notifications: Notification[] = (apiData.content || []).map(item => ({
                id: item.id || Math.random(),
                recipient: item.recipient || '',
                title: item.title || 'Notification',
                message: item.message || '',
                type: 'SYSTEM' as const,
                isRead: item.isRead || false,
                metadata: item.metadata,
                createdAt: item.createdAt || new Date().toISOString(),
                readAt: item.readAt
            }));

            const result: PaginatedNotifications = {
                notifications: notifications,
                totalElements: apiData.totalElements || 0,
                totalPages: apiData.totalPages || 0,
                currentPage: apiData.number || 0,
                pageSize: apiData.size || size,
                hasNext: !apiData.last,
                hasPrevious: !apiData.first,
                isEmpty: apiData.empty || false
            };

            return result;
        } catch (error: any) {
            if (LOG_CONFIG.ENABLE_ERROR_LOGS) {
                console.error('❌ Erreur lors de la récupération des notifications:', error);
            }

            // Retourner une structure vide en cas d'erreur
            return {
                notifications: [],
                totalElements: 0,
                totalPages: 0,
                currentPage: page,
                pageSize: size,
                hasNext: false,
                hasPrevious: false,
                isEmpty: true
            };
        }
    }

    /**
     * Marque une notification comme lue
     */
    static async markAsRead(notificationId: string): Promise<boolean> {
        try {
            if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
                console.log('✅ Marquage de la notification comme lue:', notificationId);
            }

            await apiService.put(`/notifications/${notificationId}/read`);

            if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
                console.log('✅ Notification marquée comme lue avec succès');
            }

            return true;
        } catch (error: any) {
            if (LOG_CONFIG.ENABLE_ERROR_LOGS) {
                console.error('❌ Erreur lors du marquage comme lu:', error);
            }
            return false;
        }
    }

    /**
     * Marque toutes les notifications comme lues
     */
    static async markAllAsRead(): Promise<boolean> {
        try {
            if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
                console.log('✅ Marquage de toutes les notifications comme lues');
            }

            await apiService.put('/notifications/read-all');

            if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
                console.log('✅ Toutes les notifications marquées comme lues');
            }

            return true;
        } catch (error: any) {
            if (LOG_CONFIG.ENABLE_ERROR_LOGS) {
                console.error('❌ Erreur lors du marquage global comme lu:', error);
            }
            return false;
        }
    }
}

export const notificationService = NotificationService;
