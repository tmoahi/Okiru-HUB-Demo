import React, { useState, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import StatCard from './StatCard';
import Card from './Card';
import BarChart from './BarChart';
import DonutChart from './DonutChart';
import LoadingSpinner from './LoadingSpinner';
import './AnalyticsDashboard.css';

const PLATFORM_COLORS = { 'LinkedIn': '#0A66C2', 'Facebook': '#1877F2', 'Instagram': '#E1306C', 'Twitter/X': '#e2e8f0' };
const SOURCE_COLORS = { 'LinkedIn': 'var(--accent-blue)', 'Organic': 'var(--accent-emerald)', 'Email': 'var(--accent-violet)', 'Referral': 'var(--accent-amber)', 'Social Media': 'var(--accent-rose)', 'Direct': 'var(--accent-teal)' };
const STATUS_CONFIG = {
  'New':       { bg: 'rgba(96,165,250,0.12)',  color: 'var(--accent-blue)'    },
  'Contacted': { bg: 'rgba(255,117,18,0.12)',  color: 'var(--accent-amber)'   },
  'Qualified': { bg: 'rgba(186,13,167,0.12)',  color: 'var(--accent-violet)'  },
  'Converted': { bg: 'rgba(16,232,160,0.12)',  color: 'var(--accent-emerald)' },
  'Lost':      { bg: 'rgba(251,113,133,0.12)', color: 'var(--accent-rose)'    },
};

function OverviewTab({ data }) {
  const weeklyChart  = data.weeklyVisitors.map(d => ({ label: d.day, value: d.visitors, color: 'var(--accent-violet)' }));
  const trafficDonut = data.trafficSources.map(s => ({ label: s.source, value: s.visitors }));
  const conversionData = [
    { label: 'Consultations',     value: data.conversions.consultationRequests },
    { label: 'Training Sign-ups', value: data.conversions.trainingSignups      },
    { label: 'Report Downloads',  value: data.conversions.reportDownloads      },
    { label: 'Demo Requests',     value: data.conversions.demoRequests         },
  ];
  return (
    <>
      <section className="analytics-charts">
        <Card title="Weekly Visitors" subtitle="Last 7 days"><BarChart data={weeklyChart} height={180} /></Card>
        <Card title="Traffic Sources" subtitle="Visitor breakdown"><DonutChart data={trafficDonut} size={160} /></Card>
      </section>
      <section className="analytics-bottom">
        <Card title="Conversion Breakdown" subtitle="By type"><DonutChart data={conversionData} size={150} /></Card>
        <Card title="Top Pages" subtitle="By page views">
          <table className="data-table">
            <thead><tr><th>Page</th><th>Views</th><th>Avg Time</th><th>Bounce</th></tr></thead>
            <tbody>{data.topPages.map((p, i) => (
              <tr key={i}><td className="td-primary td-mono">{p.page}</td><td className="td-number">{p.views.toLocaleString()}</td><td>{p.avgTime}</td><td className="td-muted">{p.bounceRate}</td></tr>
            ))}</tbody>
          </table>
        </Card>
      </section>
      <Card title="Traffic Source Detail" subtitle="Full breakdown">
        <table className="data-table">
          <thead><tr><th>Source</th><th>Visitors</th><th>Share</th></tr></thead>
          <tbody>{data.trafficSources.map((s, i) => (
            <tr key={i}>
              <td className="td-primary">{s.source}</td>
              <td className="td-number">{s.visitors.toLocaleString()}</td>
              <td><div className="progress-bar"><div className="progress-fill" style={{ width: `${s.percentage}%` }} /></div><span className="td-muted">{s.percentage}%</span></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </>
  );
}

function SocialMediaTab({ sm }) {
  const impressionsChart = sm.monthlyImpressions.map(m => ({ label: m.month, value: m.linkedin + m.facebook + m.instagram, color: 'var(--accent-blue)' }));
  return (
    <>
      <section className="social-platform-grid">
        {sm.platforms.map(p => (
          <div key={p.platform} className="platform-card">
            <div className="platform-card-header">
              <span className="platform-badge" style={{ background: p.color }}>{p.icon}</span>
              <span className="platform-name">{p.platform}</span>
              <span className="platform-growth">{p.growth} this month</span>
            </div>
            <div className="platform-metrics">
              <div className="pm-item"><span className="pm-value">{p.followers.toLocaleString()}</span><span className="pm-label">Followers</span></div>
              <div className="pm-item"><span className="pm-value">{p.impressions.toLocaleString()}</span><span className="pm-label">Impressions</span></div>
              <div className="pm-item"><span className="pm-value">{p.engagementRate}</span><span className="pm-label">Engagement</span></div>
              <div className="pm-item"><span className="pm-value">{p.clicks.toLocaleString()}</span><span className="pm-label">Clicks</span></div>
            </div>
            <div className="platform-footer">{p.posts} posts this month</div>
          </div>
        ))}
      </section>
      <Card title="Total Monthly Impressions" subtitle="Across all platforms">
        <BarChart data={impressionsChart} height={160} />
      </Card>
      <Card title="Monthly Impression Breakdown" subtitle="By platform">
        <table className="data-table">
          <thead><tr><th>Month</th><th><span className="platform-dot" style={{ background: PLATFORM_COLORS['LinkedIn'] }} />LinkedIn</th><th><span className="platform-dot" style={{ background: PLATFORM_COLORS['Facebook'] }} />Facebook</th><th><span className="platform-dot" style={{ background: PLATFORM_COLORS['Instagram'] }} />Instagram</th><th>Total</th></tr></thead>
          <tbody>{sm.monthlyImpressions.map((m, i) => (
            <tr key={i}><td className="td-primary">{m.month}</td><td className="td-number">{m.linkedin.toLocaleString()}</td><td className="td-number">{m.facebook.toLocaleString()}</td><td className="td-number">{m.instagram.toLocaleString()}</td><td className="td-number td-positive">{(m.linkedin + m.facebook + m.instagram).toLocaleString()}</td></tr>
          ))}</tbody>
        </table>
      </Card>
      <Card title="Top Performing Posts" subtitle="Ranked by impressions">
        <div className="top-posts-list">
          {sm.topPosts.map((p, i) => (
            <div key={i} className="top-post-row">
              <span className="top-post-rank">#{i + 1}</span>
              <span className="platform-badge platform-badge--sm" style={{ background: PLATFORM_COLORS[p.platform] }}>
                {p.platform === 'LinkedIn' ? 'in' : p.platform === 'Facebook' ? 'f' : p.platform === 'Instagram' ? 'ig' : 'X'}
              </span>
              <p className="top-post-content">{p.content}</p>
              <div className="top-post-stats"><span>{p.impressions.toLocaleString()} imp.</span><span className="td-positive">{p.engagementRate}</span><span>{p.clicks} clicks</span></div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function LeadTrackerTab({ leads }) {
  const [filterSource,  setFilterSource]  = useState('All');
  const [filterStatus,  setFilterStatus]  = useState('All');
  const [filterService, setFilterService] = useState('All');
  const [search, setSearch] = useState('');

  const sources  = ['All', ...new Set(leads.map(l => l.source))];
  const statuses = ['All', ...Object.keys(STATUS_CONFIG)];
  const services = ['All', ...new Set(leads.map(l => l.service))];

  const filtered = useMemo(() => leads.filter(l => {
    if (filterSource  !== 'All' && l.source  !== filterSource)  return false;
    if (filterStatus  !== 'All' && l.status  !== filterStatus)  return false;
    if (filterService !== 'All' && l.service !== filterService) return false;
    if (search && ![l.name, l.company, l.campaign].join(' ').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [leads, filterSource, filterStatus, filterService, search]);

  const sourceCounts = useMemo(() => {
    const c = {}; leads.forEach(l => { c[l.source] = (c[l.source] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  const statusCounts = useMemo(() => {
    const c = {}; leads.forEach(l => { c[l.status] = (c[l.status] || 0) + 1; }); return c;
  }, [leads]);

  const maxSourceCount = sourceCounts[0]?.[1] || 1;

  return (
    <>
      <div className="lead-summary-row">
        <div className="lead-summary-card"><span className="ls-value">{leads.length}</span><span className="ls-label">Total Leads</span></div>
        {Object.entries(statusCounts).map(([status, count]) => {
          const cfg = STATUS_CONFIG[status] || {};
          return <div key={status} className="lead-summary-card" style={{ borderColor: cfg.color + '33' }}><span className="ls-value" style={{ color: cfg.color }}>{count}</span><span className="ls-label">{status}</span></div>;
        })}
      </div>
      <Card title="Lead Source Breakdown" subtitle="Where your leads are coming from">
        <div className="source-funnel">
          {sourceCounts.map(([source, count]) => (
            <div key={source} className="funnel-row">
              <span className="funnel-source"><span className="source-dot" style={{ background: SOURCE_COLORS[source] || 'var(--text-muted)' }} />{source}</span>
              <div className="funnel-bar-wrap"><div className="funnel-bar" style={{ width: `${(count / maxSourceCount) * 100}%`, background: SOURCE_COLORS[source] || 'var(--text-muted)' }} /></div>
              <span className="funnel-count">{count}</span>
              <span className="funnel-pct">{((count / leads.length) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="All Leads" subtitle={`${filtered.length} of ${leads.length} shown`}>
        <div className="lead-filters">
          <input type="search" placeholder="Search name, company, campaign…" value={search} onChange={e => setSearch(e.target.value)} className="lead-search" />
          <select value={filterSource}  onChange={e => setFilterSource(e.target.value)}>{sources.map(s  => <option key={s}>{s}</option>)}</select>
          <select value={filterStatus}  onChange={e => setFilterStatus(e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select>
          <select value={filterService} onChange={e => setFilterService(e.target.value)}>{services.map(s => <option key={s}>{s}</option>)}</select>
          {(filterSource !== 'All' || filterStatus !== 'All' || filterService !== 'All' || search) && (
            <button className="btn btn-ghost lead-clear" onClick={() => { setFilterSource('All'); setFilterStatus('All'); setFilterService('All'); setSearch(''); }}>Clear</button>
          )}
        </div>
        {filtered.length === 0 ? <p className="no-results">No leads match the current filters.</p> : (
          <table className="data-table">
            <thead><tr><th>#</th><th>Name</th><th>Company</th><th>Service</th><th>Source</th><th>Campaign</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map(lead => {
                const sc = STATUS_CONFIG[lead.status] || {};
                return (
                  <tr key={lead.id}>
                    <td className="td-muted">{lead.id}</td>
                    <td className="td-primary">{lead.name}</td>
                    <td>{lead.company}</td>
                    <td><span className="service-tag">{lead.service}</span></td>
                    <td><span className="source-pill" style={{ color: SOURCE_COLORS[lead.source] || 'var(--text-secondary)', background: (SOURCE_COLORS[lead.source] || 'var(--text-secondary)') + '18' }}><span className="source-dot-sm" style={{ background: SOURCE_COLORS[lead.source] || 'var(--text-muted)' }} />{lead.source}</span></td>
                    <td className="td-muted">{lead.campaign}</td>
                    <td><span className="status-pill" style={{ background: sc.bg, color: sc.color }}>{lead.status}</span></td>
                    <td className="td-muted">{lead.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}

export default function AnalyticsDashboard() {
  const { data, loading, error } = useApi('/api/analytics');
  const [activeTab, setActiveTab] = useState('overview');
  if (loading) return <LoadingSpinner message="Loading analytics…" />;
  if (error)   return <div className="error-msg">⚠ Failed to load: {error}</div>;
  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'social',   label: 'Social Media' },
    { id: 'leads',    label: 'Lead Tracker', badge: data.leads.length },
  ];
  return (
    <div className="analytics">
      <section className="analytics-kpis">
        <StatCard label="Total Visitors"  value={data.summary.totalVisitors.toLocaleString()}  accent="violet"  icon="👁"  />
        <StatCard label="Unique Visitors" value={data.summary.uniqueVisitors.toLocaleString()} accent="blue"    icon="🧑"  sub="Distinct sessions" />
        <StatCard label="Conversion Rate" value={data.summary.conversionRate}                  accent="emerald" icon="🎯"  />
        <StatCard label="Bounce Rate"     value={data.summary.bounceRate}                       accent="amber"   icon="↩"  sub={`Avg session ${data.summary.avgSessionDuration}`} />
      </section>
      <div className="analytics-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`analytics-tab ${activeTab === t.id ? 'analytics-tab--active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
            {t.badge != null && <span className="analytics-tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>
      {activeTab === 'overview' && <OverviewTab data={data} />}
      {activeTab === 'social'   && <SocialMediaTab sm={data.socialMedia} />}
      {activeTab === 'leads'    && <LeadTrackerTab leads={data.leads} />}
    </div>
  );
}
