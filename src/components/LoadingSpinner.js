import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading data…' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p className="spinner-msg">{message}</p>
    </div>
  );
}
