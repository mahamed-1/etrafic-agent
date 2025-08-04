import { useState } from 'react';
import { ErrorDetails, ErrorService } from '@/services/errorService';

export interface UseErrorHandlerReturn {
    error: ErrorDetails | null;
    showError: boolean;
    setError: (error: ErrorDetails | null) => void;
    showErrorMessage: (error: ErrorDetails) => void;
    clearError: () => void;
    handleError: (error: unknown, context?: any) => ErrorDetails;
}

/**
 * Hook personnalisé pour la gestion des erreurs avec affichage moderne
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
    const [error, setError] = useState<ErrorDetails | null>(null);
    const [showError, setShowError] = useState(false);

    const showErrorMessage = (errorDetails: ErrorDetails) => {
        setError(errorDetails);
        setShowError(true);
    };

    const clearError = () => {
        setError(null);
        setShowError(false);
    };

    const handleError = (error: unknown, context?: any): ErrorDetails => {
        const errorDetails = ErrorService.processAuthError(error, context);
        showErrorMessage(errorDetails);
        return errorDetails;
    };

    return {
        error,
        showError,
        setError,
        showErrorMessage,
        clearError,
        handleError
    };
};
