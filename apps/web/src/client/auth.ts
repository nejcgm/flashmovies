import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_PREFIX = '/api/v1';

// Token management
const TOKEN_KEY = 'flashmovies_token';
const USER_KEY = 'flashmovies_user';

interface User {
  id: number;
  email: string;
  displayName: string | null;
  role?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Get stored token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Store auth data
const storeAuthData = (data: AuthResponse): void => {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

// Clear auth data
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Create axios instance with auth header
export const authAxios = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
});

authAxios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Register new user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}${API_PREFIX}/public/auth/register`,
    data
  );
  storeAuthData(response.data);
  return response.data;
};

// Login user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}${API_PREFIX}/public/auth/login`,
    data
  );
  storeAuthData(response.data);
  return response.data;
};
