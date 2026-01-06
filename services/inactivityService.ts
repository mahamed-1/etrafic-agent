/**
 * Service de gestion de l'inactivité utilisateur
 * Gère la déconnexion automatique après une période d'inactivité
 */

export interface InactivityConfig {
    timeoutDuration: number; // en millisecondes
    warningDuration: number; // temps avant timeout pour afficher l'avertissement
    checkInterval: number;   // intervalle de vérification
}

export interface InactivityCallbacks {
    onWarning: () => void;
    onTimeout: () => void;
    onActivity: () => void;
}

class InactivityServiceClass {
    private timer: ReturnType<typeof setInterval> | null = null;
    private warningTimer: ReturnType<typeof setTimeout> | null = null;
    private lastActivity: number = Date.now();
    private isActive: boolean = false;
    private config: InactivityConfig;
    private callbacks: InactivityCallbacks | null = null;

    constructor() {
        // Configuration par défaut : 15 minutes d'inactivité
        this.config = {
            timeoutDuration: 15 * 60 * 1000, // 15 minutes
            warningDuration: 2 * 60 * 1000,  // 2 minutes avant timeout
            checkInterval: 30 * 1000,        // vérifier toutes les 30 secondes
        };
    }

    /**
     * Initialise le service d'inactivité
     */
    start(callbacks: InactivityCallbacks, customConfig?: Partial<InactivityConfig>) {
        if (customConfig) {
            this.config = { ...this.config, ...customConfig };
        }

        this.callbacks = callbacks;
        this.isActive = true;
        this.lastActivity = Date.now();

        this.startTimer();

        console.log('🕐 Service d\'inactivité démarré:', {
            timeout: `${this.config.timeoutDuration / 60000} minutes`,
            warning: `${this.config.warningDuration / 60000} minutes avant`,
        });
    }

    /**
     * Arrête le service d'inactivité
     */
    stop() {
        this.isActive = false;
        this.clearTimers();
        this.callbacks = null;

        console.log('⏹️ Service d\'inactivité arrêté');
    }

    /**
     * Enregistre une activité utilisateur
     */
    recordActivity() {
        if (!this.isActive) return;

        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivity;

        // Ne pas spam les logs si l'activité est très fréquente
        if (timeSinceLastActivity > 5000) { // 5 secondes
            console.log('👆 Activité utilisateur détectée');
        }

        this.lastActivity = now;

        // Réinitialiser les timers
        this.clearTimers();
        this.startTimer();

        // Notifier l'activité
        if (this.callbacks?.onActivity) {
            this.callbacks.onActivity();
        }
    }

    /**
     * Vérifie l'inactivité et gère les timeouts
     */
    private checkInactivity() {
        if (!this.isActive || !this.callbacks) return;

        const now = Date.now();
        const inactiveTime = now - this.lastActivity;
        const warningTime = this.config.timeoutDuration - this.config.warningDuration;

        console.log('🔍 Vérification inactivité:', {
            inactiveTime: `${Math.round(inactiveTime / 1000)}s`,
            warningThreshold: `${Math.round(warningTime / 1000)}s`,
            timeoutThreshold: `${Math.round(this.config.timeoutDuration / 1000)}s`,
        });

        if (inactiveTime >= this.config.timeoutDuration) {
            // Timeout atteint - déconnexion
            console.log('⏰ Timeout d\'inactivité atteint - déconnexion automatique');
            this.callbacks.onTimeout();
            this.stop();
        } else if (inactiveTime >= warningTime && !this.warningTimer) {
            // Avertissement - bientôt timeout
            console.log('⚠️ Avertissement d\'inactivité');
            this.callbacks.onWarning();

            // Programmer la déconnexion si pas d'activité
            this.warningTimer = setTimeout(() => {
                if (this.isActive && this.callbacks) {
                    console.log('⏰ Déconnexion automatique après avertissement');
                    this.callbacks.onTimeout();
                    this.stop();
                }
            }, this.config.warningDuration);
        }
    }

    /**
     * Démarre le timer principal
     */
    private startTimer() {
        this.timer = setInterval(() => {
            this.checkInactivity();
        }, this.config.checkInterval);
    }

    /**
     * Nettoie tous les timers
     */
    private clearTimers() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }
    }

    /**
     * Obtient le temps restant avant timeout
     */
    getTimeUntilTimeout(): number {
        if (!this.isActive) return 0;

        const now = Date.now();
        const inactiveTime = now - this.lastActivity;
        const remaining = this.config.timeoutDuration - inactiveTime;

        return Math.max(0, remaining);
    }

    /**
     * Vérifie si un avertissement est actif
     */
    isInWarningPeriod(): boolean {
        if (!this.isActive) return false;

        const now = Date.now();
        const inactiveTime = now - this.lastActivity;
        const warningTime = this.config.timeoutDuration - this.config.warningDuration;

        return inactiveTime >= warningTime && inactiveTime < this.config.timeoutDuration;
    }

    /**
     * Obtient la configuration actuelle
     */
    getConfig(): InactivityConfig {
        return { ...this.config };
    }

    /**
     * Met à jour la configuration
     */
    updateConfig(newConfig: Partial<InactivityConfig>) {
        this.config = { ...this.config, ...newConfig };

        // Redémarrer avec la nouvelle configuration
        if (this.isActive && this.callbacks) {
            this.clearTimers();
            this.startTimer();
        }

        console.log('⚙️ Configuration d\'inactivité mise à jour:', this.config);
    }
}

// Instance singleton
export const InactivityService = new InactivityServiceClass();
