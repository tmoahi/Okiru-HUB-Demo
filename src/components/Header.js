import React, { useState, useEffect } from 'react';
import './Header.css';

const VIEW_LABELS = {
  portal:       'My Learning',
  catalogue:    'Course Catalogue',
  lesson:       'Lesson',
  certificates: 'Certificates',
  admin:        'Admin Dashboard',
};

export default function Header({ view }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const label = VIEW_LABELS[view] || 'Okiru LMS';

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{label}</h1>
        <span className="header-breadcrumb">Okiru LMS / {label}</span>
      </div>
      <div className="header-right">
        <div className="header-time">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <span className="header-date">
            {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="header-badge">Live</div>
      </div>
    </header>
  );
}
