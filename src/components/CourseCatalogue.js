import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './CourseCatalogue.css';

const CATEGORIES = ['All', 'B-BBEE', 'ESG', 'AI', 'Compliance'];
const CAT_COLOR   = { 'B-BBEE': '#06CDE1', 'ESG': '#10e8a0', 'AI': '#BA0DA7', 'Compliance': '#FF7512' };
const LEVEL_COLOR = { Beginner: 'var(--accent-emerald)', Intermediate: 'var(--accent-amber)', Advanced: 'var(--accent-rose)' };

function Stars({ rating }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#FFB800' : 'var(--text-muted)' }}>★</span>
      ))}
      <span className="stars-val">{rating}</span>
    </span>
  );
}

export default function CourseCatalogue({ enrollments, progress, enroll, navigateTo }) {
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('All');
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(j => { setCourses(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const visible = courses.filter(c => {
    if (filter !== 'All' && c.category !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LoadingSpinner message="Loading courses…" />;

  return (
    <div className="catalogue">
      <div className="catalogue-header">
        <div>
          <h2 className="catalogue-title">Course Catalogue</h2>
          <p className="catalogue-sub">{courses.length} courses across B-BBEE, ESG, AI & Compliance</p>
        </div>
      </div>
      <div className="catalogue-controls">
        <input type="search" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} className="catalogue-search" />
        <div className="cat-filters">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`cat-filter ${filter === cat ? 'cat-filter--active' : ''}`} onClick={() => setFilter(cat)}
              style={filter === cat && cat !== 'All' ? { borderColor: CAT_COLOR[cat], color: CAT_COLOR[cat], background: CAT_COLOR[cat] + '15' } : {}}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="catalogue-empty"><p>No courses match your search.</p></div>
      ) : (
        <div className="catalogue-grid">
          {visible.map(c => (
            <CourseCard key={c.id} course={c} enrolled={enrollments.has(c.id)} progress={progress} enroll={enroll} navigateTo={navigateTo} />
          ))}
        </div>
      )}
    </div>
  );
}

function calcPct(course, progress) {
  const all  = course.modules?.flatMap(m => m.lessons?.map(l => l.id) || []) || [];
  const done = all.filter(id => progress[id]);
  return all.length ? Math.round(done.length / all.length * 100) : 0;
}

function CourseCard({ course, enrolled, progress, enroll, navigateTo }) {
  const color  = CAT_COLOR[course.category] || '#06CDE1';
  const pct    = calcPct(course, progress);
  const firstMod = course.modules?.[0];

  return (
    <div className="course-card">
      <div className="cc-header" style={{ borderColor: color + '30' }}>
        <div className="cc-icon" style={{ background: color + '18', borderColor: color + '30' }}>
          <span style={{ color }}>{course.category === 'AI' ? '🤖' : course.category === 'ESG' ? '🌱' : course.category === 'Compliance' ? '⚖️' : '📋'}</span>
        </div>
        <div className="cc-meta">
          <span className="cc-cat" style={{ color, background: color + '12', borderColor: color + '25' }}>{course.category}</span>
          <span className="cc-level" style={{ color: LEVEL_COLOR[course.level] }}>{course.level}</span>
        </div>
      </div>
      <div className="cc-body">
        <h3 className="cc-title">{course.title}</h3>
        <p className="cc-desc">{course.description}</p>
        <div className="cc-instructor">
          <span className="cc-avatar">{course.instructor?.name?.split(' ').map(w=>w[0]).join('')}</span>
          <span className="cc-iname">{course.instructor?.name}</span>
        </div>
        <div className="cc-stats">
          <span>📖 {course.lessonCount} lessons</span>
          <span>⏱ {course.duration}</span>
          <span>👥 {course.enrolled?.toLocaleString()}</span>
        </div>
        <Stars rating={course.rating} />
        {enrolled && pct > 0 && (
          <div className="cc-progress">
            <div className="cc-prog-bar"><div className="cc-prog-fill" style={{ width: `${pct}%`, background: color }} /></div>
            <span className="cc-prog-pct">{pct}%</span>
          </div>
        )}
      </div>
      <div className="cc-footer">
        {!enrolled ? (
          <button className="btn btn-primary cc-btn" onClick={() => { enroll(course.id); navigateTo('lesson', course.id, firstMod?.id); }}>Enrol & Start</button>
        ) : pct === 100 ? (
          <button className="btn btn-outline cc-btn" onClick={() => navigateTo('certificates')}>View Certificate</button>
        ) : (
          <button className="btn btn-primary cc-btn" onClick={() => navigateTo('lesson', course.id, firstMod?.id)}>
            {pct > 0 ? 'Continue' : 'Start Learning'}
          </button>
        )}
      </div>
    </div>
  );
}
