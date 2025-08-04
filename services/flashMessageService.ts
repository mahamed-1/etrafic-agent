import { showMessage, MessageType } from 'react-native-flash-message';
import { ErrorDetails } from './errorService';

export class FlashMessageService {
    /**
     * Affiche un message d'erreur formaté
     */
    static showError(errorDetails: ErrorDetails) {
        showMessage({
            message: this.getErrorTitle(errorDetails),
            description: errorDetails.userMessage,
            type: "danger",
            icon: "danger",
            duration: this.getErrorDuration(errorDetails),
            floating: true,
        });
    }

    /**
     * Affiche un message d'erreur simple
     */
    static showSimpleError(message: string, description?: string) {
        showMessage({
            message: message,
            description: description,
            type: "danger",
            icon: "danger",
            duration: 4000,
            floating: true,
        });
    }

    /**
     * Affiche un message de succès
     */
    static showSuccess(title: string, description?: string, duration: number = 2000) {
        showMessage({
            message: title,
            description: description,
            type: "success",
            icon: "success",
            duration: duration,
            floating: true,
        });
    }

    /**
     * Affiche un message d'information
     */
    static showInfo(title: string, description?: string, duration: number = 3000) {
        showMessage({
            message: title,
            description: description,
            type: "info",
            icon: "info",
            duration: duration,
            floating: true,
        });
    }

    /**
     * Affiche un message d'avertissement
     */
    static showWarning(title: string, description?: string, duration: number = 4000) {
        showMessage({
            message: title,
            description: description,
            type: "warning",
            icon: "warning",
            duration: duration,
            floating: true,
        });
    }

    /**
     * Détermine le titre approprié selon le type d'erreur
     */
    private static getErrorTitle(errorDetails: ErrorDetails): string {
        switch (errorDetails.category) {
            case 'network':
                return 'Erreur de connexion';
            case 'auth':
                return 'Erreur d\'authentification';
            case 'validation':
                return 'Erreur de validation';
            case 'server':
                return 'Erreur serveur';
            case 'unknown':
            default:
                return 'Erreur';
        }
    }

    /**
     * Détermine la durée d'affichage selon la sévérité
     */
    private static getErrorDuration(errorDetails: ErrorDetails): number {
        switch (errorDetails.severity) {
            case 'low':
                return 3000;
            case 'medium':
                return 5000;
            case 'high':
                return 7000;
            case 'critical':
                return 10000;
            default:
                return 5000;
        }
    }
}
