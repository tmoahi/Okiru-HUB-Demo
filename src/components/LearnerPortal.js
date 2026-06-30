import React, { useEffect, useState } from 'react';
import Card from './Card';
import './LearnerPortal.css';

const CATEGORY_COLOR = { 'B-BBEE': '#06CDE1', 'ESG': '#10e8a0', 'AI': '#BA0DA7', 'Compliance': '#FF7512' };

function calcCourseProgress(course, progress) {
  const all = course.modules.flatMap(m => m.lessons.map(l => l.id));
  const done = all.filter(id => progress[id]);
  return all.length ? Math.round((done.length / all.length) * 100) : 0;
}

export default function LearnerPortal({ user, enrollments, progress, quizScores, navigateTo }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(j => setCourses(j.data || [])).catch(() => {});
  }, []);

  const enrolled = courses.filter(c => enrollments.has(c.id));
  const totalLessons  = enrolled.flatMap(c => c.modules.flatMap(m => m.lessons)).length;
  const doneLessons   = Object.keys(progress).filter(k => progress[k]).length;
  const certCount     = enrolled.filter(c => calcCourseProgress(c, progress) === 100).length;

  const inProgress = enrolled.filter(c => { const p = calcCourseProgress(c, progress); return p > 0 && p < 100; });
  const notStarted = enrolled.filter(c => calcCourseProgress(c, progress) === 0);
  const completed  = enrolled.filter(c => calcCourseProgress(c, progress) === 100);

  return (
    <div className="portal">
      <div className="portal-welcome">
        <div>
          <h2 className="portal-greeting">Welcome back, {user.name.split(' ')[0]} 👋</h2>
          <p className="portal-company">{user.company}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigateTo('catalogue')}>Browse Courses</button>
      </div>

      <section className="portal-stats">
        <div className="pstat"><span className="pstat-val">{enrolled.length}</span><span className="pstat-label">Enrolled</span></div>
        <div className="pstat"><span className="pstat-val">{doneLessons}</span><span className="pstat-label">Lessons Done</span></div>
        <div className="pstat"><span className="pstat-val">{totalLessons > 0 ? Math.round(doneLessons/totalLessons*100) : 0}%</span><span className="pstat-label">Overall Progress</span></div>
        <div className="pstat"><span className="pstat-val">{certCount}</span><span className="pstat-label">Certificates</span></div>
      </section>

      {enrolled.length === 0 && (
        <div className="portal-empty">
          <p className="portal-empty-icon">📚</p>
          <h3>Start your learning journey</h3>
          <p>Explore Okiru's B-BBEE, ESG, AI, and Compliance courses.</p>
          <button className="btn btn-primary" onClick={() => navigateTo('catalogue')}>Browse Courses</button>
        </div>
      )}

      {inProgress.length > 0 && (
        <Card title="Continue Learning" subtitle="Pick up where you left off">
          <div className="portal-course-list">
            {inProgress.map(c => (
              <CourseRow key={c.id} course={c} pct={calcCourseProgress(c, progress)} progress={progress} navigateTo={navigateTo} />
            ))}
          </div>
        </Card>
      )}

      {notStarted.length > 0 && (
        <Card title="Not Started" subtitle="Ready when you are">
          <div className="portal-course-list">
            {notStarted.map(c => (
              <CourseRow key={c.id} course={c} pct={0} progress={progress} navigateTo={navigateTo} />
            ))}
          </div>
        </Card>
      )}

      {completed.length > 0 && (
        <Card title="Completed" subtitle="Well done!">
          <div className="portal-course-list">
            {completed.map(c => (
              <CourseRow key={c.id} course={c} pct={100} progress={progress} navigateTo={navigateTo} completed />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function CourseRow({ course, pct, navigateTo, completed }) {
  const color = CATEGORY_COLOR[course.category] || 'var(--accent-teal)';
  const firstModule = course.modules?.[0];
  return (
    <div className="portal-course-row">
      <div className="pcr-accent" style={{ background: color }} />
      <div className="pcr-info">
        <div className="pcr-top">
          <span className="pcr-category" style={{ color, borderColor: color + '33', background: color + '11' }}>{course.category}</span>
          <span className="pcr-level">{course.level}</span>
        </div>
        <p className="pcr-title">{course.title}</p>
        <p className="pcr-instructor">{course.instructor?.name} · {course.duration}</p>
        <div className="pcr-progress-row">
          <div className="pcr-bar"><div className="pcr-fill" style={{ width: `${pct}%`, background: color }} /></div>
          <span className="pcr-pct">{pct}%</span>
        </div>
      </div>
      <div className="pcr-action">
        {completed ? (
          <button className="btn btn-outline" onClick={() => navigateTo('certificates')}>View Certificate</button>
        ) : (
          <button className="btn btn-primary" onClick={() => navigateTo('lesson', course.id, firstModule?.id)}>
            {pct > 0 ? 'Continue' : 'Start'}
          </button>
        )}
      </div>
    </div>
  );
}
