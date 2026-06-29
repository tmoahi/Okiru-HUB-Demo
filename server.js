const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// ─── Sample Data — Okiru Consulting (SA) ──────────────────────────────────────
//     B-BBEE | ESG | AI Transformation | Compliance Training
//     Currency: South African Rand (R)

const crmData = {
  summary: {
    totalDeals:    96,
    openDeals:     31,
    wonDeals:      58,
    lostDeals:      7,
    totalRevenue:  4_820_000,
    avgDealSize:   83_103,
  },
  pipeline: [
    { stage: 'Discovery',      deals: 9,  value: 620_000   },
    { stage: 'Scoping',        deals: 7,  value: 840_000   },
    { stage: 'Proposal Sent',  deals: 8,  value: 1_260_000 },
    { stage: 'Contract',       deals: 4,  value: 980_000   },
    { stage: 'Delivery',       deals: 3,  value: 1_120_000 },
  ],
  recentDeals: [
    { id: 1, company: 'Rand Merchant Holdings',  contact: 'Sipho Dlamini',    value: 320_000, stage: 'Contract',      daysOpen: 8,  service: 'B-BBEE Verification'       },
    { id: 2, company: 'Ecowise Construction',    contact: 'Lerato Mokoena',   value: 185_000, stage: 'Proposal Sent', daysOpen: 14, service: 'ESG Strategy & Reporting'   },
    { id: 3, company: 'Thrive Financial Group',  contact: 'Andile Khumalo',   value: 560_000, stage: 'Delivery',      daysOpen: 42, service: 'AI Transformation Roadmap'  },
    { id: 4, company: 'Sanlam SME Division',     contact: 'Nomsa Vilakazi',   value: 98_000,  stage: 'Scoping',       daysOpen: 5,  service: 'Compliance Training Bundle' },
    { id: 5, company: 'GreenBuild Africa',       contact: 'Kagiso Sithole',   value: 240_000, stage: 'Discovery',     daysOpen: 2,  service: 'ESG Baseline Assessment'   },
    { id: 6, company: 'Ukhamba Mining Corp',     contact: 'Tebogo Nkosi',     value: 410_000, stage: 'Contract',      daysOpen: 19, service: 'B-BBEE Scorecard Advisory' },
    { id: 7, company: 'Luminary Retail Group',   contact: 'Ayanda Zulu',      value: 145_000, stage: 'Proposal Sent', daysOpen: 11, service: 'Enterprise Development Plan'},
  ],
  topContacts: [
    { name: 'Andile Khumalo',   company: 'Thrive Financial Group', deals: 4, totalValue: 1_340_000, service: 'AI Transformation' },
    { name: 'Sipho Dlamini',    company: 'Rand Merchant Holdings', deals: 3, totalValue:   880_000, service: 'B-BBEE Advisory'   },
    { name: 'Nomsa Vilakazi',   company: 'Sanlam SME Division',    deals: 5, totalValue:   620_000, service: 'Training & Compliance' },
    { name: 'Lerato Mokoena',   company: 'Ecowise Construction',   deals: 2, totalValue:   425_000, service: 'ESG Strategy'      },
  ],
};

const analyticsData = {
  summary: {
    totalVisitors:   22_840,
    uniqueVisitors:  15_310,
    pageViews:       64_220,
    avgSessionDuration: '4m 18s',
    bounceRate:      '34.2%',
    conversionRate:  '6.8%',
  },
  trafficSources: [
    { source: 'LinkedIn',       visitors: 8_640,  percentage: 37.8 },
    { source: 'Organic Search', visitors: 6_120,  percentage: 26.8 },
    { source: 'Direct',         visitors: 3_980,  percentage: 17.4 },
    { source: 'Email',          visitors: 2_540,  percentage: 11.1 },
    { source: 'Referral',       visitors: 1_560,  percentage:  6.8 },
  ],
  weeklyVisitors: [
    { day: 'Mon', visitors: 3_820 },
    { day: 'Tue', visitors: 4_440 },
    { day: 'Wed', visitors: 4_980 },
    { day: 'Thu', visitors: 4_310 },
    { day: 'Fri', visitors: 3_640 },
    { day: 'Sat', visitors:   980 },
    { day: 'Sun', visitors:   670 },
  ],
  topPages: [
    { page: '/bbbee-services',        views: 14_800, avgTime: '5m 32s', bounceRate: '24%' },
    { page: '/esg-training',          views: 11_420, avgTime: '4m 48s', bounceRate: '27%' },
    { page: '/ai-transformation',     views:  9_640, avgTime: '6m 12s', bounceRate: '19%' },
    { page: '/compliance-training',   views:  7_280, avgTime: '3m 55s', bounceRate: '31%' },
    { page: '/enterprise-development',views:  5_840, avgTime: '4m 20s', bounceRate: '28%' },
    { page: '/about',                 views:  4_920, avgTime: '2m 10s', bounceRate: '42%' },
    { page: '/contact',               views:  3_240, avgTime: '2m 45s', bounceRate: '16%' },
  ],
  conversions: {
    total:          1_554,
    consultationRequests: 640,
    trainingSignups:      480,
    reportDownloads:      310,
    demoRequests:         124,
  },
};

const marketingData = {
  summary: {
    activeCampaigns:    7,
    totalSpend:    184_000,
    totalRevenue: 1_420_000,
    overallROI:    '671.7%',
    leadsGenerated:    924,
    costPerLead:    199.13,
  },
  campaigns: [
    { id: 1, name: 'B-BBEE Scorecard 2025',            channel: 'LinkedIn',    status: 'Active',    spend: 38_000,  revenue: 360_000, roi: '847%', leads: 198 },
    { id: 2, name: 'ESG Reporting Masterclass',        channel: 'Email',       status: 'Active',    spend: 24_000,  revenue: 220_000, roi: '817%', leads: 164 },
    { id: 3, name: 'AI in the Boardroom — Webinar',    channel: 'LinkedIn',    status: 'Active',    spend: 42_000,  revenue: 380_000, roi: '805%', leads: 218 },
    { id: 4, name: 'Transformation Index 2025 Report', channel: 'Organic',     status: 'Active',    spend: 18_000,  revenue: 162_000, roi: '800%', leads: 142 },
    { id: 5, name: 'Compliance Toolkit Launch',        channel: 'Email',       status: 'Active',    spend: 14_000,  revenue: 118_000, roi: '743%', leads: 96  },
    { id: 6, name: 'Enterprise Dev Partner Drive',     channel: 'Referral',    status: 'Completed', spend: 28_000,  revenue: 124_000, roi: '343%', leads: 74  },
    { id: 7, name: 'BBBEE Awareness — Social Ads',     channel: 'Social Media',status: 'Paused',    spend: 20_000,  revenue: 56_000,  roi: '180%', leads: 32  },
  ],
  channelPerformance: [
    { channel: 'LinkedIn',     spend: 80_000,  revenue: 740_000, leads: 416 },
    { channel: 'Email',        spend: 38_000,  revenue: 338_000, leads: 260 },
    { channel: 'Organic',      spend: 18_000,  revenue: 162_000, leads: 142 },
    { channel: 'Referral',     spend: 28_000,  revenue: 124_000, leads: 74  },
    { channel: 'Social Media', spend: 20_000,  revenue: 56_000,  leads: 32  },
  ],
  monthlySpend: [
    { month: 'Feb', spend: 24_000,  revenue: 168_000 },
    { month: 'Mar', spend: 28_000,  revenue: 210_000 },
    { month: 'Apr', spend: 32_000,  revenue: 264_000 },
    { month: 'May', spend: 38_000,  revenue: 320_000 },
    { month: 'Jun', spend: 46_000,  revenue: 398_000 },
  ],
};

// ─── API Routes ───────────────────────────────────────────────────────────────

app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      crm: {
        summary:     crmData.summary,
        recentDeals: crmData.recentDeals.slice(0, 3),
        pipeline:    crmData.pipeline,
      },
      analytics: {
        summary:        analyticsData.summary,
        trafficSources: analyticsData.trafficSources,
        weeklyVisitors: analyticsData.weeklyVisitors,
      },
      marketing: {
        summary:            marketingData.summary,
        campaigns:          marketingData.campaigns.slice(0, 4),
        channelPerformance: marketingData.channelPerformance,
      },
    },
  });
});

app.get('/api/crm',       (req, res) => res.json({ success: true, timestamp: new Date().toISOString(), data: crmData       }));
app.get('/api/analytics', (req, res) => res.json({ success: true, timestamp: new Date().toISOString(), data: analyticsData }));
app.get('/api/marketing', (req, res) => res.json({ success: true, timestamp: new Date().toISOString(), data: marketingData }));

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
        <body style="font-family:sans-serif;padding:2rem;background:#06090f;color:#eef2ff">
          <h1>🚀 Okiru HUB API — Dev Mode</h1>
          <p>Run <code>npm run build</code> then <code>npm start</code> to serve the full UI.</p>
          <ul style="margin-top:1rem;line-height:2.2">
            <li><a href="/api/health"    style="color:#06CDE1">/api/health</a></li>
            <li><a href="/api/dashboard" style="color:#06CDE1">/api/dashboard</a></li>
            <li><a href="/api/crm"       style="color:#06CDE1">/api/crm</a></li>
            <li><a href="/api/analytics" style="color:#06CDE1">/api/analytics</a></li>
            <li><a href="/api/marketing" style="color:#06CDE1">/api/marketing</a></li>
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
