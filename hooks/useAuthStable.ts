import { useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';

/**
 * Hook stable pour éviter les re-rendus inutiles dus aux changements d'auth
 */
export const useAuthStable = () => {
    const auth = useAuth();
    const userRef = useRef<User | null>(null);
    const isAuthenticatedRef = useRef<boolean>(false);

    // Mise à jour seulement si les valeurs ont vraiment changé
    if (auth.user?.id !== userRef.current?.id) {
        userRef.current = auth.user;
    }

    if (auth.isAuthenticated !== isAuthenticatedRef.current) {
        isAuthenticatedRef.current = auth.isAuthenticated;
    }

    return {
        user: userRef.current,
        isAuthenticated: isAuthenticatedRef.current,
        isLoading: auth.isLoading,
        error: auth.error,
        login: auth.login,
        logout: auth.logout,
        clearError: auth.clearError
    };
};
