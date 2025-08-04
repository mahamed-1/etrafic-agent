
// export interface User {
//   id: string;
//   identifier: string; // Remplacement de badge
//   name: string;
//   email: string;
//   zone: string;
//   mission: string;
//   role: 'agent';
//   token?: string;
// }

// export interface LoginCredentials {
//   identifier: string;  // Remplacement de badge par identifier
//   password: string;
// }
// export interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
// }

// export interface AuthContextType extends AuthState {
//   login: (credentials: LoginCredentials) => Promise<void>;
//   logout: () => Promise<void>;
//   clearError: () => void;
// }

// types/auth.ts
export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface User {
  id: string;
  identifier: string;
  name: string;
  email: string;
  zone?: string;
  mission?: string;
  role: 'agent'; // Seul le rôle 'agent' est autorisé
  token: string;
  tokenExpiry?: string;
}
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}