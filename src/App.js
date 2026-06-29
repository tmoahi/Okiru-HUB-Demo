import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import CRMDashboard from './components/CRMDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MarketingDashboard from './components/MarketingDashboard';

const VIEWS = {
  overview:  { label: 'Overview',   component: DashboardOverview },
  crm:       { label: 'CRM',        component: CRMDashboard      },
  analytics: { label: 'Analytics',  component: AnalyticsDashboard},
  marketing: { label: 'Marketing',  component: MarketingDashboard},
};

export default function App() {
  const [activeView, setActiveView] = useState('overview');

  const ActiveComponent = VIEWS[activeView].component;

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} setActiveView={setActiveView} views={VIEWS} />
      <div className="app-main">
        <Header activeView={activeView} views={VIEWS} />
        <main className="app-content">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
