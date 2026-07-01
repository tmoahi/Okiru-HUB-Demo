const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const crypto     = require('crypto');
const { Pool }   = require('pg');
const { Resend } = require('resend');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Database ─────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS learners (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL,
      email            TEXT UNIQUE NOT NULL,
      username         TEXT UNIQUE NOT NULL,
      company          TEXT DEFAULT '',
      role             TEXT NOT NULL DEFAULT 'learner',
      avatar           TEXT DEFAULT '',
      password         TEXT NOT NULL,
      status           TEXT DEFAULT 'invited',
      last_login       TIMESTAMPTZ,
      last_seen        TIMESTAMPTZ,
      total_time_secs  INTEGER DEFAULT 0,
      invited_at       TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Other tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      user_id     TEXT NOT NULL,
      course_id   TEXT NOT NULL,
      enrolled_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, course_id)
    );
    CREATE TABLE IF NOT EXISTS lesson_progress (
      user_id      TEXT NOT NULL,
      lesson_id    TEXT NOT NULL,
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS quiz_scores (
      user_id    TEXT NOT NULL,
      quiz_id    TEXT NOT NULL,
      score_data JSONB,
      taken_at   TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, quiz_id)
    );
    CREATE TABLE IF NOT EXISTS reset_tokens (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    );
  `);

  // Seed admin if not present
  await pool.query(`
    INSERT INTO learners (id, name, email, username, company, role, avatar, password, status)
    VALUES ('admin', 'Okiru Admin', 'admin@okiru.co.za', 'admin', 'Okiru', 'admin', 'OK', 'okiru2025', 'active')
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log('[db] tables ready');
}

initDB().catch(err => console.error('[db] init failed:', err.message));

// ─── Email (Resend) ───────────────────────────────────────────────────────────

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const APP_URL        = process.env.APP_URL || 'https://okiru-hub-demo-production-eb58.up.railway.app';
const FROM_EMAIL     = 'Okiru Learn <onboarding@resend.dev>';
const REPLY_TO       = 'tmoahi@okiru.co.za';

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipped');
    return { sent: false, reason: 'RESEND_API_KEY is not configured.' };
  }
  try {
    const resend = new Resend(RESEND_API_KEY);
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html, replyTo: REPLY_TO });
    if (error) { console.error('[email] error:', error.message); return { sent: false, reason: error.message }; }
    console.log('[email] sent to', to, '— id:', data.id);
    return { sent: true };
  } catch (err) {
    console.error('[email] FAILED:', err.message);
    return { sent: false, reason: err.message };
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

function inviteEmailHtml({ name, username, password, loginUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to Okiru Learn</title></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="text-align:center;padding:14px 20px;font-size:13px;color:#888;background:#fff;border-bottom:1px solid #e8e8ee;">Welcome to Okiru Learn – Your Learning Journey Starts Here.</div>
  <div style="background:#fff;padding:12px 40px;text-align:right;border-bottom:1px solid #e8e8ee;">
    <span style="font-size:13px;font-weight:600;color:#1a1a2e;">Learn. Grow. Transform.</span><br>
    <span style="font-size:13px;"><span style="color:#06CDE1;font-weight:600;">Anywhere.</span>&nbsp;<span style="color:#BA0DA7;font-weight:600;">Anytime.</span></span>
  </div>
  <table cellpadding="0" cellspacing="0" style="width:100%;background:#f4f4f8;"><tr><td style="padding:24px 16px;">
  <table cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
    <tr><td style="background:linear-gradient(135deg,#06CDE1 0%,#6A3FBF 50%,#BA0DA7 100%);padding:28px 36px;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:14px;vertical-align:middle;"><img src="https://okiru-hub-demo-production-eb58.up.railway.app/okiru-logo.png" alt="Okiru" width="60" height="60" style="display:block;border-radius:50%;"></td>
        <td style="vertical-align:middle;"><span style="font-size:26px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase;">LEARN</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#13131f;padding:36px 36px 28px;">
      <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
        <td style="padding-right:16px;vertical-align:middle;"><div style="width:52px;height:52px;border-radius:50%;border:2px solid #6A3FBF;background:rgba(106,63,191,0.18);text-align:center;line-height:52px;font-size:22px;display:inline-block;">&#128100;</div></td>
        <td style="vertical-align:middle;"><h2 style="margin:0;font-size:22px;font-weight:800;color:#fff;">You've been invited!</h2></td>
      </tr></table>
      <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.75;">Your administrator has set up an Okiru Learn account for you.<br>Use the credentials below to sign in and start your learning journey.</p>
      <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #2a2a42;border-radius:10px;overflow:hidden;margin-bottom:28px;">
        <tr><td style="padding:13px 18px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;background:#0d0d1a;width:140px;border-bottom:1px solid #2a2a42;">INVITED USER</td><td style="padding:13px 18px;font-size:14px;color:#e2e8f0;background:#0d0d1a;border-bottom:1px solid #2a2a42;border-left:1px solid #2a2a42;">${name}</td></tr>
        <tr><td style="padding:13px 18px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;background:#13131f;border-bottom:1px solid #2a2a42;">USERNAME</td><td style="padding:13px 18px;font-size:14px;color:#e2e8f0;background:#13131f;border-bottom:1px solid #2a2a42;border-left:1px solid #2a2a42;">${username}</td></tr>
        <tr><td style="padding:13px 18px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;background:#0d0d1a;border-bottom:1px solid #2a2a42;">PASSWORD</td><td style="padding:13px 18px;font-family:monospace;font-size:16px;font-weight:700;color:#06CDE1;background:#0d0d1a;border-bottom:1px solid #2a2a42;border-left:1px solid #2a2a42;letter-spacing:0.05em;">${password}</td></tr>
        <tr><td style="padding:13px 18px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;background:#13131f;">LOGIN URL</td><td style="padding:13px 18px;font-size:13px;color:#94a3b8;background:#13131f;border-left:1px solid #2a2a42;">${loginUrl}</td></tr>
      </table>
      <div style="text-align:center;margin-bottom:28px;"><a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#06CDE1 0%,#BA0DA7 100%);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:15px 48px;border-radius:8px;">Sign in to Okiru Learn &rarr;</a></div>
      <p style="font-size:12px;color:#64748b;text-align:center;line-height:1.8;margin:0 0 28px;">This is your temporary password &mdash; you can change it anytime via the<br>&ldquo;Forgot password?&rdquo; link on the login page.</p>
      <div style="border-top:1px solid #2a2a42;margin:0 0 24px;"></div>
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:16px;vertical-align:top;"><div style="width:48px;height:48px;border-radius:50%;border:2px solid #6A3FBF;background:rgba(106,63,191,0.18);text-align:center;line-height:48px;font-size:20px;font-weight:800;color:#9B6FE8;display:inline-block;">?</div></td>
        <td style="vertical-align:middle;"><p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#fff;">Need help?</p><p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">Contact our support team at <a href="mailto:tmoahi@okiru.co.za" style="color:#06CDE1;text-decoration:none;">tmoahi@okiru.co.za</a></p></td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#0d0d1a;padding:22px 36px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;"><tr>
        <td style="vertical-align:middle;"><div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase;">OKIRU</div><div style="font-size:12px;color:#64748b;margin-top:4px;line-height:1.6;">Empowering people.<br>Transforming businesses.</div></td>
        <td style="text-align:right;vertical-align:middle;">
          <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:12px;font-weight:700;color:#94a3b8;margin-left:6px;">in</span>
          <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:14px;color:#94a3b8;margin-left:6px;">&#127760;</span>
          <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:13px;font-weight:700;color:#94a3b8;margin-left:6px;">f</span>
        </td>
      </tr></table>
    </td></tr>
  </table>
  <p style="text-align:center;font-size:11px;color:#aaa;margin:16px 0 0;">&copy; 2026 Okiru Consulting (Pty) Ltd. All rights reserved.</p>
  </td></tr></table>
</body></html>`;
}

function resetEmailHtml({ name, resetUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset your Okiru Learn password</title></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="text-align:center;padding:14px 20px;font-size:13px;color:#888;background:#fff;border-bottom:1px solid #e8e8ee;">Okiru Learn &mdash; Password Reset Request</div>
  <div style="background:#fff;padding:12px 40px;text-align:right;border-bottom:1px solid #e8e8ee;">
    <span style="font-size:13px;font-weight:600;color:#1a1a2e;">Learn. Grow. Transform.</span><br>
    <span style="font-size:13px;"><span style="color:#06CDE1;font-weight:600;">Anywhere.</span>&nbsp;<span style="color:#BA0DA7;font-weight:600;">Anytime.</span></span>
  </div>
  <table cellpadding="0" cellspacing="0" style="width:100%;background:#f4f4f8;"><tr><td style="padding:24px 16px;">
  <table cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
    <tr><td style="background:linear-gradient(135deg,#06CDE1 0%,#6A3FBF 50%,#BA0DA7 100%);padding:28px 36px;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:14px;vertical-align:middle;"><img src="https://okiru-hub-demo-production-eb58.up.railway.app/okiru-logo.png" alt="Okiru" width="60" height="60" style="display:block;border-radius:50%;"></td>
        <td style="vertical-align:middle;"><span style="font-size:26px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase;">LEARN</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#13131f;padding:36px 36px 28px;">
      <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
        <td style="padding-right:16px;vertical-align:middle;"><div style="width:52px;height:52px;border-radius:50%;border:2px solid #6A3FBF;background:rgba(106,63,191,0.18);text-align:center;line-height:52px;font-size:22px;display:inline-block;">&#128274;</div></td>
        <td style="vertical-align:middle;"><h2 style="margin:0;font-size:22px;font-weight:800;color:#fff;">Password reset request</h2></td>
      </tr></table>
      <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;line-height:1.75;">Hi ${name}, we received a request to reset your Okiru Learn password.<br>Click the button below &mdash; this link expires in <strong style="color:#e2e8f0;">1 hour</strong>.</p>
      <div style="text-align:center;margin-bottom:28px;"><a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#06CDE1 0%,#BA0DA7 100%);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:15px 48px;border-radius:8px;">Reset my password &rarr;</a></div>
      <p style="font-size:12px;color:#64748b;text-align:center;line-height:1.8;margin:0 0 28px;">If you didn&rsquo;t request this, you can safely ignore this email.</p>
      <div style="border-top:1px solid #2a2a42;margin:0 0 24px;"></div>
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:16px;vertical-align:top;"><div style="width:48px;height:48px;border-radius:50%;border:2px solid #6A3FBF;background:rgba(106,63,191,0.18);text-align:center;line-height:48px;font-size:20px;font-weight:800;color:#9B6FE8;display:inline-block;">?</div></td>
        <td style="vertical-align:middle;"><p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#fff;">Need help?</p><p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">Contact our support team at <a href="mailto:tmoahi@okiru.co.za" style="color:#06CDE1;text-decoration:none;">tmoahi@okiru.co.za</a></p></td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#0d0d1a;padding:22px 36px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;"><tr>
        <td style="vertical-align:middle;"><div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase;">OKIRU</div><div style="font-size:12px;color:#64748b;margin-top:4px;line-height:1.6;">Empowering people.<br>Transforming businesses.</div></td>
        <td style="text-align:right;vertical-align:middle;">
          <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:12px;font-weight:700;color:#94a3b8;margin-left:6px;">in</span>
          <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:14px;color:#94a3b8;margin-left:6px;">&#127760;</span>
          <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:13px;font-weight:700;color:#94a3b8;margin-left:6px;">f</span>
        </td>
      </tr></table>
    </td></tr>
  </table>
  <p style="text-align:center;font-size:11px;color:#aaa;margin:16px 0 0;">&copy; 2026 Okiru Consulting (Pty) Ltd. All rights reserved.</p>
  </td></tr></table>
</body></html>`;
}

// ─── Course Catalogue (static) ────────────────────────────────────────────────

const COURSES = [
  { id: 'ai-microsoft-office', title: 'Using AI with Microsoft Office (PowerPoint, Excel & Word)', category: 'AI Tools', level: 'Beginner', duration: 'Self-paced', lessonCount: 0, description: 'Artificial Intelligence tools can significantly improve productivity when working with Microsoft Word, Excel and PowerPoint.', zohoUrl: 'https://okiru-training.zoholearn.com/c/using-ai-with-microsoft-office', instructor: { name: 'Okiru Learn', title: 'Okiru' }, enrolled: 0, completionRate: 0, rating: 0, reviews: 0, color: '#06CDE1', modules: [] },
  { id: 'safe-ai-compliance', title: 'Safe AI Use & Compliance', category: 'AI & Compliance', level: 'Intermediate', duration: 'Self-paced', lessonCount: 0, description: 'Safe AI Use & Compliance equips professionals with the knowledge and practical tools to use AI responsibly.', zohoUrl: 'https://okiru-training.zoholearn.com/c/safe-ai-use-compliance', instructor: { name: 'Okiru Learn', title: 'Okiru' }, enrolled: 0, completionRate: 0, rating: 0, reviews: 0, color: '#10e8a0', modules: [] },
  { id: 'ai-reporting-analysis', title: 'AI-powered Reporting & Analysis', category: 'AI Tools', level: 'Intermediate', duration: 'Self-paced', lessonCount: 0, description: 'A fast, hands-on session that teaches professionals how to use generative AI to turn messy information into clear reports.', zohoUrl: 'https://okiru-training.zoholearn.com/c/ai-powered-reporting-analysis', instructor: { name: 'Okiru Learn', title: 'Okiru' }, enrolled: 0, completionRate: 0, rating: 0, reviews: 0, color: '#FF7512', modules: [] },
  { id: 'prompt-mastery', title: 'Prompt Mastery & Creativity', category: 'AI Tools', level: 'Beginner', duration: 'Self-paced', lessonCount: 0, description: 'Prompt Mastery & Creativity teaches professionals how to communicate effectively with generative AI.', zohoUrl: 'https://okiru-training.zoholearn.com/c/prompt-mastery-creativity', instructor: { name: 'Okiru Learn', title: 'Okiru' }, enrolled: 0, completionRate: 0, rating: 0, reviews: 0, color: '#BA0DA7', modules: [] },
  { id: 'mastering-claude-ai', title: 'Mastering Claude AI — From Beginner to Power User', category: 'AI Tools', level: 'Beginner', duration: '6h', lessonCount: 43, description: 'Master Claude AI across real-world professional scenarios and unlock a new level of productivity and creative thinking.', zohoUrl: 'https://okiru-training.zoholearn.com/c/mastering-claude-ai', instructor: { name: 'Tshiamo Moahi', title: 'Founder, Okiru' }, enrolled: 0, completionRate: 0, rating: 0, reviews: 0, color: '#60a5fa', modules: [] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generatePassword() {
  const words = ['Train', 'Learn', 'Grow', 'Build', 'Rise', 'Lead', 'Excel', 'Thrive'];
  const word  = words[Math.floor(Math.random() * words.length)];
  const num   = Math.floor(100 + Math.random() * 900);
  const syms  = '!@#$%';
  return `${word}${num}${syms[Math.floor(Math.random() * syms.length)]}`;
}

async function generateUsername(name) {
  const parts   = name.trim().split(/\s+/);
  const base    = (parts[0][0] + (parts.slice(1).join('') || parts[0])).toLowerCase().replace(/[^a-z0-9]/g, '');
  let username  = base;
  let counter   = 2;
  while (true) {
    const { rows } = await pool.query('SELECT id FROM learners WHERE username = $1', [username]);
    if (rows.length === 0) break;
    username = base + counter++;
  }
  return username;
}

function formatTime(seconds) {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function safeUser(row) {
  return {
    id:               row.id,
    name:             row.name,
    email:            row.email,
    username:         row.username,
    company:          row.company,
    role:             row.role,
    avatar:           row.avatar,
    status:           row.status,
    lastLogin:        row.last_login,
    lastSeen:         row.last_seen,
    totalTimeSeconds: row.total_time_secs,
    invitedAt:        row.invited_at,
    timeFormatted:    formatTime(row.total_time_secs),
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/courses', (req, res) => res.json({ success: true, data: COURSES }));

app.get('/api/courses/:id', (req, res) => {
  const course = COURSES.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: course });
});

// ── Learner progress (DB-backed) ──────────────────────────────────────────────

// Load all progress for a user
app.get('/api/learner/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [enrollRes, progressRes, quizRes] = await Promise.all([
      pool.query('SELECT course_id FROM enrollments WHERE user_id = $1', [userId]),
      pool.query('SELECT lesson_id FROM lesson_progress WHERE user_id = $1', [userId]),
      pool.query('SELECT quiz_id, score_data FROM quiz_scores WHERE user_id = $1', [userId]),
    ]);
    const enrollments = enrollRes.rows.map(r => r.course_id);
    const progress    = Object.fromEntries(progressRes.rows.map(r => [r.lesson_id, true]));
    const quizScores  = Object.fromEntries(quizRes.rows.map(r => [r.quiz_id, r.score_data]));
    res.json({ success: true, data: { enrollments, progress, quizScores } });
  } catch (err) {
    console.error('[progress] load error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Enrol in a course
app.post('/api/learner/enroll', async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, courseId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark a lesson complete
app.post('/api/learner/lesson-complete', async (req, res) => {
  const { userId, lessonId } = req.body;
  try {
    await pool.query(
      'INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, lessonId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save quiz score
app.post('/api/learner/quiz-score', async (req, res) => {
  const { userId, quizId, scoreData } = req.body;
  try {
    await pool.query(
      `INSERT INTO quiz_scores (user_id, quiz_id, score_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, quiz_id) DO UPDATE SET score_data = $3, taken_at = NOW()`,
      [userId, quizId, JSON.stringify(scoreData)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Heartbeat
app.post('/api/learner/heartbeat', async (req, res) => {
  const { userId, seconds } = req.body;
  try {
    await pool.query(
      'UPDATE learners SET total_time_secs = total_time_secs + $1, last_seen = NOW() WHERE id = $2',
      [seconds || 30, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Admin ─────────────────────────────────────────────────────────────────────

app.get('/api/admin/stats', async (req, res) => {
  try {
    const { rows: learners } = await pool.query("SELECT * FROM learners WHERE role = 'learner'");
    const active = learners.filter(u => u.status === 'active').length;
    res.json({
      success: true,
      data: {
        totalLearners:       learners.length,
        activeLearners:      active,
        activeCourses:       COURSES.length,
        completionRate:      '—',
        certificatesIssued:  0,
        enrollmentsThisMonth: learners.length,
        avgRating:           '—',
        courseStats: COURSES.map(c => ({
          id: c.id, title: c.title, category: c.category,
          enrolled: 0, completionRate: 0, rating: 0, completed: 0,
        })),
        recentLearners: learners.slice(-10).reverse().map(u => ({
          name: u.name, email: u.email, company: u.company,
          enrolled: 0, completed: 0,
          lastActive: u.last_seen || u.last_login || 'Never',
          status: u.status,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/learners', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM learners WHERE role = 'learner' ORDER BY invited_at DESC");
    res.json({ success: true, data: rows.map(safeUser) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/invite', async (req, res) => {
  const { name, email, company } = req.body;
  if (!name || !email) return res.status(400).json({ success: false, error: 'Name and email are required.' });

  try {
    const exists = await pool.query('SELECT id FROM learners WHERE email = $1', [email.toLowerCase().trim()]);
    if (exists.rows.length) return res.status(409).json({ success: false, error: 'A user with this email already exists.' });

    const username = await generateUsername(name);
    const password = generatePassword();
    const id       = `learner_${Date.now()}`;
    const avatar   = name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    console.log('[invite] inserting learner', id, email.trim().toLowerCase());
    await pool.query(
      `INSERT INTO learners (id, name, email, username, company, role, avatar, password, status, invited_at)
       VALUES ($1,$2,$3,$4,$5,'learner',$6,$7,'invited',NOW())`,
      [id, name.trim(), email.trim().toLowerCase(), username, company || '', avatar, password]
    );
    console.log('[invite] insert OK');

    const emailResult = await sendEmail({
      to: email.trim().toLowerCase(),
      subject: `You've been invited to Okiru Learn`,
      html: inviteEmailHtml({ name: name.trim(), username, password, loginUrl: APP_URL }),
    });

    res.json({
      success: true,
      data: { id, name: name.trim(), email: email.trim().toLowerCase(), username, company: company || '', password, loginUrl: APP_URL, emailSent: emailResult.sent, emailNote: emailResult.sent ? null : emailResult.reason },
    });
  } catch (err) {
    console.error('[invite] FAILED:', err.message, err.stack);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/learners/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM learners WHERE id = $1 AND role = 'learner'", [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, error: 'Learner not found.' });
    // Also clean up their progress
    await Promise.all([
      pool.query('DELETE FROM enrollments WHERE user_id = $1', [req.params.id]),
      pool.query('DELETE FROM lesson_progress WHERE user_id = $1', [req.params.id]),
      pool.query('DELETE FROM quiz_scores WHERE user_id = $1', [req.params.id]),
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/test-email', async (req, res) => {
  const { to } = req.body;
  if (!RESEND_API_KEY) return res.json({ configured: false, error: 'RESEND_API_KEY not set.' });
  if (!to) return res.status(400).json({ success: false, error: 'Provide a "to" address.' });
  const result = await sendEmail({ to, subject: 'Okiru Learn — Email test ✅', html: '<p style="font-family:sans-serif">Email working ✅</p>' });
  res.json({ configured: true, ...result });
});

// ── Auth ──────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const identifier = (email || '').toLowerCase().trim();
  try {
    const { rows } = await pool.query(
      'SELECT * FROM learners WHERE (email = $1 OR username = $1) AND password = $2',
      [identifier, password]
    );
    if (!rows.length) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const user = rows[0];
    await pool.query(
      "UPDATE learners SET last_login = NOW(), status = CASE WHEN status = 'invited' THEN 'active' ELSE status END WHERE id = $1",
      [user.id]
    );
    res.json({ success: true, data: safeUser({ ...user, status: user.status === 'invited' ? 'active' : user.status }) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });
  try {
    const { rows } = await pool.query('SELECT * FROM learners WHERE email = $1', [email.toLowerCase().trim()]);
    if (!rows.length) return res.json({ success: true });
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await pool.query('INSERT INTO reset_tokens (token, user_id, expires_at) VALUES ($1,$2,$3)', [token, rows[0].id, expiresAt]);
    await sendEmail({ to: rows[0].email, subject: 'Okiru Learn — Password Reset', html: resetEmailHtml({ name: rows[0].name, resetUrl: `${APP_URL}?reset=${token}` }) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ success: false, error: 'Token and password required.' });
  try {
    const { rows } = await pool.query('SELECT * FROM reset_tokens WHERE token = $1', [token]);
    if (!rows.length) return res.status(400).json({ success: false, error: 'Invalid or expired reset link.' });
    if (new Date() > new Date(rows[0].expires_at)) {
      await pool.query('DELETE FROM reset_tokens WHERE token = $1', [token]);
      return res.status(400).json({ success: false, error: 'This reset link has expired. Please request a new one.' });
    }
    await pool.query('UPDATE learners SET password = $1 WHERE id = $2', [password, rows[0].user_id]);
    await pool.query('DELETE FROM reset_tokens WHERE token = $1', [token]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.get('/api/debug', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role FROM learners');
    res.json({ version: 'db-v2', dbConnected: true, learners: rows });
  } catch (err) {
    res.json({ version: 'db-v2', dbConnected: false, error: err.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
}

app.listen(PORT, () => console.log(`Okiru Learn running on port ${PORT}`));
module.exports = app;
