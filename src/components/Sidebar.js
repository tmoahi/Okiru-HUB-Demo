import React from 'react';
import OkiruLogo from './OkiruLogo';
import './Sidebar.css';

const NAV_ITEMS = {
  overview:  { label: 'Overview',  icon: '⊞' },
  crm:       { label: 'CRM',       icon: '👥' },
  analytics: { label: 'Analytics', icon: '📊' },
  marketing: { label: 'Marketing', icon: '📣' },
};

export default function Sidebar({ activeView, setActiveView, views }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <OkiruLogo size={36} className="sidebar-logo-img" />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">Okiru HUB</span>
          <span className="sidebar-logo-sub">Workspace</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Main Menu</p>
        {Object.keys(views).map(key => {
          const { label, icon } = NAV_ITEMS[key] ?? { label: key, icon: '◉' };
          return (
            <button
              key={key}
              className={`nav-item ${activeView === key ? 'nav-item--active' : ''}`}
              onClick={() => setActiveView(key)}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
              {activeView === key && <span className="nav-indicator" />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">OK</div>
        <div className="user-info">
          <p className="user-name">Admin User</p>
          <p className="user-role">Super Admin</p>
        </div>
      </div>
    </aside>
  );
}
