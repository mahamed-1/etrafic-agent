import { LOG_CONFIG } from '@/constants/config';

export interface ErrorDetails {
    code: string;
    message: string;
    userMessage: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
    timestamp: string;
    context?: any;
}

export class ErrorService {
    private static errorHistory: ErrorDetails[] = [];

    // Codes d'erreurs spécifiques pour l'authentification
    private static readonly AUTH_ERROR_CODES = {
        NETWORK_ERROR: 'AUTH_NETWORK_ERROR',
        INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
        ACCESS_DENIED: 'AUTH_ACCESS_DENIED',
        SERVER_ERROR: 'AUTH_SERVER_ERROR',
        TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
        ROLE_FORBIDDEN: 'AUTH_ROLE_FORBIDDEN',
        TIMEOUT: 'AUTH_TIMEOUT',
        UNKNOWN: 'AUTH_UNKNOWN_ERROR'
    } as const;

    static processAuthError(error: any, context?: any): ErrorDetails {
        const timestamp = new Date().toISOString();
        let errorDetails: ErrorDetails;

        if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
            errorDetails = {
                code: this.AUTH_ERROR_CODES.NETWORK_ERROR,
                message: `Erreur réseau: ${error.code}`,
                userMessage: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
                severity: 'high',
                category: 'network',
                timestamp,
                context
            };
        } else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
            errorDetails = {
                code: this.AUTH_ERROR_CODES.TIMEOUT,
                message: 'Délai d\'attente dépassé',
                userMessage: 'La connexion a pris trop de temps. Veuillez réessayer.',
                severity: 'medium',
                category: 'network',
                timestamp,
                context
            };
        } else if (error?.response?.status === 401) {
            errorDetails = {
                code: this.AUTH_ERROR_CODES.INVALID_CREDENTIALS,
                message: 'Identifiants incorrects (401)',
                userMessage: 'Nom d\'utilisateur ou mot de passe incorrect.',
                severity: 'medium',
                category: 'auth',
                timestamp,
                context
            };
        } else if (error?.response?.status === 403) {
            errorDetails = {
                code: this.AUTH_ERROR_CODES.ACCESS_DENIED,
                message: 'Accès refusé (403)',
                userMessage: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette application.',
                severity: 'high',
                category: 'auth',
                timestamp,
                context
            };
        } else if (error?.response?.status >= 500) {
            errorDetails = {
                code: this.AUTH_ERROR_CODES.SERVER_ERROR,
                message: `Erreur serveur (${error.response.status})`,
                userMessage: 'Le serveur rencontre des difficultés. Veuillez réessayer dans quelques minutes.',
                severity: 'high',
                category: 'server',
                timestamp,
                context
            };
        } else if (error?.message?.includes('Token invalide')) {
            errorDetails = {
                code: this.AUTH_ERROR_CODES.TOKEN_INVALID,
                message: 'Token JWT invalide',
                userMessage: 'Session expirée. Veuillez vous reconnecter.',
                severity: 'medium',
                category: 'auth',
                timestamp,
                context
            };
        } else if (error?.message?.includes('Accès réservé aux agents')) {
            errorDetails = {
                code: this.AUTH_ERROR_CODES.ROLE_FORBIDDEN,
                message: 'Rôle utilisateur non autorisé',
                userMessage: 'Cette application est réservée aux agents. Contactez votre administrateur.',
                severity: 'high',
                category: 'auth',
                timestamp,
                context
            };
        } else {
            errorDetails = {
                code: this.AUTH_ERROR_CODES.UNKNOWN,
                message: error?.message || 'Erreur inconnue',
                userMessage: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
                severity: 'medium',
                category: 'unknown',
                timestamp,
                context
            };
        }

        // Enregistrer l'erreur
        this.logError(errorDetails);

        return errorDetails;
    }

    private static logError(error: ErrorDetails) {
        // Ajouter à l'historique
        this.errorHistory.push(error);

        // Limiter l'historique à 50 erreurs
        if (this.errorHistory.length > 50) {
            this.errorHistory = this.errorHistory.slice(-50);
        }

        // Logs selon la configuration
        if (LOG_CONFIG.ENABLE_ERROR_LOGS) {
            const logLevel = this.getLogLevel(error.severity);
            const logMessage = `[${error.code}] ${error.message}`;
            const logContext = {
                userMessage: error.userMessage,
                category: error.category,
                timestamp: error.timestamp,
                context: error.context
            };

            switch (logLevel) {
                case 'error':
                    console.error(`🚨 ${logMessage}`, logContext);
                    break;
                case 'warn':
                    console.warn(`⚠️ ${logMessage}`, logContext);
                    break;
                default:
                    console.log(`ℹ️ ${logMessage}`, logContext);
            }
        }
    }

    private static getLogLevel(severity: ErrorDetails['severity']): 'error' | 'warn' | 'info' {
        switch (severity) {
            case 'critical':
            case 'high':
                return 'error';
            case 'medium':
                return 'warn';
            default:
                return 'info';
        }
    }

    // Méthodes utilitaires
    static getErrorHistory(): ErrorDetails[] {
        return [...this.errorHistory];
    }

    static clearErrorHistory(): void {
        this.errorHistory = [];
    }

    static getErrorsByCategory(category: ErrorDetails['category']): ErrorDetails[] {
        return this.errorHistory.filter(error => error.category === category);
    }

    // Pour le développement - affichage détaillé
    static debugError(error: ErrorDetails): void {
        if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
            console.group(`🔍 Debug Error: ${error.code}`);
            console.log('📝 Message:', error.message);
            console.log('👤 User Message:', error.userMessage);
            console.log('🎯 Category:', error.category);
            console.log('⚠️ Severity:', error.severity);
            console.log('⏰ Timestamp:', error.timestamp);
            if (error.context) {
                console.log('📋 Context:', error.context);
            }
            console.groupEnd();
        }
    }
}
