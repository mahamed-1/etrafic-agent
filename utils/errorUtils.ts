
import axios, { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message;
    }
    return 'Erreur inconnue';
}

export function logError(error: unknown, context?: string): void {
    console.error(`[ERROR]${context ? ` ${context}:` : ''}`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        ...(axios.isAxiosError(error) ? {
            status: error.response?.status,
            data: error.response?.data
        } : {})
    });
}