import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { error } = await signIn(email.trim(), password);

    setSubmitting(false);

    if (error) {
      setError('Invalid email or password.');
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
        />

        <button type="submit" id="login-btn" className="login-btn" disabled={submitting}>
          {submitting ? 'SIGNING IN…' : 'SIGN IN'}
        </button>
        <p id="login-error" className="login-error" aria-live="polite">{error}</p>
      </form>
    </div>
  );
}
