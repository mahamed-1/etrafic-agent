import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, LOG_CONFIG } from '@/constants/config';

// Configuration de base
const API_BASE_URL = API_CONFIG.BASE_URL;
// Cache pour éviter les validations répétées
let sessionValidationCache: {
    isValid: boolean;
    timestamp: number;
} | null = null;

const CACHE_DURATION = API_CONFIG.CACHE_DURATION;

class ApiService {
    private api: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value: any) => void;
        reject: (error: any) => void;
    }> = [];

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: API_CONFIG.DEFAULT_HEADERS,
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor - Ajouter automatiquement le token
        this.api.interceptors.request.use(
            async (config) => {
                const token = await AsyncStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Log des requêtes en développement
                if (LOG_CONFIG.ENABLE_API_LOGS) {
                    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
                    if (config.data) {
                        console.log('📤 Request Data:', config.data);
                    }
                }

                return config;
            },
            (error) => {
                if (LOG_CONFIG.ENABLE_ERROR_LOGS) {
                    console.error('❌ Request Error:', error);
                }
                return Promise.reject(error);
            }
        );

        // Response interceptor - Gérer les erreurs d'authentification
        this.api.interceptors.response.use(
            (response) => {
                // Log des réponses en développement
                if (LOG_CONFIG.ENABLE_API_LOGS) {
                    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
                    console.log('📥 Response Data:', response.data);
                }
                return response;
            },
            async (error) => {
                // Log des erreurs
                if (LOG_CONFIG.ENABLE_ERROR_LOGS) {
                    console.error('❌ API Error:', {
                        url: error.config?.url,
                        status: error.response?.status,
                        message: error.response?.data?.message || error.message
                    });
                }

                const originalRequest = error.config;

                // Si erreur 401/403 et pas déjà en cours de refresh
                if (
                    (error.response?.status === 401 || error.response?.status === 403) &&
                    !originalRequest._retry
                ) {
                    if (this.isRefreshing) {
                        // Mettre en queue les requêtes en attente
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return this.api(originalRequest);
                        }).catch(err => {
                            return Promise.reject(err);
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const newToken = await this.refreshToken();
                        if (newToken) {
                            // Traiter la queue des requêtes en attente
                            this.processQueue(null, newToken);
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return this.api(originalRequest);
                        }
                    } catch (refreshError) {
                        this.processQueue(refreshError, null);
                        // Rediriger vers login si nécessaire
                        this.handleAuthFailure();
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private processQueue(error: any, token: string | null) {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });

        this.failedQueue = [];
    }

    private async refreshToken(): Promise<string | null> {
        try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('Aucun refresh token disponible');
            }

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken: refreshToken
            });

            const { accessToken, access_token } = response.data;
            const newToken = accessToken || access_token;

            if (newToken) {
                await AsyncStorage.setItem('auth_token', newToken);
                return newToken;
            }

            throw new Error('Nouveau token non reçu');
        } catch (error) {
            console.error('Erreur refresh token:', error);
            return null;
        }
    }

    private handleAuthFailure() {
        // Clear storage et rediriger vers login
        AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'psr_user']);
        // Note: La redirection sera gérée par le contexte d'authentification
    }

    // Validation de session avec cache
    async validateSession(): Promise<boolean> {
        try {
            const now = Date.now();

            // Vérifier le cache
            if (
                sessionValidationCache &&
                sessionValidationCache.isValid &&
                (now - sessionValidationCache.timestamp) < CACHE_DURATION
            ) {
                return true;
            }

            // Appeler l'API de validation
            const response = await this.api.get('/auth/session/validate');

            const isValid = response.status === 200;

            // Mettre à jour le cache
            sessionValidationCache = {
                isValid,
                timestamp: now
            };

            return isValid;
        } catch (error) {
            console.error('Erreur validation session:', error);

            // Mettre à jour le cache avec échec
            sessionValidationCache = {
                isValid: false,
                timestamp: Date.now()
            };

            return false;
        }
    }

    // Invalider le cache de session
    invalidateSessionCache() {
        sessionValidationCache = null;
    }

    // Getter pour l'instance Axios
    get instance(): AxiosInstance {
        return this.api;
    }

    // Méthodes helper
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.get(url, config);
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.post(url, data, config);
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.put(url, data, config);
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.delete(url, config);
    }
}

// Instance singleton
export const apiService = new ApiService();