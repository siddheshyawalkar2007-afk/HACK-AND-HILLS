import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured, SupabaseDb, setRuntimeSupabaseConfig } from '../lib/supabase';
import { DemoAuthService, DemoSessionUser, seedDefaultDemoAccount } from '../lib/demoAuthStore';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  walletAddress?: string;
  creditScore: number;
  authProvider: 'DEMO' | 'SUPABASE';
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  authProvider: 'DEMO' | 'SUPABASE';
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  activeAuthProvider: 'DEMO' | 'SUPABASE';
  isBackendConnected: boolean;
  connectionStatusMessage: string;
  isConfigured: boolean;
  
  // Demo Auth Actions (Hypothetical accounts, zero email verification)
  signUpDemo: (
    email: string,
    pass: string,
    confirmPass: string,
    displayName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInDemo: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;

  // Supabase Auth Actions (Real backend when configured)
  signUpSupabase: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signInSupabase: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;

  // Unified wrappers
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  loginAsDemoUser: () => Promise<void>;
  checkConnection: () => Promise<void>;
  updateConfig: (url: string, key: string) => void;
  listDemoAccounts: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeAuthProvider, setActiveAuthProvider] = useState<'DEMO' | 'SUPABASE'>('DEMO');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [connectionStatusMessage, setConnectionStatusMessage] = useState<string>('Initializing...');
  const [isConfigured, setIsConfigured] = useState<boolean>(isSupabaseConfigured());

  const checkConnection = async () => {
    if (!isSupabaseConfigured()) {
      setIsBackendConnected(false);
      setConnectionStatusMessage('Supabase credentials not configured. Operating in Standalone Demo Mode.');
      return;
    }

    try {
      const { success, message } = await SupabaseDb.testConnection();
      setIsBackendConnected(success);
      setConnectionStatusMessage(message);
    } catch (err: any) {
      setIsBackendConnected(false);
      setConnectionStatusMessage(`Connection error: ${err.message || 'Unknown'}`);
    }
  };

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      // 1. Pre-seed standard test account (student@example.test / DemoPass123!)
      await seedDefaultDemoAccount();

      // 2. Check for active Demo Authentication session
      const activeDemoUser = DemoAuthService.getActiveSession();
      if (activeDemoUser) {
        setUser({
          id: activeDemoUser.id,
          email: activeDemoUser.email,
          displayName: activeDemoUser.displayName,
          authProvider: 'DEMO',
          createdAt: activeDemoUser.createdAt,
        });
        setProfile({
          id: activeDemoUser.id,
          email: activeDemoUser.email,
          displayName: activeDemoUser.displayName,
          creditScore: 68,
          authProvider: 'DEMO',
        });
        setActiveAuthProvider('DEMO');
        await checkConnection();
        setIsLoading(false);
        return;
      }

      // 3. If no demo session, check Supabase session if configured
      const sb = getSupabase();
      if (sb) {
        try {
          const { data: { session } } = await sb.auth.getSession();
          if (session?.user && session.user.email) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              displayName: session.user.email.split('@')[0] || 'Trader',
              authProvider: 'SUPABASE',
              createdAt: session.user.created_at || new Date().toISOString(),
            });
            setProfile({
              id: session.user.id,
              email: session.user.email,
              displayName: session.user.email.split('@')[0] || 'Trader',
              creditScore: 68,
              authProvider: 'SUPABASE',
            });
            setActiveAuthProvider('SUPABASE');
          }
        } catch (e) {
          console.warn('Error reading Supabase session:', e);
        }
      }

      await checkConnection();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // --- DEMO AUTHENTICATION IMPLEMENTATION ---

  const signUpDemo = async (
    email: string,
    pass: string,
    confirmPass: string,
    displayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await DemoAuthService.register({
        email,
        password: pass,
        confirmPassword: confirmPass,
        displayName,
      });

      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Failed to register demo account.' };
      }

      setUser({
        id: res.user.id,
        email: res.user.email,
        displayName: res.user.displayName,
        authProvider: 'DEMO',
        createdAt: res.user.createdAt,
      });
      setProfile({
        id: res.user.id,
        email: res.user.email,
        displayName: res.user.displayName,
        creditScore: 68,
        authProvider: 'DEMO',
      });
      setActiveAuthProvider('DEMO');

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Demo registration failed.' };
    }
  };

  const signInDemo = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await DemoAuthService.signIn({ email, password: pass });
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Invalid email or password.' };
      }

      setUser({
        id: res.user.id,
        email: res.user.email,
        displayName: res.user.displayName,
        authProvider: 'DEMO',
        createdAt: res.user.createdAt,
      });
      setProfile({
        id: res.user.id,
        email: res.user.email,
        displayName: res.user.displayName,
        creditScore: 68,
        authProvider: 'DEMO',
      });
      setActiveAuthProvider('DEMO');

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Demo sign in failed.' };
    }
  };

  // --- SUPABASE CLOUD AUTHENTICATION ---

  const signInSupabase = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const sb = getSupabase();
    if (!sb) {
      return { success: false, error: 'Supabase credentials are not configured. Use Demo Authentication.' };
    }
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) return { success: false, error: error.message };
      if (data.user && data.user.email) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.email.split('@')[0] || 'Trader',
          authProvider: 'SUPABASE',
          createdAt: data.user.created_at || new Date().toISOString(),
        });
        setProfile({
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.email.split('@')[0] || 'Trader',
          creditScore: 68,
          authProvider: 'SUPABASE',
        });
        setActiveAuthProvider('SUPABASE');
        return { success: true };
      }
      return { success: false, error: 'Sign in failed.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const signUpSupabase = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const sb = getSupabase();
    if (!sb) {
      return { success: false, error: 'Supabase credentials are not configured. Use Demo Authentication.' };
    }
    try {
      const { data, error } = await sb.auth.signUp({ email, password: pass });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        return { success: true };
      }
      return { success: false, error: 'Sign up failed.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Unified Sign In wrapper (tries Demo first, then Supabase if configured)
  const signIn = async (email: string, pass: string) => {
    if (activeAuthProvider === 'DEMO') {
      return signInDemo(email, pass);
    }
    return signInSupabase(email, pass);
  };

  const signUp = async (email: string, pass: string) => {
    if (activeAuthProvider === 'DEMO') {
      return signUpDemo(email, pass, pass);
    }
    return signUpSupabase(email, pass);
  };

  const signOut = async () => {
    // 1. Clear Demo session
    DemoAuthService.signOut();

    // 2. Clear Supabase session if connected
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e);
      }
    }

    setUser(null);
    setProfile(null);
  };

  const loginAsDemoUser = async () => {
    // Sign in as default student test user
    const res = await signInDemo('student@example.test', 'DemoPass123!');
    if (!res.success) {
      // Fallback create
      await signUpDemo('student@example.test', 'DemoPass123!', 'DemoPass123!', 'Student Pioneer');
    }
  };

  const updateConfig = (url: string, key: string) => {
    setRuntimeSupabaseConfig(url, key);
    setIsConfigured(isSupabaseConfigured());
    checkConnection();
  };

  const listDemoAccounts = () => {
    return DemoAuthService.listRegisteredEmails();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        activeAuthProvider,
        isBackendConnected,
        connectionStatusMessage,
        isConfigured,
        signUpDemo,
        signInDemo,
        signUpSupabase,
        signInSupabase,
        signIn,
        signUp,
        signOut,
        loginAsDemoUser,
        checkConnection,
        updateConfig,
        listDemoAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
