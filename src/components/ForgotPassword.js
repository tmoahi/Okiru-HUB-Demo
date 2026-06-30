import React, { useState } from 'react';
import OkiruLogo from './OkiruLogo';
import './Login.css';

export default function ForgotPassword({ onBack }) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) { setSent(true); }
      else { setError(json.error || 'Something went wrong.'); }
    } catch {
      setError('Unable to connect. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-brand">
          <OkiruLogo size={52} />
          <div>
            <h1 className="login-title">Okiru Learn</h1>
            <p className="login-sub">Password Reset</p>
          </div>
        </div>

        {!sent ? (
          <>
            <p className="login-tagline">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form className="login-form" onSubmit={handleSubmit}>
              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.co.za"
                  required
                />
              </label>
              {error && <p className="login-error">{error}</p>}
              <button className="btn btn-primary login-btn" type="submit" disabled={loading || !email}>
                {loading ? 'Sending…' : 'Send reset link →'}
              </button>
            </form>
          </>
        ) : (
          <div className="reset-sent">
            <div className="reset-sent-icon">📧</div>
            <h3 className="reset-sent-title">Check your inbox</h3>
            <p className="reset-sent-text">
              If an account exists for <strong>{email}</strong>, we've sent a password reset link. It expires in 1 hour.
            </p>
          </div>
        )}

        <p className="login-footer">
          <button className="link-btn" onClick={onBack}>← Back to sign in</button>
        </p>
      </div>
    </div>
  );
}
