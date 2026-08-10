/* ============================================================
   AUTH CONTEXT
   Wraps supabaseClient.auth session management. Gates the whole
   app: unauthenticated -> LoginScreen, authenticated -> AdminApp.
   Mirrors admin/admin.js's checkSession()/login/logout flow.
   ============================================================ */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        return;
      }
      setSession(newSession);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { error };
    const { data: { session } } = await supabaseClient.auth.getSession();
    setSession(session);
    return { error: null };
  }

  async function signOut() {
    await supabaseClient.auth.signOut();
    setSession(null);
  }

  const value = { session, loading, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
