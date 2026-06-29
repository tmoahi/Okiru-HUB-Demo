const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// ─── Sample Data ──────────────────────────────────────────────────────────────

const crmData = {
  summary: {
    totalDeals: 142,
    openDeals: 38,
    wonDeals: 89,
    lostDeals: 15,
    totalRevenue: 1_284_500,
    avgDealSize: 14_432,
  },
  pipeline: [
    { stage: 'Prospecting',    deals: 12, value: 186_000 },
    { stage: 'Qualification',  deals: 9,  value: 143_500 },
    { stage: 'Proposal',       deals: 8,  value: 212_000 },
    { stage: 'Negotiation',    deals: 5,  value: 98_000  },
    { stage: 'Closed Won',     deals: 4,  value: 310_000 },
  ],
  recentDeals: [
    { id: 1, company: 'Acme Corp',        contact: 'Jane Smith',    value: 45_000, stage: 'Negotiation', daysOpen: 12 },
    { id: 2, company: 'Globex Inc',       contact: 'John Doe',      value: 28_500, stage: 'Proposal',    daysOpen: 7  },
    { id: 3, company: 'Initech Solutions',contact: 'Alice Johnson', value: 62_000, stage: 'Closed Won',  daysOpen: 31 },
    { id: 4, company: 'Umbrella Ltd',     contact: 'Bob Williams',  value: 19_200, stage: 'Qualification',daysOpen: 4 },
    { id: 5, company: 'Stark Industries', contact: 'Carol Davis',   value: 87_500, stage: 'Prospecting', daysOpen: 2  },
  ],
  topContacts: [
    { name: 'Jane Smith',    company: 'Acme Corp',         deals: 4, totalValue: 142_000 },
    { name: 'John Doe',      company: 'Globex Inc',        deals: 3, totalValue: 98_500  },
    { name: 'Alice Johnson', company: 'Initech Solutions', deals: 5, totalValue: 215_000 },
  ],
};

const analyticsData = {
  summary: {
    totalVisitors:   48_320,
    uniqueVisitors:  31_540,
    pageViews:      124_870,
    avgSessionDuration: '3m 42s',
    bounceRate:     '38.4%',
    conversionRate: '4.2%',
  },
  trafficSources: [
    { source: 'Organic Search', visitors: 18_240, percentage: 37.7 },
    { source: 'Direct',         visitors: 11_430, percentage: 23.7 },
    { source: 'Social Media',   visitors:  8_960, percentage: 18.5 },
    { source: 'Email',          visitors:  5_820, percentage: 12.0 },
    { source: 'Referral',       visitors:  3_870, percentage:  8.0 },
  ],
  weeklyVisitors: [
    { day: 'Mon', visitors: 6_420 },
    { day: 'Tue', visitors: 7_180 },
    { day: 'Wed', visitors: 8_340 },
    { day: 'Thu', visitors: 7_920 },
    { day: 'Fri', visitors: 9_100 },
    { day: 'Sat', visitors: 5_230 },
    { day: 'Sun', visitors: 4_130 },
  ],
  topPages: [
    { page: '/home',       views: 24_500, avgTime: '2m 10s', bounceRate: '32%' },
    { page: '/products',   views: 18_320, avgTime: '4m 05s', bounceRate: '28%' },
    { page: '/pricing',    views: 12_840, avgTime: '5m 22s', bounceRate: '22%' },
    { page: '/about',      views:  8_760, avgTime: '1m 48s', bounceRate: '45%' },
    { page: '/contact',    views:  6_430, avgTime: '3m 15s', bounceRate: '18%' },
  ],
  conversions: {
    total: 2_030,
    signups: 1_240,
    purchases: 540,
    demoRequests: 250,
  },
};

const marketingData = {
  summary: {
    activeCampaigns:   8,
    totalSpend:   42_800,
    totalRevenue: 198_400,
    overallROI:   '363.6%',
    leadsGenerated: 1_842,
    costPerLead:   23.24,
  },
  campaigns: [
    { id: 1, name: 'Q4 Product Launch',   channel: 'Email',        status: 'Active',   spend: 8_200, revenue: 42_000, roi: '412%', leads: 420 },
    { id: 2, name: 'Brand Awareness',     channel: 'Social Media', status: 'Active',   spend: 6_500, revenue: 28_500, roi: '338%', leads: 310 },
    { id: 3, name: 'Retargeting Push',    channel: 'Paid Search',  status: 'Active',   spend: 5_100, revenue: 31_200, roi: '512%', leads: 280 },
    { id: 4, name: 'Newsletter Blast',    channel: 'Email',        status: 'Completed',spend: 1_200, revenue:  9_800, roi: '717%', leads: 195 },
    { id: 5, name: 'Influencer Collab',   channel: 'Social Media', status: 'Active',   spend: 9_800, revenue: 38_400, roi: '292%', leads: 380 },
    { id: 6, name: 'SEO Content Push',    channel: 'Organic',      status: 'Active',   spend: 4_200, revenue: 22_100, roi: '426%', leads: 257 },
  ],
  channelPerformance: [
    { channel: 'Email',        spend: 9_400,  revenue: 51_800, leads: 615 },
    { channel: 'Social Media', spend: 16_300, revenue: 66_900, leads: 690 },
    { channel: 'Paid Search',  spend: 5_100,  revenue: 31_200, leads: 280 },
    { channel: 'Organic',      spend: 4_200,  revenue: 22_100, leads: 257 },
    { channel: 'Referral',     spend: 7_800,  revenue: 26_400, leads: 0   },
  ],
  monthlySpend: [
    { month: 'Jul', spend: 6_200, revenue: 28_400 },
    { month: 'Aug', spend: 7_100, revenue: 33_200 },
    { month: 'Sep', spend: 8_400, revenue: 41_800 },
    { month: 'Oct', spend: 9_200, revenue: 48_600 },
    { month: 'Nov', spend: 11_900,revenue: 46_400 },
  ],
};

// ─── API Routes ───────────────────────────────────────────────────────────────

// Combined dashboard snapshot
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      crm: {
        summary: crmData.summary,
        recentDeals: crmData.recentDeals.slice(0, 3),
        pipeline: crmData.pipeline,
      },
      analytics: {
        summary: analyticsData.summary,
        trafficSources: analyticsData.trafficSources,
        weeklyVisitors: analyticsData.weeklyVisitors,
      },
      marketing: {
        summary: marketingData.summary,
        campaigns: marketingData.campaigns.slice(0, 4),
        channelPerformance: marketingData.channelPerformance,
      },
    },
  });
});

// Full CRM data
app.get('/api/crm', (req, res) => {
  res.json({ success: true, timestamp: new Date().toISOString(), data: crmData });
});

// Full analytics data
app.get('/api/analytics', (req, res) => {
  res.json({ success: true, timestamp: new Date().toISOString(), data: analyticsData });
});

// Full marketing data
app.get('/api/marketing', (req, res) => {
  res.json({ success: true, timestamp: new Date().toISOString(), data: marketingData });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ─── Serve React Frontend ─────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <body style="font-family:sans-serif;padding:2rem;background:#0f172a;color:#e2e8f0">
          <h1>🚀 Okiru HUB API — Dev Mode</h1>
          <p>Run <code>npm run build</code> then <code>npm start</code> to serve the full UI.</p>
          <ul>
            <li><a href="/api/health"    style="color:#38bdf8">/api/health</a></li>
            <li><a href="/api/dashboard" style="color:#38bdf8">/api/dashboard</a></li>
            <li><a href="/api/crm"       style="color:#38bdf8">/api/crm</a></li>
            <li><a href="/api/analytics" style="color:#38bdf8">/api/analytics</a></li>
            <li><a href="/api/marketing" style="color:#38bdf8">/api/marketing</a></li>
          </ul>
        </body>
      </html>
    `);
  });
}

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Okiru HUB running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
