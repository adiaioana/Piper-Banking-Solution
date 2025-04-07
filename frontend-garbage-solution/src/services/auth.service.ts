import { api } from './api';

interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  governmentIdType: string;
  governmentIdNumber: string;
  governmentIdIssuingCountry: string;
  governmentIdExpirationDate: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return api.post('/auth/Auth/login?username=' + credentials.username + '&password=' + credentials.password);
  },

  register: async (password: string, data: RegisterData): Promise<AuthResponse> => {
    return api.post('/auth/Auth/register?password=' + password, data);
  },

  logout: async (token: string, refreshToken: string): Promise<void> => {
    return api.post('/auth/Auth/logout', {token, refreshToken});
  },
  refresh: async (token: string, refreshToken: string): Promise<AuthResponse> => {
    return api.post('/auth/Auth/refresh', {token, refreshToken});
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    return api.get('/auth/Auth/me');
  },
}; 