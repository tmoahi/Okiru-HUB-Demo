import React, { useEffect, useState } from 'react';
import StatCard from './StatCard';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import './AdminDashboard.css';

const CAT_COLOR = { 'B-BBEE': '#06CDE1', 'ESG': '#10e8a0', 'AI': '#BA0DA7', 'Compliance': '#FF7512' };

export default function AdminDashboard({ navigateTo }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(j => { setStats(j.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !stats) return <LoadingSpinner message="Loading admin stats…" />;

  const maxEnrolled = Math.max(...stats.courseStats.map(c => c.enrolled), 1);

  return (
    <div className="admin">
      <div className="admin-welcome">
        <h2 className="admin-title">Admin Dashboard</h2>
        <button className="btn btn-primary" onClick={() => navigateTo('catalogue')}>View All Courses</button>
      </div>

      <section className="admin-kpis">
        <StatCard label="Total Learners"       value={stats.totalLearners.toLocaleString()} accent="blue"    icon="👥" />
        <StatCard label="Active Courses"        value={stats.activeCourses}                  accent="violet"  icon="📚" />
        <StatCard label="Avg Completion Rate"   value={stats.completionRate}                 accent="emerald" icon="✅" />
        <StatCard label="Certificates Issued"   value={stats.certificatesIssued}             accent="amber"   icon="🏆" />
        <StatCard label="Enrolments This Month" value={stats.enrollmentsThisMonth}           accent="rose"    icon="📈" />
        <StatCard label="Avg Course Rating"     value={stats.avgRating}                      accent="blue"    icon="⭐" />
      </section>

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
                  <td><span className="admin-cat" style={{ color, background: color+'12', borderColor: color+'30' }}>{c.category}</span></td>
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

      <Card title="Recent Learners" subtitle="Latest enrolment activity">
        <table className="data-table admin-table">
          <thead>
            <tr><th>Name</th><th>Company</th><th>Enrolled</th><th>Completed</th><th>Progress</th><th>Last Active</th></tr>
          </thead>
          <tbody>
            {stats.recentLearners.map((l, i) => {
              const pct = l.enrolled > 0 ? Math.round(l.completed / l.enrolled * 100) : 0;
              return (
                <tr key={i}>
                  <td>
                    <div className="admin-learner-row">
                      <div className="admin-avatar">{l.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                      <span className="td-primary">{l.name}</span>
                    </div>
                  </td>
                  <td className="td-muted">{l.company}</td>
                  <td className="td-number">{l.enrolled}</td>
                  <td className="td-number">{l.completed}</td>
                  <td>
                    <div className="admin-prog-row">
                      <div className="admin-prog-bar"><div className="admin-prog-fill" style={{ width: `${pct}%`, background: 'var(--accent-emerald)' }} /></div>
                      <span className="td-muted">{pct}%</span>
                    </div>
                  </td>
                  <td className="td-muted">{l.lastActive}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
