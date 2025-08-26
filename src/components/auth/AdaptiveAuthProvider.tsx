/**
 * Adaptive Auth Provider
 * 
 * Chooses between Supabase and localStorage authentication
 * based on the localStorage flag 'fitcoach_use_localStorage'
 */

import { ReactNode, createContext, useContext, useMemo, useState, useEffect } from 'react';
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
  const [useLocalStorage, setUseLocalStorage] = useState(() => 
    localStorageService.shouldUseLocalStorage()
  );

  useEffect(() => {
    // Listen for localStorage changes
    const handleStorageChange = () => {
      setUseLocalStorage(localStorageService.shouldUseLocalStorage());
    };

    // Listen for both storage events and custom events
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for direct changes to the localStorage
    const checkInterval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);
  
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