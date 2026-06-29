import React from 'react';
import './StatCard.css';

export default function StatCard({ label, value, sub, accent = 'blue', icon }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  );
}
