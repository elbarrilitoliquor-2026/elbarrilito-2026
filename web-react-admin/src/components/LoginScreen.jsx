import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/* ── Brute-force protection constants ────────────────────────────────────
   After each consecutive failed attempt the user must wait an increasing
   cooldown before trying again. The lockout doubles each time, capped at
   10 minutes. This runs entirely client-side and is complementary to
   Supabase Auth's own server-side rate limits.

   Attempt → cooldown: 1→0s, 2→15s, 3→30s, 4→60s, 5+→120s … capped 600s.
   ─────────────────────────────────────────────────────────────────────── */
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 2; // lock after this many failures
const BASE_LOCKOUT_SECONDS = 15;
const MAX_LOCKOUT_SECONDS = 600; // 10 minutes

function calcLockoutSeconds(attempt) {
  if (attempt <= MAX_ATTEMPTS_BEFORE_LOCKOUT) return 0;
  const extra = attempt - MAX_ATTEMPTS_BEFORE_LOCKOUT;
  return Math.min(BASE_LOCKOUT_SECONDS * Math.pow(2, extra - 1), MAX_LOCKOUT_SECONDS);
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Brute-force tracking
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const timerRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [lockoutRemaining]);

  const isLockedOut = lockoutRemaining > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLockedOut || submitting) return;

    setError('');
    setSubmitting(true);

    const { error: signInError } = await signIn(email.trim(), password);

    setSubmitting(false);

    if (signInError) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      const lockoutSecs = calcLockoutSeconds(nextAttempts);
      if (lockoutSecs > 0) {
        setLockoutRemaining(lockoutSecs);
        setError(
          `Too many failed attempts. Please wait ${lockoutSecs} seconds before trying again.`
        );
      } else {
        // Keep error generic — never reveal whether the email or password is wrong.
        setError('Invalid email or password. Please try again.');
      }
    } else {
      // Successful login — reset counters
      setFailedAttempts(0);
      setLockoutRemaining(0);
    }
  }

  return (
    <div id="login-screen" className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src="/assets/images/eb-logo.png" alt="El Barrilito" className="login-logo" />
        <h1>Admin Login</h1>
        <p className="login-sub">El Barrilito Liquor Store — Management Panel</p>

        <label className="field-label" htmlFor="login-email">Email</label>
        <input
          type="email"
          id="login-email"
          className="login-input"
          placeholder="you@elbarrilito.com"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLockedOut}
        />

        <label className="field-label" htmlFor="login-password">Password</label>
        <input
          type="password"
          id="login-password"
          className="login-input"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLockedOut}
        />

        <button
          type="submit"
          id="login-btn"
          className="login-btn"
          disabled={submitting || isLockedOut}
        >
          {submitting
            ? 'SIGNING IN…'
            : isLockedOut
            ? `LOCKED — WAIT ${lockoutRemaining}s`
            : 'SIGN IN'}
        </button>

        <p id="login-error" className="login-error" aria-live="polite">
          {error}
        </p>
      </form>
    </div>
  );
}
