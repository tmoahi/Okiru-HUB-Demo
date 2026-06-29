import React from 'react';
import { useApi } from '../hooks/useApi';
import StatCard from './StatCard';
import Card from './Card';
import BarChart from './BarChart';
import DonutChart from './DonutChart';
import LoadingSpinner from './LoadingSpinner';
import './AnalyticsDashboard.css';

export default function AnalyticsDashboard() {
  const { data, loading, error } = useApi('/api/analytics');

  if (loading) return <LoadingSpinner message="Loading analytics…" />;
  if (error)   return <div className="error-msg">⚠ Failed to load: {error}</div>;

  const weeklyChart = data.weeklyVisitors.map(d => ({
    label: d.day,
    value: d.visitors,
    color: 'var(--accent-violet)',
  }));

  const trafficDonut = data.trafficSources.map(s => ({
    label: s.source,
    value: s.visitors,
  }));

  const conversionData = [
    { label: 'Consultations',    value: data.conversions.consultationRequests },
    { label: 'Training Sign-ups',value: data.conversions.trainingSignups      },
    { label: 'Report Downloads', value: data.conversions.reportDownloads      },
    { label: 'Demo Requests',    value: data.conversions.demoRequests         },
  ];

  return (
    <div className="analytics">
      {/* KPIs */}
      <section className="analytics-kpis">
        <StatCard label="Total Visitors"   value={data.summary.totalVisitors.toLocaleString()}  accent="violet"  icon="👁"  />
        <StatCard label="Unique Visitors"  value={data.summary.uniqueVisitors.toLocaleString()} accent="blue"    icon="🧑"  sub="Distinct sessions" />
        <StatCard label="Conversion Rate"  value={data.summary.conversionRate}                  accent="emerald" icon="🎯"  />
        <StatCard label="Bounce Rate"      value={data.summary.bounceRate}                       accent="amber"   icon="↩"  sub={`Avg session ${data.summary.avgSessionDuration}`} />
      </section>

      {/* Charts row */}
      <section className="analytics-charts">
        <Card title="Weekly Visitors" subtitle="Last 7 days" className="analytics-chart-wide">
          <BarChart data={weeklyChart} height={180} />
        </Card>
        <Card title="Traffic Sources" subtitle="Visitor breakdown">
          <DonutChart data={trafficDonut} size={160} />
        </Card>
      </section>

      {/* Conversions */}
      <section className="analytics-bottom">
        <Card title="Conversion Breakdown" subtitle="By type">
          <DonutChart data={conversionData} size={150} />
        </Card>

        <Card title="Top Pages" subtitle="By page views">
          <table className="data-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Views</th>
                <th>Avg Time</th>
                <th>Bounce</th>
              </tr>
            </thead>
            <tbody>
              {data.topPages.map((p, i) => (
                <tr key={i}>
                  <td className="td-primary td-mono">{p.page}</td>
                  <td className="td-number">{p.views.toLocaleString()}</td>
                  <td>{p.avgTime}</td>
                  <td className="td-muted">{p.bounceRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Traffic sources table */}
      <Card title="Traffic Source Detail" subtitle="Full breakdown">
        <table className="data-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Visitors</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {data.trafficSources.map((s, i) => (
              <tr key={i}>
                <td className="td-primary">{s.source}</td>
                <td className="td-number">{s.visitors.toLocaleString()}</td>
                <td>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${s.percentage}%` }} />
                  </div>
                  <span className="td-muted">{s.percentage}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
