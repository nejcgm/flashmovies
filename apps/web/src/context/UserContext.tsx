import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getToken, clearAuthData } from '../client/auth';
import { getCurrentUser } from '../client/user';
import type { SubscriptionStatus, UserProfile } from '../interfaces/user/index.ts';

interface UserState {
  isLoggedIn: boolean;
  isPro: boolean;
  user: UserProfile | null;
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
}

interface UserContextType extends UserState {
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const initialState: UserState = {
  isLoggedIn: false,
  isPro: false,
  user: null,
  subscription: null,
  isLoading: true,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [state, setState] = useState<UserState>(initialState);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    
    if (!token) {
      setState({
        isLoggedIn: false,
        isPro: false,
        user: null,
        subscription: null,
        isLoading: false,
      });
      return;
    }

    try {
      const userProfile = await getCurrentUser();
      const isPro =
        userProfile.role === 'pro' ||
        userProfile.role === 'admin' ||
        userProfile.subscription.isPro;
      
      setState({
        isLoggedIn: true,
        isPro,
        user: userProfile,
        subscription: userProfile.subscription,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setState({
        isLoggedIn: false,
        isPro: false,
        user: null,
        subscription: null,
        isLoading: false,
      });
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    setState({
      isLoggedIn: false,
      isPro: false,
      user: null,
      subscription: null,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'flashmovies_token') {
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ ...state, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
