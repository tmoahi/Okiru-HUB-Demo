import React, { useEffect, useState } from 'react';
import OkiruLogo from './OkiruLogo';
import './Certificate.css';

function calcPct(course, progress) {
  const all  = course.modules?.flatMap(m => m.lessons?.map(l => l.id) || []) || [];
  const done = all.filter(id => progress[id]);
  return all.length ? Math.round(done.length / all.length * 100) : 0;
}

const TODAY = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Certificate({ user, enrollments, progress, quizScores, navigateTo }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(j => setCourses(j.data || [])).catch(() => {});
  }, []);

  const completed = courses.filter(c => enrollments.has(c.id) && calcPct(c, progress) === 100);

  if (completed.length === 0) {
    return (
      <div className="cert-empty">
        <p className="cert-empty-icon">🏆</p>
        <h3>No certificates yet</h3>
        <p>Complete all lessons in a course to earn your certificate.</p>
        <button className="btn btn-primary" onClick={() => navigateTo('catalogue')}>Browse Courses</button>
      </div>
    );
  }

  return (
    <div className="certs-page">
      <div className="certs-header">
        <h2 className="certs-title">Your Certificates</h2>
        <p className="certs-sub">{completed.length} certificate{completed.length !== 1 ? 's' : ''} earned</p>
      </div>
      <div className="certs-list">
        {completed.map(c => <CertCard key={c.id} course={c} user={user} date={TODAY} />)}
      </div>
    </div>
  );
}

function CertCard({ course, user, date }) {
  const color = course.color || '#06CDE1';

  return (
    <div className="cert-wrap">
      <div className="cert" id={`cert-${course.id}`}>
        <div className="cert-border-top" style={{ background: `linear-gradient(90deg, ${color}, #BA0DA7, #FF7512)` }} />
        <div className="cert-inner">
          <div className="cert-head">
            <OkiruLogo size={42} />
            <div>
              <p className="cert-org">Okiru Consulting & Training</p>
              <p className="cert-org-sub">B-BBEE · ESG · AI · Compliance</p>
            </div>
          </div>
          <p className="cert-label">Certificate of Completion</p>
          <p className="cert-presented">This is to certify that</p>
          <h2 className="cert-name">{user.name}</h2>
          <p className="cert-company">{user.company}</p>
          <p className="cert-presented">has successfully completed</p>
          <h3 className="cert-course">{course.title}</h3>
          <div className="cert-meta">
            <span className="cert-cat" style={{ color, borderColor: color+'40', background: color+'12' }}>{course.category}</span>
            <span className="cert-level">{course.level}</span>
            <span className="cert-duration">⏱ {course.duration}</span>
          </div>
          <div className="cert-footer">
            <div className="cert-sig">
              <div className="cert-sig-line" />
              <p className="cert-sig-name">{course.instructor?.name}</p>
              <p className="cert-sig-title">{course.instructor?.title}</p>
            </div>
            <div className="cert-date-block">
              <p className="cert-date-label">Date of completion</p>
              <p className="cert-date">{date}</p>
            </div>
          </div>
          <div className="cert-border-bottom" style={{ background: `linear-gradient(90deg, ${color}, #BA0DA7, #FF7512)` }} />
        </div>
      </div>
      <button className="btn btn-ghost cert-print-btn" onClick={() => window.print()}>🖨 Print / Save PDF</button>
    </div>
  );
}
