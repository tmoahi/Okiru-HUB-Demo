import React, { useState } from 'react';
import OkiruLogo from './OkiruLogo';
import './Login.css';

export default function ResetPassword({ token, onSuccess }) {
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (json.success) { setDone(true); }
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
            <p className="login-sub">Set New Password</p>
          </div>
        </div>

        {!done ? (
          <>
            <p className="login-tagline">Choose a strong new password for your account.</p>
            <form className="login-form" onSubmit={handleSubmit}>
              <label>
                New password
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                />
              </label>
              {error && <p className="login-error">{error}</p>}
              <button className="btn btn-primary login-btn" type="submit" disabled={loading || !password || !confirm}>
                {loading ? 'Saving…' : 'Set new password →'}
              </button>
            </form>
          </>
        ) : (
          <div className="reset-sent">
            <div className="reset-sent-icon">✅</div>
            <h3 className="reset-sent-title">Password updated!</h3>
            <p className="reset-sent-text">Your password has been changed. You can now sign in with your new password.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onSuccess}>
              Sign in →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
