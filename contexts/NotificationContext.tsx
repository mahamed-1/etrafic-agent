import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotificationService } from '@/services/notificationService';

interface NotificationContextType {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnreadCount = async () => {
        try {
            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
        }
    };

    // Rafraîchissement initial et périodique
    useEffect(() => {
        refreshUnreadCount();

        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(refreshUnreadCount, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            refreshUnreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
