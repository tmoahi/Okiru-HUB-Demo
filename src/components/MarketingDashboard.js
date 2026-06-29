import React, { useState } from 'react';
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

/* ── SEO tag suggestions generated from live data ──────────────────────────── */
function buildSeoSuggestions(data) {
  const suggestions = [];

  // derive from top channel
  const topChannel = [...data.channelPerformance].sort((a, b) => b.revenue - a.revenue)[0];
  if (topChannel) {
    suggestions.push({
      tag: topChannel.channel.toLowerCase().replace(' ', '-'),
      reason: `Top revenue channel (${fmt(topChannel.revenue)})`,
      score: 95,
    });
  }

  // derive from best ROI campaign
  const topCampaign = [...data.campaigns].sort((a, b) => parseInt(b.roi) - parseInt(a.roi))[0];
  if (topCampaign) {
    const slug = topCampaign.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    suggestions.push({ tag: slug, reason: `Best ROI campaign: ${topCampaign.roi}`, score: 88 });
  }

  // Organic presence tag
  const organic = data.channelPerformance.find(c => c.channel === 'Organic');
  if (organic && organic.leads > 200) {
    suggestions.push({ tag: 'seo-content-marketing', reason: `${organic.leads} organic leads — grow this`, score: 84 });
    suggestions.push({ tag: 'content-strategy', reason: 'High organic lead yield', score: 78 });
  }

  // Lead gen volume
  if (data.summary.leadsGenerated > 1000) {
    suggestions.push({ tag: 'lead-generation', reason: `${data.summary.leadsGenerated.toLocaleString()} leads generated`, score: 82 });
  }

  // ROI highlight
  suggestions.push({ tag: 'roi-driven-marketing', reason: `Overall ROI: ${data.summary.overallROI}`, score: 76 });
  suggestions.push({ tag: 'performance-marketing',  reason: 'Strong cross-channel performance',     score: 73 });
  suggestions.push({ tag: 'digital-growth-strategy',reason: 'Consistent monthly revenue growth',    score: 70 });

  return suggestions.sort((a, b) => b.score - a.score);
}

/* ── Performance-based advice ───────────────────────────────────────────────── */
function buildAdvice(data) {
  const advice = [];

  const channels = data.channelPerformance;
  const topCh = [...channels].sort((a, b) => b.revenue - a.revenue)[0];
  const weakCh = [...channels].filter(c => c.spend > 0).sort((a, b) => {
    const roiA = (a.revenue - a.spend) / a.spend;
    const roiB = (b.revenue - b.spend) / b.spend;
    return roiA - roiB;
  })[0];

  advice.push({
    type: 'opportunity',
    icon: '🚀',
    title: `Scale ${topCh.channel} — it's your highest revenue channel`,
    body: `${topCh.channel} generated ${fmt(topCh.revenue)} this period. Increasing budget here by 20% is likely to yield the strongest return given its proven track record.`,
  });

  const emailChannel = channels.find(c => c.channel === 'Email');
  if (emailChannel && emailChannel.leads > 500) {
    advice.push({
      type: 'strength',
      icon: '✉️',
      title: 'Email is your most cost-efficient lead channel',
      body: `At ${fmt(emailChannel.spend)} spend you generated ${emailChannel.leads} leads — the best CPL across all channels. Invest in list growth and automation sequences.`,
    });
  }

  if (weakCh) {
    const roi = (((weakCh.revenue - weakCh.spend) / weakCh.spend) * 100).toFixed(0);
    advice.push({
      type: 'warning',
      icon: '⚠️',
      title: `Review ${weakCh.channel} spend — lowest ROI at ${roi}%`,
      body: `${weakCh.channel} is underperforming relative to budget. Consider A/B testing creatives, narrowing the audience, or reallocating budget to higher-performing channels.`,
    });
  }

  const organic = channels.find(c => c.channel === 'Organic');
  if (organic) {
    const roiOrganic = (((organic.revenue - organic.spend) / organic.spend) * 100).toFixed(0);
    advice.push({
      type: 'opportunity',
      icon: '🌱',
      title: `Organic ROI at ${roiOrganic}% — content is compounding`,
      body: `Organic leads cost less over time. Publishing 2-3 high-intent articles per month targeting your top SEO tags will compound traffic without proportional spend increases.`,
    });
  }

  const nov = data.monthlySpend.at(-1);
  const oct = data.monthlySpend.at(-2);
  if (nov && oct && nov.revenue < oct.revenue) {
    advice.push({
      type: 'warning',
      icon: '📉',
      title: 'Revenue dipped last month — investigate campaign fatigue',
      body: `Revenue dropped from ${fmt(oct.revenue)} to ${fmt(nov.revenue)}. This may indicate audience saturation on Social or Email. Refresh creatives and review frequency capping.`,
    });
  } else if (nov && oct) {
    advice.push({
      type: 'strength',
      icon: '📈',
      title: 'Month-over-month revenue trending upward',
      body: `Revenue grew from ${fmt(oct.revenue)} to ${fmt(nov.revenue)}. Maintain current campaign cadence and consider incrementally increasing budget in top channels.`,
    });
  }

  return advice;
}

/* ── Post Creator ────────────────────────────────────────────────────────────── */
function PostCreator({ seoTags }) {
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [tags, setTags]         = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [published, setPublished] = useState(false);

  function addTag(tag) {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !tags.includes(clean) && tags.length < 10) {
      setTags(prev => [...prev, clean]);
    }
  }

  function removeTag(tag) { setTags(prev => prev.filter(t => t !== tag)); }

  function handleTagKey(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setPublished(true);
    setTimeout(() => setPublished(false), 3500);
  }

  return (
    <div className="post-creator">
      {published && (
        <div className="post-success">
          <span>✓</span> Post queued for publishing
        </div>
      )}

      <form onSubmit={handleSubmit} className="post-form">
        <div className="post-form-row">
          <label>
            Post title
            <input
              type="text"
              placeholder="e.g. How we 4x'd ROI with email marketing"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="post-form-row">
          <label>
            Content
            <textarea
              placeholder="Write your post content here…"
              value={body}
              onChange={e => setBody(e.target.value)}
              style={{ minHeight: 120 }}
              required
            />
          </label>
        </div>

        <div className="post-form-row">
          <label>
            Tags
            <div className="tag-input-wrap">
              {tags.map(t => (
                <span key={t} className="tag-chip">
                  #{t}
                  <button type="button" className="tag-remove" onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
              <input
                type="text"
                className="tag-bare-input"
                placeholder="Add tag + Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
              />
            </div>
          </label>
        </div>

        {/* SEO tag suggestions */}
        <div className="seo-suggestions">
          <p className="suggestions-label">Suggested SEO tags based on performance</p>
          <div className="suggestions-grid">
            {seoTags.slice(0, 8).map(s => (
              <button
                key={s.tag}
                type="button"
                className={`seo-chip ${tags.includes(s.tag) ? 'seo-chip--active' : ''}`}
                onClick={() => tags.includes(s.tag) ? removeTag(s.tag) : addTag(s.tag)}
                title={s.reason}
              >
                <span className="seo-chip-score">{s.score}</span>
                #{s.tag}
              </button>
            ))}
          </div>
        </div>

        <div className="post-form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => { setTitle(''); setBody(''); setTags([]); }}>
            Clear
          </button>
          <button type="submit" className="btn btn-primary">
            Publish post
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function MarketingDashboard() {
  const { data, loading, error } = useApi('/api/marketing');
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) return <LoadingSpinner message="Loading marketing data…" />;
  if (error)   return <div className="error-msg">⚠ Failed to load: {error}</div>;

  const seoTags = buildSeoSuggestions(data);
  const advice  = buildAdvice(data);

  const spendChart = data.monthlySpend.map(m => ({
    label: m.month, value: m.spend, color: 'var(--accent-rose)',
  }));
  const revenueChart = data.monthlySpend.map(m => ({
    label: m.month, value: m.revenue, color: 'var(--accent-emerald)',
  }));
  const channelDonut = data.channelPerformance.map(c => ({
    label: c.channel, value: c.revenue,
  }));

  return (
    <div className="marketing">
      {/* KPIs */}
      <section className="marketing-kpis">
        <StatCard label="Total Spend"     value={fmt(data.summary.totalSpend)}    accent="rose"    icon="💸" />
        <StatCard label="Total Revenue"   value={fmt(data.summary.totalRevenue)}  accent="emerald" icon="💰" sub={`ROI: ${data.summary.overallROI}`} />
        <StatCard label="Leads Generated" value={data.summary.leadsGenerated.toLocaleString()} accent="blue" icon="🎯" />
        <StatCard label="Cost Per Lead"   value={`$${data.summary.costPerLead}`}  accent="amber"   icon="📊" sub={`${data.summary.activeCampaigns} active campaigns`} />
      </section>

      {/* Tab bar */}
      <div className="mkt-tabs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'publish',  label: 'Create Post + SEO' },
          { id: 'advice',   label: 'Performance Advice' },
        ].map(t => (
          <button
            key={t.id}
            className={`mkt-tab ${activeTab === t.id ? 'mkt-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.id === 'advice' && <span className="mkt-tab-badge">{advice.length}</span>}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW tab ── */}
      {activeTab === 'overview' && (
        <>
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

          <Card title="All Campaigns" subtitle="Performance overview">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign</th><th>Channel</th><th>Status</th>
                  <th>Spend</th><th>Revenue</th><th>ROI</th><th>Leads</th>
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
                    <td><span className={`status-badge status-badge--${c.status.toLowerCase()}`}>{c.status}</span></td>
                    <td className="td-number">{fmt(c.spend)}</td>
                    <td className="td-number">{fmt(c.revenue)}</td>
                    <td className="td-positive">{c.roi}</td>
                    <td className="td-number">{c.leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Channel Performance" subtitle="Spend vs Revenue">
            <table className="data-table">
              <thead>
                <tr><th>Channel</th><th>Spend</th><th>Revenue</th><th>ROI</th><th>Leads</th></tr>
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
        </>
      )}

      {/* ── PUBLISH tab ── */}
      {activeTab === 'publish' && (
        <Card title="Create Post" subtitle="Publish content with SEO-optimised tags">
          <PostCreator seoTags={seoTags} />

          <div className="seo-tag-legend">
            <p className="seo-legend-title">All SEO tag suggestions</p>
            <p className="seo-legend-sub">Score = estimated search relevance based on your performance data</p>
            <div className="seo-legend-rows">
              {seoTags.map(s => (
                <div key={s.tag} className="seo-legend-row">
                  <div className="seo-legend-left">
                    <span className="seo-score-bar">
                      <span style={{ width: `${s.score}%`, background: 'var(--okiru-gradient)' }} />
                    </span>
                    <span className="seo-legend-tag">#{s.tag}</span>
                  </div>
                  <span className="seo-legend-reason">{s.reason}</span>
                  <span className="seo-legend-num">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── ADVICE tab ── */}
      {activeTab === 'advice' && (
        <div className="advice-list">
          {advice.map((a, i) => (
            <div key={i} className={`advice-card advice-card--${a.type}`}>
              <span className="advice-icon">{a.icon}</span>
              <div className="advice-body">
                <p className="advice-title">{a.title}</p>
                <p className="advice-text">{a.body}</p>
              </div>
              <span className={`advice-badge advice-badge--${a.type}`}>
                {a.type === 'opportunity' ? 'Opportunity' : a.type === 'strength' ? 'Strength' : 'Watch'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
