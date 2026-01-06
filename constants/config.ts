// Configuration centralisée pour l'API
export const API_CONFIG = {
    // URL de base pour tous les services
    BASE_URL: 'https://evisav2.gouv.dj/etraffic-api/api/v1',
    // BASE_URL: 'http://192.168.100.150:9191/api/v1',
    // BASE_URL: 'http://192.168.100.47:9191/api/v1',

    // URLs complètes (construites à partir de BASE_URL)
    get AUTH_URL() {
        return `${this.BASE_URL}/auth`;
    },

    // Configuration des timeouts
    TIMEOUT: 15000, // 15 secondes

    // Configuration des headers par défaut
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },

    // Configuration du cache
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Configuration de développement/production
export const isDevelopment = __DEV__;

// Configuration des logs
export const LOG_CONFIG = {
    ENABLE_API_LOGS: isDevelopment,
    ENABLE_ERROR_LOGS: isDevelopment, // Seulement en développement
    ENABLE_AUTH_LOGS: isDevelopment,
    ENABLE_USER_LOGS: true, // Pour les logs importants que l'utilisateur peut voir
};


