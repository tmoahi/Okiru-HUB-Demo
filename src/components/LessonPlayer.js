import React, { useEffect, useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './LessonPlayer.css';

const CAT_COLOR = { 'B-BBEE': '#06CDE1', 'ESG': '#10e8a0', 'AI': '#BA0DA7', 'Compliance': '#FF7512' };

function renderContent(text) {
  if (!text) return null;
  return text.split('\n\n').map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    const nodes = parts.map((p, j) => p.startsWith('**') ? <strong key={j}>{p.slice(2,-2)}</strong> : p);
    if (para.startsWith('- ')) {
      const items = para.split('\n').filter(l => l.startsWith('- '));
      return <ul key={i}>{items.map((li, k) => <li key={k}>{li.slice(2)}</li>)}</ul>;
    }
    if (para.trim() === '') return null;
    return <p key={i}>{nodes}</p>;
  });
}

function Quiz({ quiz, quizScores, saveQuizScore, onDone }) {
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(!!quizScores[quiz.id]);
  const [result,    setResult]    = useState(quizScores[quiz.id] || null);

  const submit = () => {
    const correct = quiz.questions.filter(q => answers[q.id] === q.correct).length;
    const total   = quiz.questions.length;
    const passed  = correct / total >= 0.7;
    const res     = { correct, total, passed, score: Math.round(correct / total * 100) };
    setResult(res);
    setSubmitted(true);
    saveQuizScore(quiz.id, res);
  };

  const allAnswered = quiz.questions.every(q => answers[q.id] !== undefined);

  if (submitted && result) {
    return (
      <div className="quiz-result">
        <div className={`quiz-result-icon ${result.passed ? 'quiz-result-icon--pass' : 'quiz-result-icon--fail'}`}>
          {result.passed ? '🎉' : '📝'}
        </div>
        <h3 className={result.passed ? 'quiz-pass' : 'quiz-fail'}>{result.passed ? 'Passed!' : 'Not quite'}</h3>
        <p className="quiz-score">{result.correct}/{result.total} correct — {result.score}%</p>
        <p className="quiz-msg">{result.passed ? 'Great work. This module is complete.' : 'You need 70% to pass. Review the lessons and try again.'}</p>
        {result.passed && <button className="btn btn-primary" onClick={onDone}>Continue</button>}
        {!result.passed && <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setAnswers({}); setResult(null); }}>Retry Quiz</button>}
      </div>
    );
  }

  return (
    <div className="quiz">
      <h3 className="quiz-title">{quiz.title}</h3>
      <p className="quiz-subtitle">Answer all questions. 70% required to pass.</p>
      <div className="quiz-questions">
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="quiz-q">
            <p className="quiz-q-text"><span className="quiz-q-num">Q{qi+1}.</span> {q.question}</p>
            <div className="quiz-options">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  className={`quiz-option ${answers[q.id] === oi ? 'quiz-option--selected' : ''}`}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                >
                  <span className="quiz-opt-letter">{String.fromCharCode(65+oi)}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary quiz-submit" disabled={!allAnswered} onClick={submit}>
        Submit Answers
      </button>
    </div>
  );
}

export default function LessonPlayer({ courseId, moduleId, progress, quizScores, markLessonComplete, saveQuizScore, navigateTo }) {
  const [course,        setCourse]       = useState(null);
  const [activeModule,  setActiveModule] = useState(null);
  const [activeLesson,  setActiveLesson] = useState(null);
  const [showQuiz,      setShowQuiz]     = useState(false);
  const [videoProgress, setVideoProgress]= useState(0);
  const [videoPlaying,  setVideoPlaying] = useState(false);
  const [loading,       setLoading]      = useState(true);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/courses/${courseId}`)
      .then(r => r.json())
      .then(j => {
        setCourse(j.data);
        const mod = j.data.modules.find(m => m.id === moduleId) || j.data.modules[0];
        setActiveModule(mod);
        setActiveLesson(mod.lessons[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId, moduleId]);

  const selectLesson = useCallback((mod, lesson) => {
    setActiveModule(mod);
    setActiveLesson(lesson);
    setShowQuiz(false);
    setVideoProgress(0);
    setVideoPlaying(false);
  }, []);

  const allLessonsInModuleDone = useCallback((mod) => {
    return mod.lessons.every(l => progress[l.id]);
  }, [progress]);

  const markDone = () => {
    if (activeLesson) markLessonComplete(activeLesson.id);
  };

  const goNext = () => {
    if (!course || !activeModule || !activeLesson) return;
    const lessons = activeModule.lessons;
    const idx     = lessons.findIndex(l => l.id === activeLesson.id);
    if (idx < lessons.length - 1) { selectLesson(activeModule, lessons[idx + 1]); return; }
    if (allLessonsInModuleDone(activeModule)) { setShowQuiz(true); return; }
    const mods = course.modules;
    const mIdx = mods.findIndex(m => m.id === activeModule.id);
    if (mIdx < mods.length - 1) { const nextMod = mods[mIdx+1]; selectLesson(nextMod, nextMod.lessons[0]); }
  };

  if (loading || !course) return <LoadingSpinner message="Loading lesson…" />;

  const color      = CAT_COLOR[course.category] || '#06CDE1';
  const allModsDone = course.modules.every(m => allLessonsInModuleDone(m) && quizScores[m.quiz?.id]?.passed);

  return (
    <div className="player">
      <div className="player-sidebar">
        <div className="player-course-title">
          <span className="player-cat" style={{ color, borderColor: color+'33', background: color+'11' }}>{course.category}</span>
          <p className="player-title">{course.title}</p>
        </div>
        <div className="player-modules">
          {course.modules.map(mod => {
            const modDone = allLessonsInModuleDone(mod);
            const quizPassed = quizScores[mod.quiz?.id]?.passed;
            return (
              <div key={mod.id} className={`player-mod ${activeModule?.id === mod.id ? 'player-mod--active' : ''}`}>
                <div className="player-mod-header" onClick={() => selectLesson(mod, mod.lessons[0])}>
                  <span className="player-mod-check">{quizPassed ? '✓' : modDone ? '◑' : '○'}</span>
                  <span className="player-mod-name">{mod.title}</span>
                </div>
                {activeModule?.id === mod.id && (
                  <div className="player-lessons">
                    {mod.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        className={`player-lesson ${activeLesson?.id === lesson.id && !showQuiz ? 'player-lesson--active' : ''}`}
                        onClick={() => selectLesson(mod, lesson)}
                      >
                        <span className="pl-check">{progress[lesson.id] ? '✓' : '○'}</span>
                        <span className="pl-title">{lesson.title}</span>
                        <span className="pl-meta">{lesson.type === 'video' ? '▶' : '📄'} {lesson.duration}</span>
                      </button>
                    ))}
                    {modDone && (
                      <button
                        className={`player-lesson player-lesson--quiz ${showQuiz ? 'player-lesson--active' : ''}`}
                        onClick={() => setShowQuiz(true)}
                      >
                        <span className="pl-check">{quizScores[mod.quiz?.id]?.passed ? '✓' : '○'}</span>
                        <span className="pl-title">{mod.quiz?.title}</span>
                        <span className="pl-meta">📝 Quiz</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {allModsDone && (
          <button className="btn btn-primary player-cert-btn" onClick={() => navigateTo('certificates')}>
            🏆 View Certificate
          </button>
        )}
      </div>

      <div className="player-main">
        {showQuiz && activeModule ? (
          <div className="player-content">
            <Quiz
              quiz={activeModule.quiz}
              quizScores={quizScores}
              saveQuizScore={saveQuizScore}
              onDone={() => {
                setShowQuiz(false);
                const mods  = course.modules;
                const mIdx  = mods.findIndex(m => m.id === activeModule.id);
                if (mIdx < mods.length - 1) { const next = mods[mIdx+1]; selectLesson(next, next.lessons[0]); }
              }}
            />
          </div>
        ) : activeLesson ? (
          <div className="player-content">
            <div className="lesson-header">
              <div>
                <p className="lesson-module-name">{activeModule?.title}</p>
                <h2 className="lesson-title">{activeLesson.title}</h2>
              </div>
              <span className="lesson-type">{activeLesson.type === 'video' ? '▶ Video' : '📄 Reading'} · {activeLesson.duration}</span>
            </div>

            {activeLesson.type === 'video' && (
              <div className="video-player">
                <div className="video-thumb" style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)`, borderColor: color+'25' }}>
                  <button className="video-play-btn" style={{ background: color }} onClick={() => { setVideoPlaying(true); const interval = setInterval(() => setVideoProgress(p => { if (p >= 100) { clearInterval(interval); setVideoPlaying(false); markDone(); return 100; } return p + 0.5; }), 80); }}>
                    {videoPlaying ? '⏸' : videoProgress >= 100 ? '↺' : '▶'}
                  </button>
                  <span className="video-label">{videoProgress >= 100 ? 'Completed' : videoPlaying ? 'Playing…' : 'Click to play'}</span>
                </div>
                <div className="video-progress">
                  <div className="video-bar"><div className="video-fill" style={{ width: `${videoProgress}%`, background: color }} /></div>
                  <span className="video-pct">{Math.round(videoProgress)}%</span>
                </div>
              </div>
            )}

            <div className="lesson-body">
              {renderContent(activeLesson.content)}
            </div>

            <div className="lesson-actions">
              {!progress[activeLesson.id] && (
                <button className="btn btn-primary" onClick={() => { markDone(); }}>Mark Complete ✓</button>
              )}
              {progress[activeLesson.id] && (
                <span className="lesson-done-badge">✓ Completed</span>
              )}
              <button className="btn btn-ghost" onClick={goNext}>
                {allLessonsInModuleDone(activeModule) && !quizScores[activeModule.quiz?.id]?.passed ? 'Take Quiz →' : 'Next Lesson →'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
