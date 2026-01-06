/**
 * Hook pour détecter l'activité utilisateur et gérer l'inactivité
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { InactivityService, InactivityCallbacks } from '@/services/inactivityService';

export interface UseInactivityOptions {
    timeoutMinutes?: number;
    warningMinutes?: number;
    onWarning?: () => void;
    onTimeout?: () => void;
    onActivity?: () => void;
    enabled?: boolean;
}

export const useInactivity = (options: UseInactivityOptions = {}) => {
    const {
        timeoutMinutes = 15,
        warningMinutes = 2,
        onWarning,
        onTimeout,
        onActivity,
        enabled = true
    } = options;

    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const lastActivityRef = useRef<number>(Date.now());

    useEffect(() => {
        if (!enabled) {
            InactivityService.stop();
            return;
        }

        const callbacks: InactivityCallbacks = {
            onWarning: () => {
                console.log('⚠️ Avertissement d\'inactivité déclenché');
                onWarning?.();
            },
            onTimeout: () => {
                console.log('⏰ Timeout d\'inactivité déclenché');
                onTimeout?.();
            },
            onActivity: () => {
                lastActivityRef.current = Date.now();
                onActivity?.();
            }
        };

        const config = {
            timeoutDuration: timeoutMinutes * 60 * 1000,
            warningDuration: warningMinutes * 60 * 1000,
            checkInterval: 30 * 1000, // Vérifier toutes les 30 secondes
        };

        // Démarrer le service d'inactivité
        InactivityService.start(callbacks, config);

        // Gérer les changements d'état de l'app
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            console.log('📱 État de l\'app changé:', {
                previous: appStateRef.current,
                current: nextAppState
            });

            if (appStateRef.current === 'background' && nextAppState === 'active') {
                // App revient au premier plan - enregistrer activité
                console.log('🔄 App revenue au premier plan - activité enregistrée');
                InactivityService.recordActivity();
            } else if (nextAppState === 'background') {
                // App passe en arrière-plan
                console.log('⏸️ App passée en arrière-plan');
            }

            appStateRef.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Nettoyer au démontage
        return () => {
            console.log('🧹 Nettoyage du hook d\'inactivité');
            subscription?.remove();
            InactivityService.stop();
        };
    }, [enabled, timeoutMinutes, warningMinutes, onWarning, onTimeout, onActivity]);

    // Fonctions utilitaires
    const recordActivity = () => {
        if (enabled) {
            InactivityService.recordActivity();
        }
    };

    const getTimeUntilTimeout = () => {
        return InactivityService.getTimeUntilTimeout();
    };

    const isInWarningPeriod = () => {
        return InactivityService.isInWarningPeriod();
    };

    const resetTimer = () => {
        if (enabled) {
            InactivityService.recordActivity();
        }
    };

    return {
        recordActivity,
        getTimeUntilTimeout,
        isInWarningPeriod,
        resetTimer,
    };
};
