const express = require('express');
const cors    = require('cors');
const path    = require('path');
const crypto  = require('crypto');
const { Resend } = require('resend');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Email (Resend) ───────────────────────────────────────────────────────────

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const APP_URL        = process.env.APP_URL || 'https://okiru-hub-demo-production-eb58.up.railway.app';
const FROM_EMAIL     = 'Okiru Learn <onboarding@resend.dev>';

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — email skipped');
    return { sent: false, reason: 'RESEND_API_KEY is not configured on the server.' };
  }
  try {
    const resend = new Resend(RESEND_API_KEY);
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) {
      console.error('[email] Resend error:', error.message);
      return { sent: false, reason: error.message };
    }
    console.log('[email] sent OK to', to, '— id:', data.id);
    return { sent: true };
  } catch (err) {
    console.error('[email] FAILED:', err.message);
    return { sent: false, reason: err.message };
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

function inviteEmailHtml({ name, username, password, loginUrl }) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { margin:0; padding:0; background:#0a0a0f; font-family: 'Segoe UI', Arial, sans-serif; color:#e2e8f0; }
  .wrap { max-width:560px; margin:40px auto; background:#12121a; border:1px solid #1e2030; border-radius:16px; overflow:hidden; }
  .header { background: linear-gradient(135deg, #06CDE1 0%, #BA0DA7 100%); padding:32px 40px; }
  .header h1 { margin:0; font-size:24px; font-weight:700; color:#fff; }
  .header p  { margin:6px 0 0; font-size:13px; color:rgba(255,255,255,0.8); }
  .body { padding:36px 40px; }
  .body h2 { font-size:18px; font-weight:700; margin:0 0 12px; color:#f1f5f9; }
  .body p  { font-size:14px; line-height:1.6; color:#94a3b8; margin:0 0 20px; }
  .creds { background:#0a0a0f; border:1px solid #1e2030; border-radius:10px; overflow:hidden; margin:24px 0; }
  .cred-row { display:flex; align-items:center; padding:12px 18px; border-bottom:1px solid #1e2030; }
  .cred-row:last-child { border-bottom:none; }
  .cred-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#64748b; width:120px; flex-shrink:0; }
  .cred-value { font-size:14px; color:#f1f5f9; font-weight:500; }
  .cred-pw    { font-family:monospace; color:#06CDE1; font-size:16px; font-weight:700; letter-spacing:0.05em; }
  .btn { display:inline-block; background:linear-gradient(135deg,#06CDE1,#BA0DA7); color:#fff; text-decoration:none; font-weight:700; font-size:14px; padding:13px 28px; border-radius:8px; margin-top:8px; }
  .note { font-size:12px; color:#64748b; margin-top:24px; padding-top:20px; border-top:1px solid #1e2030; line-height:1.6; }
  .footer { background:#0a0a0f; padding:20px 40px; font-size:11px; color:#475569; text-align:center; border-top:1px solid #1e2030; }
</style></head><body>
<div class="wrap">
  <div class="header">
    <h1>Okiru Learn</h1>
    <p>Professional Learning Platform</p>
  </div>
  <div class="body">
    <h2>You've been invited, ${name}!</h2>
    <p>Your administrator has set up an Okiru Learn account for you. Use the credentials below to sign in and start your learning journey.</p>
    <div class="creds">
      <div class="cred-row"><span class="cred-label">Username</span><span class="cred-value">${username}</span></div>
      <div class="cred-row"><span class="cred-label">Password</span><span class="cred-value cred-pw">${password}</span></div>
      <div class="cred-row"><span class="cred-label">Login URL</span><span class="cred-value">${loginUrl}</span></div>
    </div>
    <a href="${loginUrl}" class="btn">Sign in to Okiru Learn →</a>
    <p class="note">
      This is your temporary password — you can change it anytime via the "Forgot password?" link on the login page.
      If you believe you received this email in error, please ignore it.
    </p>
  </div>
  <div class="footer">© Okiru Learn · okiru.co.za</div>
</div>
</body></html>`;
}

function resetEmailHtml({ name, resetUrl }) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { margin:0; padding:0; background:#0a0a0f; font-family: 'Segoe UI', Arial, sans-serif; color:#e2e8f0; }
  .wrap { max-width:560px; margin:40px auto; background:#12121a; border:1px solid #1e2030; border-radius:16px; overflow:hidden; }
  .header { background: linear-gradient(135deg, #06CDE1 0%, #BA0DA7 100%); padding:32px 40px; }
  .header h1 { margin:0; font-size:24px; font-weight:700; color:#fff; }
  .header p  { margin:6px 0 0; font-size:13px; color:rgba(255,255,255,0.8); }
  .body { padding:36px 40px; }
  .body h2 { font-size:18px; font-weight:700; margin:0 0 12px; color:#f1f5f9; }
  .body p  { font-size:14px; line-height:1.6; color:#94a3b8; margin:0 0 20px; }
  .btn { display:inline-block; background:linear-gradient(135deg,#06CDE1,#BA0DA7); color:#fff; text-decoration:none; font-weight:700; font-size:14px; padding:13px 28px; border-radius:8px; }
  .note { font-size:12px; color:#64748b; margin-top:24px; padding-top:20px; border-top:1px solid #1e2030; line-height:1.6; }
  .footer { background:#0a0a0f; padding:20px 40px; font-size:11px; color:#475569; text-align:center; border-top:1px solid #1e2030; }
</style></head><body>
<div class="wrap">
  <div class="header">
    <h1>Okiru Learn</h1>
    <p>Professional Learning Platform</p>
  </div>
  <div class="body">
    <h2>Password reset request</h2>
    <p>Hi ${name}, we received a request to reset your Okiru Learn password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
    <a href="${resetUrl}" class="btn">Reset my password →</a>
    <p class="note">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
  </div>
  <div class="footer">© Okiru Learn · okiru.co.za</div>
</div>
</body></html>`;
}

// ─── Course Catalogue ─────────────────────────────────────────────────────────

const COURSES = [
  {
    id: 'ai-microsoft-office',
    title: 'Using AI with Microsoft Office (PowerPoint, Excel & Word)',
    category: 'AI Tools', level: 'Beginner', duration: 'Self-paced', lessonCount: 0,
    description: 'Artificial Intelligence tools can significantly improve productivity when working with Microsoft Word, Excel and PowerPoint. They help users write documents faster, summarise content, analyse data, and create presentations with ease.',
    zohoUrl: 'https://okiru-training.zoholearn.com/c/using-ai-with-microsoft-office',
    instructor: { name: 'Okiru Learn', title: 'Okiru' },
    enrolled: 0, completionRate: 0, rating: 0, reviews: 0, color: '#06CDE1', modules: [],
  },
  {
    id: 'safe-ai-compliance',
    title: 'Safe AI Use & Compliance',
    category: 'AI & Compliance', level: 'Intermediate', duration: 'Self-paced', lessonCount: 0,
    description: 'Safe AI Use & Compliance equips professionals with the knowledge and practical tools to use AI responsibly, securely, and in alignment with organisational policies, ethical guidelines, and emerging regulatory frameworks.',
    zohoUrl: 'https://okiru-training.zoholearn.com/c/safe-ai-use-compliance',
    instructor: { name: 'Okiru Learn', title: 'Okiru' },
    enrolled: 0, completionRate: 0, rating: 0, reviews: 0, color: '#10e8a0', modules: [],
  },
  {
    id: 'ai-reporting-analysis',
    title: 'AI-powered Reporting & Analysis',
    category: 'AI Tools', level: 'Intermediate', duration: 'Self-paced', lessonCount: 0,
    description: 'A fast, hands-on session that teaches professionals how to use generative AI to turn messy information into clear reports, insights, and recommendations — without needing advanced technical skills.',
    zohoUrl: 'https://okiru-training.zoholearn.com/c/ai-powered-reporting-analysis',
    instructor: { name: 'Okiru Learn', title: 'Okiru' },
    enrolled: 0, completionRate: 0, rating: 0, reviews: 0, color: '#FF7512', modules: [],
  },
  {
    id: 'prompt-mastery',
    title: 'Prompt Mastery & Creativity',
    category: 'AI Tools', level: 'Beginner', duration: 'Self-paced', lessonCount: 0,
    description: 'Prompt Mastery & Creativity is a practical, hands-on course that teaches professionals how to communicate effectively with generative AI to unlock high-quality, reliable, and creative outputs across any professional context.',
    zohoUrl: 'https://okiru-training.zoholearn.com/c/prompt-mastery-creativity',
    instructor: { name: 'Okiru Learn', title: 'Okiru' },
    enrolled: 0, completionRate: 0, rating: 0, reviews: 0, color: '#BA0DA7', modules: [],
  },
  {
    id: 'mastering-claude-ai',
    title: 'Mastering Claude AI — From Beginner to Power User',
    category: 'AI Tools', level: 'Beginner', duration: '6h', lessonCount: 43,
    description: 'This course is designed to take you from complete beginner to confident, high-impact AI user. Master Claude AI across real-world professional scenarios and unlock a new level of productivity and creative thinking.',
    zohoUrl: 'https://okiru-training.zoholearn.com/c/mastering-claude-ai',
    instructor: { name: 'Tshiamo Moahi', title: 'Founder, Okiru' },
    enrolled: 0, completionRate: 0, rating: 0, reviews: 0, color: '#60a5fa', modules: [],
  },
];

// ─── Users ────────────────────────────────────────────────────────────────────

const USERS = [
  {
    id: 'admin',
    name: 'Okiru Admin',
    email: 'admin@okiru.co.za',
    username: 'admin',
    company: 'Okiru',
    role: 'admin',
    avatar: 'OK',
    password: 'okiru2025',
    enrolledCourses: [],
    completedCourses: [],
    invitedAt: null,
    status: 'active',
    lastLogin: null,
    totalTimeSeconds: 0,
  },
];

// Reset tokens: { token: { userId, expiresAt } }
const RESET_TOKENS = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generatePassword() {
  const words  = ['Train', 'Learn', 'Grow', 'Build', 'Rise', 'Lead', 'Excel', 'Thrive'];
  const word   = words[Math.floor(Math.random() * words.length)];
  const num    = Math.floor(100 + Math.random() * 900);
  const syms   = '!@#$%';
  const sym    = syms[Math.floor(Math.random() * syms.length)];
  return `${word}${num}${sym}`;
}

function generateUsername(name) {
  const parts    = name.trim().split(/\s+/);
  const first    = parts[0] || '';
  const surname  = parts.slice(1).join('') || first;
  const base     = (first[0] + surname).toLowerCase().replace(/[^a-z0-9]/g, '');
  // Ensure unique
  let username = base;
  let counter  = 2;
  while (USERS.find(u => u.username === username)) {
    username = base + counter++;
  }
  return username;
}

function formatTime(seconds) {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function buildStats() {
  const learners = USERS.filter(u => u.role === 'learner');
  const active   = learners.filter(u => u.status === 'active').length;
  return {
    totalLearners: learners.length,
    activeLearners: active,
    activeCourses: COURSES.length,
    completionRate: '—',
    certificatesIssued: 0,
    enrollmentsThisMonth: learners.length,
    avgRating: '—',
    courseStats: COURSES.map(c => ({
      id: c.id, title: c.title, category: c.category,
      enrolled: c.enrolled, completionRate: c.completionRate, rating: c.rating, completed: 0,
    })),
    recentLearners: learners.slice(-10).reverse().map(u => ({
      name: u.name, email: u.email, company: u.company,
      enrolled: 0, completed: 0,
      lastActive: u.lastSeen || u.lastLogin || 'Never',
      status: u.status || 'invited',
    })),
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/courses', (req, res) => {
  res.json({ success: true, data: COURSES });
});

app.get('/api/courses/:id', (req, res) => {
  const course = COURSES.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: course });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({ success: true, data: buildStats() });
});

app.get('/api/admin/learners', (req, res) => {
  const learners = USERS
    .filter(u => u.role === 'learner')
    .map(({ password: _pw, ...u }) => ({
      ...u,
      timeFormatted: formatTime(u.totalTimeSeconds),
    }));
  res.json({ success: true, data: learners });
});

// POST — invite a new learner (creates account + sends email)
app.post('/api/admin/invite', async (req, res) => {
  const { name, email, company } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }
  if (USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ success: false, error: 'A user with this email already exists.' });
  }

  const username    = generateUsername(name);
  const password    = generatePassword();
  const id          = `learner_${Date.now()}`;

  const newUser = {
    id,
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    username,
    company:   company ? company.trim() : '',
    role:      'learner',
    avatar:    name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    password,
    enrolledCourses:  [],
    completedCourses: [],
    invitedAt:        new Date().toISOString(),
    status:           'invited',
    lastLogin:        null,
    totalTimeSeconds: 0,
  };

  USERS.push(newUser);

  // Send invitation email
  const emailResult = await sendEmail({
    to: newUser.email,
    subject: `You've been invited to Okiru Learn`,
    html: inviteEmailHtml({ name: newUser.name, username, password, loginUrl: APP_URL }),
  });

  res.json({
    success: true,
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username,
      company: newUser.company,
      password,
      loginUrl: APP_URL,
      emailSent: emailResult.sent,
      emailNote: emailResult.sent ? null : (emailResult.reason || 'Email could not be sent — share credentials manually.'),
    },
  });
});

// DELETE — remove a learner
app.delete('/api/admin/learners/:id', (req, res) => {
  const idx = USERS.findIndex(u => u.id === req.params.id && u.role === 'learner');
  if (idx === -1) return res.status(404).json({ success: false, error: 'Learner not found.' });
  USERS.splice(idx, 1);
  res.json({ success: true });
});

// POST — login (accepts email or username)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const identifier = (email || '').toLowerCase();
  const user = USERS.find(u =>
    (u.email === identifier || u.username === identifier) && u.password === password
  );
  if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

  // Update login tracking
  user.lastLogin = new Date().toISOString();
  if (user.status === 'invited') user.status = 'active';

  const { password: _pw, ...safe } = user;
  res.json({ success: true, data: safe });
});

// POST — heartbeat (called every 30s while learner is in the LMS)
app.post('/api/learner/heartbeat', (req, res) => {
  const { userId, seconds } = req.body;
  const user = USERS.find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false });
  user.totalTimeSeconds = (user.totalTimeSeconds || 0) + (seconds || 30);
  user.lastSeen = new Date().toISOString();
  res.json({ success: true });
});

// POST — forgot password (send reset email)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });

  const user = USERS.find(u => u.email === email.toLowerCase().trim());
  // Always return success to avoid user enumeration
  if (!user) return res.json({ success: true });

  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  RESET_TOKENS[token] = { userId: user.id, expiresAt };

  const resetUrl = `${APP_URL}?reset=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Okiru Learn — Password Reset',
    html: resetEmailHtml({ name: user.name, resetUrl }),
  });

  res.json({ success: true });
});

// POST — reset password
app.post('/api/auth/reset-password', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ success: false, error: 'Token and password are required.' });

  const record = RESET_TOKENS[token];
  if (!record) return res.status(400).json({ success: false, error: 'Invalid or expired reset link.' });
  if (Date.now() > record.expiresAt) {
    delete RESET_TOKENS[token];
    return res.status(400).json({ success: false, error: 'This reset link has expired. Please request a new one.' });
  }

  const user = USERS.find(u => u.id === record.userId);
  if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

  user.password = password;
  delete RESET_TOKENS[token];

  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Email config check (admin use only — shows whether vars are set and attempts a test send)
app.post('/api/admin/test-email', async (req, res) => {
  const { to } = req.body;
  if (!RESEND_API_KEY) {
    return res.json({
      configured: false,
      error: 'RESEND_API_KEY environment variable is not set on the server.',
    });
  }
  if (!to) return res.status(400).json({ success: false, error: 'Provide a "to" email address.' });
  const result = await sendEmail({
    to,
    subject: 'Okiru Learn — Email test ✅',
    html: '<p style="font-family:sans-serif;color:#0a0a0f">Email is working correctly from Okiru Learn ✅</p>',
  });
  res.json({ configured: true, ...result });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
}

app.listen(PORT, () => console.log(`Okiru Learn running on port ${PORT}`));
module.exports = app;
