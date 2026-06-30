import React, { useState } from 'react';
import OkiruLogo from './OkiruLogo';
import './Login.css';

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const attempt = async (emailVal, passwordVal) => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailVal, password: passwordVal }) });
      const json = await res.json();
      if (!json.success) { setError('Invalid email or password.'); setLoading(false); return; }
      onLogin(json.data);
    } catch {
      setError('Unable to connect. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); attempt(email, password); };

  return (
    <div className="login-screen">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-brand">
          <OkiruLogo size={52} />
          <div>
            <h1 className="login-title">Okiru Training</h1>
            <p className="login-sub">Professional Learning Portal</p>
          </div>
        </div>

        <p className="login-tagline">
          Built for professionals who believe growth is a responsibility, not a luxury.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.co.za"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <button className="btn btn-primary login-btn" type="submit" disabled={loading || !email || !password}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="login-footer">
          Need access? Contact your Okiru Training administrator.
        </p>
      </div>
    </div>
  );
}
