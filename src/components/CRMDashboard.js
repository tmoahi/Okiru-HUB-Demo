import React from 'react';
import { useApi } from '../hooks/useApi';
import StatCard from './StatCard';
import Card from './Card';
import BarChart from './BarChart';
import LoadingSpinner from './LoadingSpinner';
import './CRMDashboard.css';

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

const STAGE_COLORS = {
  'Prospecting':   'var(--accent-blue)',
  'Qualification': 'var(--accent-violet)',
  'Proposal':      'var(--accent-amber)',
  'Negotiation':   'var(--accent-rose)',
  'Closed Won':    'var(--accent-emerald)',
};

export default function CRMDashboard() {
  const { data, loading, error } = useApi('/api/crm');

  if (loading) return <LoadingSpinner message="Loading CRM data…" />;
  if (error)   return <div className="error-msg">⚠ Failed to load: {error}</div>;

  const pipelineChart = data.pipeline.map(p => ({
    label: p.stage.split(' ')[0],
    value: p.value,
    color: STAGE_COLORS[p.stage],
  }));

  const dealsChart = data.pipeline.map(p => ({
    label: p.stage.split(' ')[0],
    value: p.deals,
    color: STAGE_COLORS[p.stage],
  }));

  return (
    <div className="crm">
      {/* KPIs */}
      <section className="crm-kpis">
        <StatCard label="Total Revenue"  value={fmt(data.summary.totalRevenue)}  accent="emerald" icon="💰" />
        <StatCard label="Open Deals"     value={data.summary.openDeals}          accent="blue"    icon="🤝" sub={`Avg ${fmt(data.summary.avgDealSize)}`} />
        <StatCard label="Won Deals"      value={data.summary.wonDeals}           accent="violet"  icon="🏆" />
        <StatCard label="Lost Deals"     value={data.summary.lostDeals}          accent="rose"    icon="❌" />
      </section>

      {/* Pipeline charts */}
      <section className="crm-charts">
        <Card title="Pipeline Value" subtitle="Revenue by stage ($)">
          <BarChart data={pipelineChart} unit="$" height={180} />
        </Card>
        <Card title="Deal Count" subtitle="Open deals per stage">
          <BarChart data={dealsChart} height={180} />
        </Card>
      </section>

      {/* Pipeline table */}
      <Card title="Pipeline Breakdown" subtitle="All stages">
        <table className="data-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Deals</th>
              <th>Total Value</th>
              <th>Avg Value</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {data.pipeline.map((p, i) => {
              const totalPipelineValue = data.pipeline.reduce((s, x) => s + x.value, 0);
              const share = ((p.value / totalPipelineValue) * 100).toFixed(1);
              return (
                <tr key={i}>
                  <td>
                    <span className="stage-dot" style={{ background: STAGE_COLORS[p.stage] }} />
                    {p.stage}
                  </td>
                  <td className="td-number">{p.deals}</td>
                  <td className="td-number">{fmt(p.value)}</td>
                  <td className="td-number">{fmt(Math.round(p.value / p.deals))}</td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${share}%`, background: STAGE_COLORS[p.stage] }} />
                    </div>
                    <span className="td-muted">{share}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Recent deals */}
      <Card title="All Recent Deals" subtitle="Latest opportunities">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Value</th>
              <th>Stage</th>
              <th>Days Open</th>
            </tr>
          </thead>
          <tbody>
            {data.recentDeals.map(deal => (
              <tr key={deal.id}>
                <td className="td-muted">{deal.id}</td>
                <td className="td-primary">{deal.company}</td>
                <td>{deal.contact}</td>
                <td className="td-number">{fmt(deal.value)}</td>
                <td>
                  <span className={`badge badge--${deal.stage.toLowerCase().replace(/\s+/g, '-')}`}>
                    {deal.stage}
                  </span>
                </td>
                <td className="td-muted">{deal.daysOpen}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Top contacts */}
      <Card title="Top Contacts" subtitle="By total deal value">
        <div className="contact-grid">
          {data.topContacts.map((c, i) => (
            <div key={i} className="contact-card">
              <div className="contact-avatar">{c.name.split(' ').map(w => w[0]).join('')}</div>
              <div className="contact-info">
                <p className="contact-name">{c.name}</p>
                <p className="contact-company">{c.company}</p>
              </div>
              <div className="contact-stats">
                <p className="contact-value">{fmt(c.totalValue)}</p>
                <p className="contact-deals">{c.deals} deals</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
