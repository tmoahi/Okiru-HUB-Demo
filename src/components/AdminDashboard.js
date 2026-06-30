import React, { useEffect, useState, useCallback } from 'react';
import StatCard from './StatCard';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import './AdminDashboard.css';

const CAT_COLOR = {
  'B-BBEE': '#06CDE1', 'ESG': '#10e8a0', 'AI': '#BA0DA7', 'Compliance': '#FF7512',
  'AI Tools': '#06CDE1', 'AI & Compliance': '#10e8a0',
};

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSuccess }) {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [result,  setResult]  = useState(null);
  const [copied,  setCopied]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error || 'Something went wrong.'); setLoading(false); return; }
      setResult(json.data);
      onSuccess();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const credText = result
    ? `Okiru Training — Login Credentials\n\nName: ${result.name}\nEmail: ${result.email}\nPassword: ${result.tempPassword}\n\nLogin at: https://okiru-hub-demo-production-eb58.up.railway.app\n\nThis is a temporary password.`
    : '';

  const copy = () => {
    navigator.clipboard.writeText(credText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">Invite Learner</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!result ? (
          <form onSubmit={submit} className="invite-form">
            <p className="modal-sub">A temporary password will be generated. Share the credentials with the learner so they can sign in immediately.</p>
            <label>
              Full name <span className="req">*</span>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required />
            </label>
            <label>
              Email address <span className="req">*</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.co.za" required />
            </label>
            <label>
              Company / Organisation
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp" />
            </label>
            {error && <p className="invite-error">{error}</p>}
            <div className="invite-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !name || !email}>
                {loading ? 'Creating account…' : 'Create account →'}
              </button>
            </div>
          </form>
        ) : (
          <div className="invite-success">
            <div className="invite-success-icon">✅</div>
            <h4 className="invite-success-title">Account created for {result.name}</h4>
            <p className="modal-sub">Share these credentials. The learner can log in immediately.</p>
            <div className="credential-box">
              <div className="credential-row">
                <span className="cred-label">Email</span>
                <span className="cred-value">{result.email}</span>
              </div>
              <div className="credential-row">
                <span className="cred-label">Password</span>
                <span className="cred-value cred-password">{result.tempPassword}</span>
              </div>
              <div className="credential-row">
                <span className="cred-label">Login URL</span>
                <span className="cred-value cred-url">okiru-hub-demo-production-eb58.up.railway.app</span>
              </div>
            </div>
            <div className="invite-actions">
              <button className="btn btn-ghost" onClick={copy}>{copied ? '✓ Copied!' : 'Copy credentials'}</button>
              <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDelete({ learner, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Remove learner?</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <p className="modal-sub" style={{ padding: '16px 24px 0' }}>
          This will permanently remove <strong>{learner.name}</strong> ({learner.email}) from the LMS.
        </p>
        <div className="invite-actions" style={{ padding: '20px 24px 24px' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Remove</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard({ navigateTo }) {
  const [stats,        setStats]        = useState(null);
  const [learners,     setLearners]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showInvite,   setShowInvite]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = useCallback(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/learners').then(r => r.json()),
    ]).then(([sRes, lRes]) => {
      if (sRes.success) setStats(sRes.data);
      if (lRes.success) setLearners(lRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/admin/learners/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    refresh();
  };

  if (loading || !stats) return <LoadingSpinner message="Loading admin dashboard…" />;

  const maxEnrolled = Math.max(...stats.courseStats.map(c => c.enrolled), 1);

  return (
    <div className="admin">
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => { setShowInvite(false); refresh(); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDelete
          learner={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      <div className="admin-welcome">
        <h2 className="admin-title">Admin Dashboard</h2>
        <div className="admin-actions">
          <button className="btn btn-ghost" onClick={() => navigateTo('catalogue')}>View All Courses</button>
          <button className="btn btn-primary" onClick={() => setShowInvite(true)}>+ Invite Learner</button>
        </div>
      </div>

      <section className="admin-kpis">
        <StatCard label="Total Learners"       value={stats.totalLearners.toLocaleString()} accent="blue"    icon="👥" />
        <StatCard label="Active Courses"        value={stats.activeCourses}                  accent="violet"  icon="📚" />
        <StatCard label="Avg Completion Rate"   value={stats.completionRate}                 accent="emerald" icon="✅" />
        <StatCard label="Certificates Issued"   value={stats.certificatesIssued}             accent="amber"   icon="🏆" />
        <StatCard label="Enrolments This Month" value={stats.enrollmentsThisMonth}           accent="rose"    icon="📈" />
        <StatCard label="Avg Course Rating"     value={stats.avgRating}                      accent="blue"    icon="⭐" />
      </section>

      <Card
        title="Learners"
        subtitle={learners.length > 0
          ? `${learners.length} account${learners.length !== 1 ? 's' : ''} — click + Invite Learner to add more`
          : 'No learners yet — invite someone to get started'}
      >
        {learners.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p className="empty-text">No learners have been invited yet.</p>
            <button className="btn btn-primary" onClick={() => setShowInvite(true)}>+ Invite your first learner</button>
          </div>
        ) : (
          <table className="data-table admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Company</th><th>Status</th><th>Invited</th><th></th></tr>
            </thead>
            <tbody>
              {learners.map(l => (
                <tr key={l.id}>
                  <td>
                    <div className="admin-learner-row">
                      <div className="admin-avatar">{l.avatar}</div>
                      <span className="td-primary">{l.name}</span>
                    </div>
                  </td>
                  <td className="td-muted">{l.email}</td>
                  <td className="td-muted">{l.company || '—'}</td>
                  <td><span className="status-badge status-invited">Invited</span></td>
                  <td className="td-muted">
                    {l.invitedAt
                      ? new Date(l.invitedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td>
                    <button className="btn-icon-danger" title="Remove learner" onClick={() => setDeleteTarget(l)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Course Performance" subtitle="Enrolments, completions, and ratings">
        <table className="data-table admin-table">
          <thead>
            <tr><th>Course</th><th>Category</th><th>Enrolled</th><th>Completed</th><th>Completion %</th><th>Rating</th><th>Enrolment Share</th></tr>
          </thead>
          <tbody>
            {stats.courseStats.map(c => {
              const color = CAT_COLOR[c.category] || 'var(--accent-teal)';
              return (
                <tr key={c.id}>
                  <td className="td-primary">{c.title}</td>
                  <td><span className="admin-cat" style={{ color, background: color + '12', borderColor: color + '30' }}>{c.category}</span></td>
                  <td className="td-number">{c.enrolled.toLocaleString()}</td>
                  <td className="td-number">{c.completed.toLocaleString()}</td>
                  <td>
                    <div className="admin-prog-row">
                      <div className="admin-prog-bar"><div className="admin-prog-fill" style={{ width: `${c.completionRate}%`, background: color }} /></div>
                      <span className="td-muted">{c.completionRate}%</span>
                    </div>
                  </td>
                  <td className="td-number">⭐ {c.rating}</td>
                  <td>
                    <div className="admin-prog-row">
                      <div className="admin-prog-bar"><div className="admin-prog-fill" style={{ width: `${(c.enrolled / maxEnrolled) * 100}%`, background: 'var(--accent-teal)' }} /></div>
                      <span className="td-muted">{c.enrolled}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
