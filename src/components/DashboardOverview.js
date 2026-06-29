import React from 'react';
import { useApi } from '../hooks/useApi';
import StatCard from './StatCard';
import Card from './Card';
import BarChart from './BarChart';
import LoadingSpinner from './LoadingSpinner';
import './DashboardOverview.css';

function fmt(n) {
  if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `R${(n / 1_000).toFixed(0)}k`;
  return `R${n}`;
}

const STAGE_COLORS = {
  'Discovery':     'var(--accent-blue)',
  'Scoping':       'var(--accent-violet)',
  'Proposal Sent': 'var(--accent-amber)',
  'Contract':      'var(--accent-teal)',
  'Delivery':      'var(--accent-emerald)',
};

export default function DashboardOverview() {
  const { data, loading, error } = useApi('/api/dashboard');

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;
  if (error)   return <div className="error-msg">⚠ Failed to load: {error}</div>;

  const { crm, analytics, marketing } = data;

  const pipelineChartData = crm.pipeline.map(p => ({
    label: p.stage.split(' ')[0],
    value: p.value,
    color: STAGE_COLORS[p.stage] || 'var(--accent-blue)',
  }));

  const trafficChartData = analytics.trafficSources.map(s => ({
    label: s.source.split(' ')[0],
    value: s.visitors,
  }));

  return (
    <div className="overview">
      <section className="overview-kpis">
        <StatCard
          label="Total Revenue"
          value={fmt(crm.summary.totalRevenue)}
          sub={`${crm.summary.wonDeals} engagements won`}
          accent="emerald"
          icon="💰"
        />
        <StatCard
          label="Active Engagements"
          value={crm.summary.openDeals}
          sub={`Avg size ${fmt(crm.summary.avgDealSize)}`}
          accent="blue"
          icon="🤝"
        />
        <StatCard
          label="Site Visitors"
          value={analytics.summary.totalVisitors.toLocaleString()}
          sub={`${analytics.summary.conversionRate} conversion rate`}
          accent="violet"
          icon="👁"
        />
        <StatCard
          label="Marketing ROI"
          value={marketing.summary.overallROI}
          sub={`${marketing.summary.activeCampaigns} active campaigns`}
          accent="amber"
          icon="📈"
        />
      </section>

      <section className="overview-charts">
        <Card title="Engagement Pipeline" subtitle="Value by stage (R)">
          <BarChart data={pipelineChartData} unit="R" height={160} />
        </Card>
        <Card title="Traffic Sources" subtitle="Visitors this period">
          <BarChart data={trafficChartData} height={160} />
        </Card>
      </section>

      <section className="overview-tables">
        <Card title="Recent Engagements" subtitle="Latest activity">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Service</th>
                <th>Value</th>
                <th>Stage</th>
                <th>Days</th>
              </tr>
            </thead>
            <tbody>
              {crm.recentDeals.map(deal => (
                <tr key={deal.id}>
                  <td className="td-primary">{deal.company}</td>
                  <td><span className="service-tag">{deal.service}</span></td>
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

        <Card title="Active Campaigns" subtitle="Top performers">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Channel</th>
                <th>Spend</th>
                <th>ROI</th>
                <th>Leads</th>
              </tr>
            </thead>
            <tbody>
              {marketing.campaigns.map(c => (
                <tr key={c.id}>
                  <td className="td-primary">{c.name}</td>
                  <td>{c.channel}</td>
                  <td className="td-number">{fmt(c.spend)}</td>
                  <td className="td-positive">{c.roi}</td>
                  <td className="td-number">{c.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
