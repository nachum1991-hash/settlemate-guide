import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Create a separate auth client that uses sessionStorage
// This ensures users must log in each time they open the browser
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const sessionAuthClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: sessionStorage, // Use sessionStorage instead of localStorage
    persistSession: true,
    autoRefreshToken: true,
  }
});

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  supabase: typeof sessionAuthClient;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  supabase: sessionAuthClient,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any old localStorage auth tokens on app startup
    // This ensures users from before this change also need to re-login
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') && key.includes('-auth-token')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Set up auth state listener
    const { data: { subscription } } = sessionAuthClient.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    sessionAuthClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, supabase: sessionAuthClient }}>
      {children}
    </AuthContext.Provider>
  );
};
