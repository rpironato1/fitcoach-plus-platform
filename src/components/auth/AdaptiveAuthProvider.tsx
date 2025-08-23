/**
 * Adaptive Auth Provider
 * 
 * Chooses between Supabase and localStorage authentication
 * based on the localStorage flag 'fitcoach_use_localStorage'
 */

import { ReactNode, createContext, useContext } from 'react';
import { AuthProvider, useAuth as useSupabaseAuth } from './AuthProvider';
import { LocalStorageAuthProvider, useLocalStorageAuth } from './LocalStorageAuthProvider';
import { localStorageService } from '@/services/localStorageService';

interface AdaptiveAuthProviderProps {
  children: ReactNode;
}

// Create a context to track which provider is being used
const AuthModeContext = createContext<{ useLocalStorage: boolean }>({ useLocalStorage: false });

function AuthModeProvider({ children, useLocalStorage }: { children: ReactNode; useLocalStorage: boolean }) {
  return (
    <AuthModeContext.Provider value={{ useLocalStorage }}>
      {children}
    </AuthModeContext.Provider>
  );
}

export function AdaptiveAuthProvider({ children }: AdaptiveAuthProviderProps) {
  const useLocalStorage = localStorageService.shouldUseLocalStorage();
  
  if (useLocalStorage) {
    return (
      <AuthModeProvider useLocalStorage={true}>
        <LocalStorageAuthProvider>
          {children}
        </LocalStorageAuthProvider>
      </AuthModeProvider>
    );
  }
  
  return (
    <AuthModeProvider useLocalStorage={false}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AuthModeProvider>
  );
}

// Custom hook that works with both providers
export function useAuth() {
  const { useLocalStorage } = useContext(AuthModeContext);
  
  if (useLocalStorage) {
    return useLocalStorageAuth();
  }
  
  return useSupabaseAuth();
}