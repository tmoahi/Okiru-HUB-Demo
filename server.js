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

const REPLY_TO = 'tmoahi@okiru.co.za';

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — email skipped');
    return { sent: false, reason: 'RESEND_API_KEY is not configured on the server.' };
  }
  try {
    const resend = new Resend(RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo: REPLY_TO,
    });
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
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome to Okiru Learn</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Pre-header -->
  <div style="text-align:center;padding:14px 20px;font-size:13px;color:#888;background:#fff;border-bottom:1px solid #e8e8ee;">
    Welcome to Okiru Learn – Your Learning Journey Starts Here.
  </div>

  <!-- Tagline row -->
  <div style="background:#fff;padding:12px 40px 12px;text-align:right;border-bottom:1px solid #e8e8ee;">
    <span style="font-size:13px;font-weight:600;color:#1a1a2e;">Learn. Grow. Transform.</span><br>
    <span style="font-size:13px;"><span style="color:#06CDE1;font-weight:600;">Anywhere.</span>&nbsp;<span style="color:#BA0DA7;font-weight:600;">Anytime.</span></span>
  </div>

  <!-- Outer wrapper -->
  <table cellpadding="0" cellspacing="0" style="width:100%;background:#f4f4f8;">
  <tr><td style="padding:24px 16px;">
  <table cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.18);">

    <!-- ── Gradient header ── -->
    <tr>
      <td style="background:linear-gradient(135deg,#06CDE1 0%,#6A3FBF 50%,#BA0DA7 100%);padding:28px 36px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:16px;vertical-align:middle;">
            <!-- Logo circle -->
            <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.18);border:2px solid rgba(255,255,255,0.4);text-align:center;line-height:52px;font-size:22px;font-weight:900;color:#fff;display:inline-block;">O</div>
          </td>
          <td style="vertical-align:middle;">
            <span style="font-size:26px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase;">OKIRU LEARN</span>
          </td>
        </tr></table>
      </td>
    </tr>

    <!-- ── Dark body ── -->
    <tr>
      <td style="background:#13131f;padding:36px 36px 28px;">

        <!-- Icon + heading -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
          <td style="padding-right:16px;vertical-align:middle;">
            <div style="width:52px;height:52px;border-radius:50%;border:2px solid #6A3FBF;background:rgba(106,63,191,0.18);text-align:center;line-height:52px;font-size:22px;display:inline-block;">&#128100;</div>
          </td>
          <td style="vertical-align:middle;">
            <h2 style="margin:0;font-size:22px;font-weight:800;color:#fff;">You've been invited!</h2>
          </td>
        </tr></table>

        <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.75;">
          Your administrator has set up an Okiru Learn account for you.<br>
          Use the credentials below to sign in and start your learning journey.
        </p>

        <!-- Credentials table -->
        <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #2a2a42;border-radius:10px;overflow:hidden;margin-bottom:28px;">
          <tr>
            <td style="padding:13px 18px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;background:#0d0d1a;width:140px;border-bottom:1px solid #2a2a42;">INVITED USER</td>
            <td style="padding:13px 18px;font-size:14px;color:#e2e8f0;background:#0d0d1a;border-bottom:1px solid #2a2a42;border-left:1px solid #2a2a42;">${name}</td>
          </tr>
          <tr>
            <td style="padding:13px 18px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;background:#13131f;border-bottom:1px solid #2a2a42;">USERNAME</td>
            <td style="padding:13px 18px;font-size:14px;color:#e2e8f0;background:#13131f;border-bottom:1px solid #2a2a42;border-left:1px solid #2a2a42;">${username}</td>
          </tr>
          <tr>
            <td style="padding:13px 18px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;background:#0d0d1a;border-bottom:1px solid #2a2a42;">PASSWORD</td>
            <td style="padding:13px 18px;font-family:monospace;font-size:16px;font-weight:700;color:#06CDE1;background:#0d0d1a;border-bottom:1px solid #2a2a42;border-left:1px solid #2a2a42;letter-spacing:0.05em;">${password}</td>
          </tr>
          <tr>
            <td style="padding:13px 18px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;background:#13131f;">LOGIN URL</td>
            <td style="padding:13px 18px;font-size:13px;color:#94a3b8;background:#13131f;border-left:1px solid #2a2a42;">${loginUrl}</td>
          </tr>
        </table>

        <!-- CTA button -->
        <div style="text-align:center;margin-bottom:28px;">
          <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#06CDE1 0%,#BA0DA7 100%);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:15px 48px;border-radius:8px;">Sign in to Okiru Learn &rarr;</a>
        </div>

        <!-- Note -->
        <p style="font-size:12px;color:#64748b;text-align:center;line-height:1.8;margin:0 0 28px;">
          This is your temporary password &mdash; you can change it anytime via the<br>
          &ldquo;Forgot password?&rdquo; link on the login page. If you believe you received<br>
          this email in error, please ignore it.
        </p>

        <!-- Divider -->
        <div style="border-top:1px solid #2a2a42;margin:0 0 24px;"></div>

        <!-- Need help -->
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:16px;vertical-align:top;">
            <div style="width:48px;height:48px;border-radius:50%;border:2px solid #6A3FBF;background:rgba(106,63,191,0.18);text-align:center;line-height:48px;font-size:20px;font-weight:800;color:#9B6FE8;display:inline-block;">?</div>
          </td>
          <td style="vertical-align:middle;">
            <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#fff;">Need help?</p>
            <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">
              If you have any questions or need assistance,<br>
              contact our support team at <a href="mailto:tmoahi@okiru.co.za" style="color:#06CDE1;text-decoration:none;">tmoahi@okiru.co.za</a>
            </p>
          </td>
        </tr></table>

      </td>
    </tr>

    <!-- ── Dark footer ── -->
    <tr>
      <td style="background:#0d0d1a;padding:22px 36px;border-top:3px solid transparent;background-clip:padding-box;">
        <table cellpadding="0" cellspacing="0" style="width:100%;"><tr>
          <td style="vertical-align:middle;">
            <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase;">OKIRU</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;line-height:1.6;">Empowering people.<br>Transforming businesses.</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:12px;font-weight:700;color:#94a3b8;margin-left:6px;">in</span>
            <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:14px;color:#94a3b8;margin-left:6px;">&#127760;</span>
            <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:13px;font-weight:700;color:#94a3b8;margin-left:6px;">f</span>
          </td>
        </tr></table>
      </td>
    </tr>

  </table>

  <!-- Copyright -->
  <p style="text-align:center;font-size:11px;color:#aaa;margin:16px 0 0;">&copy; 2026 Okiru Consulting (Pty) Ltd. All rights reserved.</p>

  </td></tr>
  </table>

</body>
</html>`;
}

function resetEmailHtml({ name, resetUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reset your Okiru Learn password</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">

  <div style="text-align:center;padding:14px 20px;font-size:13px;color:#888;background:#fff;border-bottom:1px solid #e8e8ee;">
    Okiru Learn &mdash; Password Reset Request
  </div>
  <div style="background:#fff;padding:12px 40px 12px;text-align:right;border-bottom:1px solid #e8e8ee;">
    <span style="font-size:13px;font-weight:600;color:#1a1a2e;">Learn. Grow. Transform.</span><br>
    <span style="font-size:13px;"><span style="color:#06CDE1;font-weight:600;">Anywhere.</span>&nbsp;<span style="color:#BA0DA7;font-weight:600;">Anytime.</span></span>
  </div>

  <table cellpadding="0" cellspacing="0" style="width:100%;background:#f4f4f8;">
  <tr><td style="padding:24px 16px;">
  <table cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.18);">

    <tr>
      <td style="background:linear-gradient(135deg,#06CDE1 0%,#6A3FBF 50%,#BA0DA7 100%);padding:28px 36px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:16px;vertical-align:middle;">
            <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.18);border:2px solid rgba(255,255,255,0.4);text-align:center;line-height:52px;font-size:22px;font-weight:900;color:#fff;display:inline-block;">O</div>
          </td>
          <td style="vertical-align:middle;">
            <span style="font-size:26px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase;">OKIRU LEARN</span>
          </td>
        </tr></table>
      </td>
    </tr>

    <tr>
      <td style="background:#13131f;padding:36px 36px 28px;">

        <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
          <td style="padding-right:16px;vertical-align:middle;">
            <div style="width:52px;height:52px;border-radius:50%;border:2px solid #6A3FBF;background:rgba(106,63,191,0.18);text-align:center;line-height:52px;font-size:22px;display:inline-block;">&#128274;</div>
          </td>
          <td style="vertical-align:middle;">
            <h2 style="margin:0;font-size:22px;font-weight:800;color:#fff;">Password reset request</h2>
          </td>
        </tr></table>

        <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;line-height:1.75;">
          Hi ${name}, we received a request to reset your Okiru Learn password.<br>
          Click the button below &mdash; this link expires in <strong style="color:#e2e8f0;">1 hour</strong>.
        </p>

        <div style="text-align:center;margin-bottom:28px;">
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#06CDE1 0%,#BA0DA7 100%);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:15px 48px;border-radius:8px;">Reset my password &rarr;</a>
        </div>

        <p style="font-size:12px;color:#64748b;text-align:center;line-height:1.8;margin:0 0 28px;">
          If you didn&rsquo;t request a password reset, you can safely ignore this email.<br>
          Your password will not change.
        </p>

        <div style="border-top:1px solid #2a2a42;margin:0 0 24px;"></div>

        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:16px;vertical-align:top;">
            <div style="width:48px;height:48px;border-radius:50%;border:2px solid #6A3FBF;background:rgba(106,63,191,0.18);text-align:center;line-height:48px;font-size:20px;font-weight:800;color:#9B6FE8;display:inline-block;">?</div>
          </td>
          <td style="vertical-align:middle;">
            <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#fff;">Need help?</p>
            <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">
              If you have any questions or need assistance,<br>
              contact our support team at <a href="mailto:tmoahi@okiru.co.za" style="color:#06CDE1;text-decoration:none;">tmoahi@okiru.co.za</a>
            </p>
          </td>
        </tr></table>

      </td>
    </tr>

    <tr>
      <td style="background:#0d0d1a;padding:22px 36px;">
        <table cellpadding="0" cellspacing="0" style="width:100%;"><tr>
          <td style="vertical-align:middle;">
            <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase;">OKIRU</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;line-height:1.6;">Empowering people.<br>Transforming businesses.</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:12px;font-weight:700;color:#94a3b8;margin-left:6px;">in</span>
            <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:14px;color:#94a3b8;margin-left:6px;">&#127760;</span>
            <span style="display:inline-block;width:32px;height:32px;border-radius:50%;border:1px solid #2a2a42;text-align:center;line-height:32px;font-size:13px;font-weight:700;color:#94a3b8;margin-left:6px;">f</span>
          </td>
        </tr></table>
      </td>
    </tr>

  </table>
  <p style="text-align:center;font-size:11px;color:#aaa;margin:16px 0 0;">&copy; 2026 Okiru Consulting (Pty) Ltd. All rights reserved.</p>
  </td></tr>
  </table>

</body>
</html>`;
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
