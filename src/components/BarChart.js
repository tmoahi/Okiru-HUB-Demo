import React from 'react';
import './BarChart.css';

/**
 * Simple pure-CSS bar chart.
 * Props:
 *   data   – array of { label, value, [color] }
 *   unit   – string appended to tooltip (e.g. '$', 'k')
 *   height – bar area height in px (default 140)
 */
export default function BarChart({ data = [], unit = '', height = 140 }) {
  if (!data.length) return null;

  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bar-chart" style={{ '--chart-height': `${height}px` }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="bar-col">
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  height: `${pct}%`,
                  background: d.color || 'var(--accent-blue)',
                }}
                title={`${d.label}: ${unit}${d.value.toLocaleString()}`}
              />
            </div>
            <span className="bar-label">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
