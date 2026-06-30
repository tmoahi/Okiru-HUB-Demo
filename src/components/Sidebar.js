import React from 'react';
import OkiruLogo from './OkiruLogo';
import './Sidebar.css';

export default function Sidebar({ user, navItems, activeView, setActiveView, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <OkiruLogo size={36} className="sidebar-logo-img" />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">Okiru LMS</span>
          <span className="sidebar-logo-sub">{user.role === 'admin' ? 'Admin Portal' : 'Learning Portal'}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <p className="nav-section-label">{user.role === 'admin' ? 'Admin' : 'Learning'}</p>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'nav-item--active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {activeView === item.id && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-avatar">{user.avatar || user.name.slice(0,2).toUpperCase()}</div>
        <div className="user-info">
          <p className="user-name">{user.name}</p>
          <p className="user-role">{user.company}</p>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Sign out">⇥</button>
      </div>
    </aside>
  );
}
