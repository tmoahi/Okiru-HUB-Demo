import React, { useState } from 'react';
import OkiruLogo from './OkiruLogo';
import './Login.css';

const DEMO_ACCOUNTS = [
  { email: 'andile@thrivefg.co.za',  password: 'demo',  name: 'Andile Khumalo',  role: 'learner', company: 'Thrive Financial Group', avatar: 'AK' },
  { email: 'nomsa@sanlam-sme.co.za', password: 'demo',  name: 'Nomsa Vilakazi',  role: 'learner', company: 'Sanlam SME Division',    avatar: 'NV' },
  { email: 'sipho@rml.co.za',        password: 'demo',  name: 'Sipho Dlamini',   role: 'learner', company: 'Rand Merchant Holdings', avatar: 'SD' },
  { email: 'admin@okiru.co.za',      password: 'admin', name: 'Okiru Admin',     role: 'admin',   company: 'Okiru',                  avatar: 'OK' },
];

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
      // fallback: match locally for offline dev
      const user = DEMO_ACCOUNTS.find(u => u.email === emailVal && u.password === passwordVal);
      if (user) { const { password: _pw, ...safe } = user; onLogin(safe); }
      else { setError('Invalid email or password.'); }
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); attempt(email, password); };
  const quickLogin   = (acc) => { setEmail(acc.email); setPassword(acc.password); attempt(acc.email, acc.password); };

  return (
    <div className="login-screen">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-brand">
          <OkiruLogo size={48} />
          <div>
            <h1 className="login-title">Okiru LMS</h1>
            <p className="login-sub">Learning Management System</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.co.za" autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </label>
          {error && <p className="login-error">{error}</p>}
          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-demo">
          <p className="login-demo-label">Demo accounts — click to sign in</p>
          <div className="login-demo-grid">
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.email} className="demo-account" onClick={() => quickLogin(acc)}>
                <span className="demo-avatar" style={{ background: acc.role === 'admin' ? 'var(--okiru-gradient)' : 'var(--bg-elevated)' }}>{acc.avatar}</span>
                <span className="demo-info">
                  <span className="demo-name">{acc.name}</span>
                  <span className="demo-company">{acc.company}</span>
                </span>
                <span className={`demo-role demo-role--${acc.role}`}>{acc.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
