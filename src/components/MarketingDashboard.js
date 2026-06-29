import React from 'react';
import { useApi } from '../hooks/useApi';
import StatCard from './StatCard';
import Card from './Card';
import BarChart from './BarChart';
import DonutChart from './DonutChart';
import LoadingSpinner from './LoadingSpinner';
import './MarketingDashboard.css';

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

const CHANNEL_COLORS = {
  'Email':        'var(--accent-blue)',
  'Social Media': 'var(--accent-violet)',
  'Paid Search':  'var(--accent-amber)',
  'Organic':      'var(--accent-emerald)',
  'Referral':     'var(--accent-rose)',
};

export default function MarketingDashboard() {
  const { data, loading, error } = useApi('/api/marketing');

  if (loading) return <LoadingSpinner message="Loading marketing data…" />;
  if (error)   return <div className="error-msg">⚠ Failed to load: {error}</div>;

  const spendChart = data.monthlySpend.map(m => ({
    label: m.month,
    value: m.spend,
    color: 'var(--accent-rose)',
  }));

  const revenueChart = data.monthlySpend.map(m => ({
    label: m.month,
    value: m.revenue,
    color: 'var(--accent-emerald)',
  }));

  const channelDonut = data.channelPerformance.map(c => ({
    label: c.channel,
    value: c.revenue,
  }));

  return (
    <div className="marketing">
      {/* KPIs */}
      <section className="marketing-kpis">
        <StatCard label="Total Spend"       value={fmt(data.summary.totalSpend)}    accent="rose"    icon="💸" />
        <StatCard label="Total Revenue"     value={fmt(data.summary.totalRevenue)}  accent="emerald" icon="💰" sub={`ROI: ${data.summary.overallROI}`} />
        <StatCard label="Leads Generated"   value={data.summary.leadsGenerated.toLocaleString()} accent="blue" icon="🎯" />
        <StatCard label="Cost Per Lead"     value={`$${data.summary.costPerLead}`}  accent="amber"   icon="📊" sub={`${data.summary.activeCampaigns} active campaigns`} />
      </section>

      {/* Monthly charts */}
      <section className="marketing-charts">
        <Card title="Monthly Spend" subtitle="Last 5 months ($)">
          <BarChart data={spendChart} unit="$" height={160} />
        </Card>
        <Card title="Monthly Revenue" subtitle="Last 5 months ($)">
          <BarChart data={revenueChart} unit="$" height={160} />
        </Card>
        <Card title="Revenue by Channel" subtitle="All time">
          <DonutChart data={channelDonut} size={160} />
        </Card>
      </section>

      {/* Campaigns table */}
      <Card title="All Campaigns" subtitle="Performance overview">
        <table className="data-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Spend</th>
              <th>Revenue</th>
              <th>ROI</th>
              <th>Leads</th>
            </tr>
          </thead>
          <tbody>
            {data.campaigns.map(c => (
              <tr key={c.id}>
                <td className="td-primary">{c.name}</td>
                <td>
                  <span className="channel-dot" style={{ background: CHANNEL_COLORS[c.channel] || 'var(--accent-blue)' }} />
                  {c.channel}
                </td>
                <td>
                  <span className={`status-badge status-badge--${c.status.toLowerCase()}`}>{c.status}</span>
                </td>
                <td className="td-number">{fmt(c.spend)}</td>
                <td className="td-number">{fmt(c.revenue)}</td>
                <td className="td-positive">{c.roi}</td>
                <td className="td-number">{c.leads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Channel performance */}
      <Card title="Channel Performance" subtitle="Spend vs Revenue">
        <table className="data-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Spend</th>
              <th>Revenue</th>
              <th>ROI</th>
              <th>Leads</th>
            </tr>
          </thead>
          <tbody>
            {data.channelPerformance.map((c, i) => {
              const roi = c.spend > 0
                ? `${(((c.revenue - c.spend) / c.spend) * 100).toFixed(0)}%`
                : '—';
              return (
                <tr key={i}>
                  <td>
                    <span className="channel-dot" style={{ background: CHANNEL_COLORS[c.channel] || 'var(--accent-blue)' }} />
                    <span className="td-primary">{c.channel}</span>
                  </td>
                  <td className="td-number">{fmt(c.spend)}</td>
                  <td className="td-number">{fmt(c.revenue)}</td>
                  <td className="td-positive">{roi}</td>
                  <td className="td-number">{c.leads || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
