import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import LearnerPortal from './components/LearnerPortal';
import CourseCatalogue from './components/CourseCatalogue';
import LessonPlayer from './components/LessonPlayer';
import Certificate from './components/Certificate';
import AdminDashboard from './components/AdminDashboard';

const STORAGE_KEY = 'okiru_lms';

function loadState() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; }
  catch { return {}; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export default function App() {
  const [user, setUser]                     = useState(null);
  const [view, setView]                     = useState('portal');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const [enrollments, setEnrollments] = useState(() => new Set(loadState().enrollments || []));
  const [progress,    setProgress]    = useState(() => loadState().progress    || {});
  const [quizScores,  setQuizScores]  = useState(() => loadState().quizScores  || {});

  useEffect(() => {
    saveState({ enrollments: [...enrollments], progress, quizScores });
  }, [enrollments, progress, quizScores]);

  const navigateTo = (v, courseId = null, moduleId = null) => {
    setView(v);
    if (courseId !== null) setSelectedCourse(courseId);
    if (moduleId !== null) setSelectedModule(moduleId);
  };

  const enroll             = (courseId) => setEnrollments(prev => new Set([...prev, courseId]));
  const markLessonComplete = (lessonId) => setProgress(prev => ({ ...prev, [lessonId]: true }));
  const saveQuizScore      = (quizId, scoreObj) => setQuizScores(prev => ({ ...prev, [quizId]: scoreObj }));

  const handleLogin  = (userData) => { setUser(userData); setView(userData.role === 'admin' ? 'admin' : 'portal'); };
  const handleLogout = () => { setUser(null); setView('portal'); };

  if (!user) return <Login onLogin={handleLogin} />;

  const ctx = { user, enrollments, progress, quizScores, enroll, markLessonComplete, saveQuizScore, navigateTo };

  const learnerNav = [
    { id: 'portal',       label: 'My Learning',     icon: '🎓' },
    { id: 'catalogue',    label: 'Course Catalogue', icon: '📚' },
    { id: 'certificates', label: 'Certificates',     icon: '🏆' },
  ];
  const adminNav = [
    { id: 'admin',     label: 'Admin Dashboard', icon: '⊞' },
    { id: 'catalogue', label: 'All Courses',      icon: '📚' },
  ];

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        navItems={user.role === 'admin' ? adminNav : learnerNav}
        activeView={view}
        setActiveView={(v) => navigateTo(v)}
        onLogout={handleLogout}
      />
      <div className="app-main">
        <Header user={user} view={view} />
        <main className="app-content">
          {view === 'portal'       && user.role !== 'admin' && <LearnerPortal {...ctx} />}
          {view === 'catalogue'    && <CourseCatalogue {...ctx} />}
          {view === 'lesson'       && <LessonPlayer courseId={selectedCourse} moduleId={selectedModule} {...ctx} />}
          {view === 'certificates' && <Certificate {...ctx} />}
          {view === 'admin'        && user.role === 'admin' && <AdminDashboard {...ctx} />}
        </main>
      </div>
    </div>
  );
}
