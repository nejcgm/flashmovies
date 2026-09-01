import axios from "axios";
import type {
  AuthResponse,
  LoginData,
  RegisterData,
} from "../interfaces/auth/index.ts";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_PREFIX = "/api/v1";

const TOKEN_KEY = "flashmovies_token";
const USER_KEY = "flashmovies_user";

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

const storeAuthData = (data: AuthResponse): void => {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

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

authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}${API_PREFIX}/public/auth/register`,
    data
  );
  storeAuthData(response.data);
  return response.data;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}${API_PREFIX}/public/auth/login`,
    data
  );
  storeAuthData(response.data);
  return response.data;
};
