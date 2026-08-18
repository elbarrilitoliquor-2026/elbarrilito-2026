/* ============================================================
   AUTH CONTEXT
   Wraps supabaseClient.auth session management. Gates the whole
   app: unauthenticated -> LoginScreen, authenticated -> AdminApp.
   Mirrors admin/admin.js's checkSession()/login/logout flow.

   Security additions:
   - Idle session timeout: auto sign-out after IDLE_TIMEOUT_MS of
     no user interaction (mousemove, keydown, click, scroll, touch).
     Keeps admin sessions from being left open on unattended machines.
   ============================================================ */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

const AuthContext = createContext(null);

// Auto sign-out after 30 minutes of inactivity
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const idleTimerRef = useRef(null);

  /* ── Idle timeout ────────────────────────────────────────────── */
  function resetIdleTimer() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      // Only sign out if actually logged in — avoids noise on the login screen.
      supabaseClient.auth.getSession().then(({ data: { session: s } }) => {
        if (s) {
          console.warn('[AuthContext] Session expired due to inactivity. Signing out.');
          supabaseClient.auth.signOut();
          setSession(null);
        }
      });
    }, IDLE_TIMEOUT_MS);
  }

  function startIdleWatcher() {
    resetIdleTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));
  }

  function stopIdleWatcher() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
  }

  /* ── Session management ──────────────────────────────────────── */
  useEffect(() => {
    let mounted = true;

    supabaseClient.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      setLoading(false);
      if (initialSession) startIdleWatcher();
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        stopIdleWatcher();
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        startIdleWatcher();
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
      stopIdleWatcher();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { error };
    const { data: { session: newSession } } = await supabaseClient.auth.getSession();
    setSession(newSession);
    startIdleWatcher();
    return { error: null };
  }

  async function signOut() {
    stopIdleWatcher();
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
