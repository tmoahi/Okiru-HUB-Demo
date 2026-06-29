# Okiru HUB Demo

A full-stack company hub dashboard featuring CRM, Analytics, and Marketing dashboards — built with Express.js and React, ready to deploy on Railway.

## Features

- **CRM Dashboard** — Deal pipeline, recent opportunities, top contacts, stage breakdown
- **Analytics Dashboard** — Traffic sources, weekly visitors, conversion breakdown, top pages
- **Marketing Dashboard** — Campaign performance, channel ROI, monthly spend vs revenue
- **Overview** — Unified snapshot of all three modules in one view

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Node.js, Express 4, Morgan, CORS  |
| Frontend | React 18, CSS custom properties   |
| Charts   | Pure SVG / CSS (no dependencies)  |
| Deploy   | Railway (Nixpacks, port 3000)     |

## Project Structure

```
├── server.js          # Express API server (entry point)
├── package.json       # Dependencies & build scripts
├── railway.json       # Railway deployment config
├── public/
│   └── index.html     # React HTML shell
└── src/
    ├── index.js       # React entry point
    ├── App.js         # Root component + routing
    ├── hooks/
    │   └── useApi.js  # Data-fetching hook
    └── components/
        ├── Sidebar.js / Header.js
        ├── StatCard.js / Card.js / BarChart.js / DonutChart.js
        ├── DashboardOverview.js
        ├── CRMDashboard.js
        ├── AnalyticsDashboard.js
        └── MarketingDashboard.js
```

## API Endpoints

| Method | Path              | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | `/api/health`     | Health check                         |
| GET    | `/api/dashboard`  | Combined snapshot (CRM + Analytics + Marketing) |
| GET    | `/api/crm`        | Full CRM data (deals, pipeline, contacts) |
| GET    | `/api/analytics`  | Full analytics data (traffic, pages, conversions) |
| GET    | `/api/marketing`  | Full marketing data (campaigns, channels, spend) |

## Local Development

```bash
# Install dependencies
npm install

# Build the React frontend
npm run build

# Start the server (serves API + built frontend)
npm start
```

The app will be available at `http://localhost:3000`.

## Deployment on Railway

1. Connect this repository to a Railway project
2. Railway auto-detects Node.js via Nixpacks
3. `postinstall` runs `npm run build` automatically
4. `npm start` launches the Express server on port 3000
5. Set `NODE_ENV=production` in Railway environment variables

## Connecting Real Data

All sample data lives in `server.js` under the `crmData`, `analyticsData`, and `marketingData` objects. Replace these with real database queries or third-party API calls (Salesforce, HubSpot, Google Analytics, etc.) without touching the frontend.
