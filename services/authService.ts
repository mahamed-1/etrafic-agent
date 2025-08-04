
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import { User, LoginCredentials } from '@/types/auth';
import { apiService } from './api';
import { API_CONFIG, LOG_CONFIG } from '@/constants/config';
import { ErrorService, ErrorDetails } from './errorService';

const API_URL = API_CONFIG.AUTH_URL;


interface JwtPayload {
  exp: number;
  iat: number;
  sub: string;
  role?: string;
  user_id?: string;
  email?: string;
}

export class AuthService {
  private static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt_decode<JwtPayload>(token);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  static async login(credentials: LoginCredentials): Promise<User> {
    if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
      console.log('🔐 Tentative de connexion avec:', credentials.identifier);
      console.log('🌐 URL d\'authentification:', API_URL);
    }

    // Message simple pour l'utilisateur
    if (LOG_CONFIG.ENABLE_USER_LOGS) {
      console.log('🔐 Connexion en cours...');
    }

    try {
      const response = await axios.post(`${API_URL}/login`, {
        identifier: credentials.identifier,
        password: credentials.password
      }, {
        headers: API_CONFIG.DEFAULT_HEADERS,
        timeout: API_CONFIG.TIMEOUT
      });

      if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
        console.log('✅ Réponse du serveur reçue:', {
          status: response.status,
          hasAccessToken: !!response.data?.accessToken,
          hasRefreshToken: !!response.data?.refreshToken
        });
      }

      const { accessToken, refreshToken } = response.data;

      if (!accessToken) {
        const error = new Error('Aucun token reçu');
        const errorDetails = ErrorService.processAuthError(error, {
          endpoint: `${API_URL}/login`,
          identifier: credentials.identifier,
          responseData: response.data
        });
        if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
          ErrorService.debugError(errorDetails);
        }
        throw error;
      }

      // Décodage et validation du token
      const decoded = this.decodeToken(accessToken);
      if (!decoded) {
        const error = new Error('Token invalide');
        const errorDetails = ErrorService.processAuthError(error, {
          endpoint: `${API_URL}/login`,
          tokenReceived: !!accessToken
        });
        if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
          ErrorService.debugError(errorDetails);
        }
        throw error;
      }

      if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
        console.log('🎫 Token décodé avec succès:', {
          userId: decoded.user_id,
          role: decoded.role,
          exp: new Date(decoded.exp * 1000).toISOString()
        });
      }

      // Vérification stricte du rôle agent
      if (decoded.role !== 'ROLE_AGENT') {
        if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
          console.warn('⚠️ Tentative de connexion avec rôle non autorisé:', decoded.role);
        }
        const error = new Error('Accès réservé aux agents seulement');
        const errorDetails = ErrorService.processAuthError(error, {
          userRole: decoded.role,
          expectedRole: 'ROLE_AGENT',
          userId: decoded.user_id
        });
        if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
          ErrorService.debugError(errorDetails);
        }
        throw error;
      }

      const user: User = {
        id: decoded.user_id || 'N/A',
        identifier: decoded.sub,
        name: decoded.sub.split('@')[0] || decoded.sub,
        email: decoded.email || '',
        zone: '',
        mission: '',
        role: 'agent', // Forcé à agent
        token: accessToken,
        tokenExpiry: new Date(decoded.exp * 1000).toISOString()
      };

      // Stockage sécurisé
      await AsyncStorage.multiSet([
        ['auth_token', accessToken],
        ['refresh_token', refreshToken],
        ['psr_user', JSON.stringify(user)],
        ['token_expiry', user.tokenExpiry]
      ]);

      if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
        console.log('✅ Connexion réussie pour:', {
          identifier: user.identifier,
          name: user.name,
          tokenExpiry: user.tokenExpiry
        });
      }

      // Message simple pour l'utilisateur
      if (LOG_CONFIG.ENABLE_USER_LOGS) {
        console.log('✅ Connexion réussie');
      }

      return user;

    } catch (error) {
      // Traitement professionnel de l'erreur
      const errorDetails = ErrorService.processAuthError(error, {
        endpoint: `${API_URL}/login`,
        identifier: credentials.identifier,
        timestamp: new Date().toISOString()
      });
 
      // Debug détaillé en développement seulement
      if (LOG_CONFIG.ENABLE_AUTH_LOGS) {
        ErrorService.debugError(errorDetails);
      }

      // Logs spécifiques selon le type d'erreur - seulement en développement
      if (LOG_CONFIG.ENABLE_ERROR_LOGS) {
        console.error('❌ Échec de l\'authentification:', {
          code: errorDetails.code,
          category: errorDetails.category,
          severity: errorDetails.severity,
          userMessage: errorDetails.userMessage
        });
      }

      // Message simple pour l'utilisateur
      if (LOG_CONFIG.ENABLE_USER_LOGS) {
        console.log('❌ Échec de la connexion');
      }

      // Relancer l'erreur avec le message utilisateur
      const enhancedError = new Error(errorDetails.userMessage);
      (enhancedError as any).details = errorDetails;
      throw enhancedError;
    }
  } static async logout(): Promise<void> {
    try {
      // Utilisation du service centralisé pour la déconnexion
      await apiService.post('/auth/logout', {});
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyage local des données
      await AsyncStorage.multiRemove([
        'auth_token',
        'psr_user',
        'refresh_token',
        'token_expiry'
      ]);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const [userString, token] = await AsyncStorage.multiGet([
        'psr_user',
        'auth_token'
      ]);

      if (!token[1]) return null;

      // Vérification expiration du token
      const decoded = this.decodeToken(token[1]);
      if (!decoded || new Date(decoded.exp * 1000) < new Date()) {
        return null;
      }

      const user = userString[1] ? JSON.parse(userString[1]) : null;

      // Double vérification du rôle
      if (user && decoded.role !== 'ROLE_AGENT') {
        await this.logout();
        return null;
      }

      return user;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  }

  static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      // Utilisation d'axios direct pour éviter la récursion avec les intercepteurs
      const response = await axios.post(`${API_URL}/refresh`, {
        refreshToken
      });

      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken || refreshToken;

      await AsyncStorage.multiSet([
        ['auth_token', newAccessToken],
        ['refresh_token', newRefreshToken]
      ]);

      return newAccessToken;
    } catch (error) {
      console.error('Erreur rafraîchissement token:', error);
      await this.logout();
      return null;
    }
  }

  static async getProfile(): Promise<{ username: string; email: string } | null> {
    try {
      const response = await apiService.get('/auth/profile');
      return {
        username: response.data.username || '',
        email: response.data.email || ''
      };
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      throw new Error('Impossible de récupérer le profil');
    }
  }
}