import React from 'react';
import './Sidebar.css';

const ICONS = {
  overview:  '⊞',
  crm:       '👥',
  analytics: '📊',
  marketing: '📣',
};

export default function Sidebar({ activeView, setActiveView, views }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">◈</span>
        <span className="logo-text">Okiru<strong>HUB</strong></span>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Main Menu</p>
        {Object.entries(views).map(([key, { label }]) => (
          <button
            key={key}
            className={`nav-item ${activeView === key ? 'nav-item--active' : ''}`}
            onClick={() => setActiveView(key)}
          >
            <span className="nav-icon">{ICONS[key]}</span>
            <span className="nav-label">{label}</span>
            {activeView === key && <span className="nav-indicator" />}
          </button>
        ))}
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
