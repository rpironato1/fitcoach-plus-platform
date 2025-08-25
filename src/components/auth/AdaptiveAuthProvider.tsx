/**
 * Adaptive Auth Provider
 * 
 * Chooses between Supabase and localStorage authentication
 * based on the localStorage flag 'fitcoach_use_localStorage'
 */

import { ReactNode, createContext, useContext, useMemo } from 'react';
import { AuthProvider, useAuth as useSupabaseAuth } from './AuthProvider';
import { LocalStorageAuthProvider, useLocalStorageAuth } from './LocalStorageAuthProvider';
import { localStorageService } from '@/services/localStorageService';

interface AdaptiveAuthProviderProps {
  children: ReactNode;
}

// Create context for auth mode
const AuthModeContext = createContext<{ useLocalStorage: boolean }>({ useLocalStorage: false });

// Wrapper component that always provides both providers
function DualAuthProvider({ children, useLocalStorage }: { children: ReactNode; useLocalStorage: boolean }) {
  return (
    <AuthModeContext.Provider value={{ useLocalStorage }}>
      <AuthProvider>
        <LocalStorageAuthProvider>
          {children}
        </LocalStorageAuthProvider>
      </AuthProvider>
    </AuthModeContext.Provider>
  );
}

export function AdaptiveAuthProvider({ children }: AdaptiveAuthProviderProps) {
  const useLocalStorage = localStorageService.shouldUseLocalStorage();
  
  return (
    <DualAuthProvider useLocalStorage={useLocalStorage}>
      {children}
    </DualAuthProvider>
  );
}

// Hook that returns the appropriate auth based on mode
export function useAuth() {
  const { useLocalStorage } = useContext(AuthModeContext);
  
  // Always call both hooks (this satisfies rules of hooks)
  const localStorageAuth = useLocalStorageAuth();
  const supabaseAuth = useSupabaseAuth();
  
  // Return the appropriate one based on mode
  return useMemo(() => {
    return useLocalStorage ? localStorageAuth : supabaseAuth;
  }, [useLocalStorage, localStorageAuth, supabaseAuth]);
}