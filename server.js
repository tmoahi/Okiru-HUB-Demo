const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Okiru Learn — Course Catalogue ───────────────────────────────────────

const COURSES = [
  {
    id: 'ai-microsoft-office',
    title: 'Using AI with Microsoft Office (PowerPoint, Excel & Word)',
    category: 'AI Tools',
    level: 'Beginner',
    duration: 'Self-paced',
    lessonCount: 0,
    description: 'Artificial Intelligence tools can significantly improve productivity when working with Microsoft Word, Excel and PowerPoint. They help users write documents faster, summarise content, analyse data, and create presentations with ease.',
    zohoUrl: 'https://okiru-training.zoholearn.com/c/using-ai-with-microsoft-office',
    instructor: { name: 'Okiru Learn', title: 'Okiru' },
    enrolled: 0, completionRate: 0, rating: 0, reviews: 0,
    color: '#06CDE1',
    modules: [],
  },
  {
    id: 'safe-ai-compliance',
    title: 'Safe AI Use & Compliance',
    category: 'AI & Compliance',
    level: 'Intermediate',
    duration: 'Self-paced',
    lessonCount: 0,
    description: 'Safe AI Use & Compliance equips professionals with the knowledge and practical tools to use AI responsibly, securely, and in alignment with organisational policies, ethical guidelines, and emerging regulatory frameworks.',
    zohoUrl: 'https://okiru-training.zoholearn.com/c/safe-ai-use-compliance',
    instructor: { name: 'Okiru Learn', title: 'Okiru' },
    enrolled: 0, completionRate: 0, rating: 0, reviews: 0,
    color: '#10e8a0',
    modules: [],
  },
  {
    id: 'ai-reporting-analysis',
    title: 'AI-powered Reporting & Analysis',
    category: 'AI Tools',
    level: 'Intermediate',
    duration: 'Self-paced',
    lessonCount: 0,
    description: 'A fast, hands-on session that teaches professionals how to use generative AI to turn messy information into clear reports, insights, and recommendations — without needing advanced technical skills.',
    zohoUrl: 'https://okiru-training.zoholearn.com/c/ai-powered-reporting-analysis',
    instructor: { name: 'Okiru Learn', title: 'Okiru' },
    enrolled: 0, completionRate: 0, rating: 0, reviews: 0,
    color: '#FF7512',
    modules: [],
  },
  {
    id: 'prompt-mastery',
    title: 'Prompt Mastery & Creativity',
    category: 'AI Tools',
    level: 'Beginner',
    duration: 'Self-paced',
    lessonCount: 0,
    description: 'Prompt Mastery & Creativity is a practical, hands-on course that teaches professionals how to communicate effectively with generative AI to unlock high-quality, reliable, and creative outputs across any professional context.',
    zohoUrl: 'https://okiru-training.zoholearn.com/c/prompt-mastery-creativity',
    instructor: { name: 'Okiru Learn', title: 'Okiru' },
    enrolled: 0, completionRate: 0, rating: 0, reviews: 0,
    color: '#BA0DA7',
    modules: [],
  },
  {
    id: 'mastering-claude-ai',
    title: 'Mastering Claude AI — From Beginner to Power User',
    category: 'AI Tools',
    level: 'Beginner',
    duration: '6h',
    lessonCount: 43,
    description: 'This course is designed to take you from complete beginner to confident, high-impact AI user. Master Claude AI across real-world professional scenarios and unlock a new level of productivity and creative thinking.',
    zohoUrl: 'https://okiru-training.zoholearn.com/c/mastering-claude-ai',
    instructor: { name: 'Tshiamo Moahi', title: 'Founder, Okiru' },
    enrolled: 0, completionRate: 0, rating: 0, reviews: 0,
    color: '#60a5fa',
    modules: [],
  },
];

// ─── Users (mutable at runtime) ───────────────────────────────────────────────

const USERS = [
  {
    id: 'admin',
    name: 'Okiru Admin',
    email: 'admin@okiru.co.za',
    company: 'Okiru',
    role: 'admin',
    avatar: 'OK',
    password: 'okiru2025',
    enrolledCourses: [],
    completedCourses: [],
    invitedAt: null,
    tempPassword: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generatePassword() {
  const words  = ['Train', 'Learn', 'Grow', 'Build', 'Rise', 'Lead'];
  const word   = words[Math.floor(Math.random() * words.length)];
  const num    = Math.floor(100 + Math.random() * 900);
  const chars  = '!@#$';
  const symbol = chars[Math.floor(Math.random() * chars.length)];
  return `${word}${num}${symbol}`;
}

function buildStats() {
  const learners = USERS.filter(u => u.role === 'learner');
  return {
    totalLearners: learners.length,
    activeCourses: COURSES.length,
    completionRate: learners.length ? '—' : '—',
    certificatesIssued: 0,
    enrollmentsThisMonth: learners.length,
    avgRating: '—',
    courseStats: COURSES.map(c => ({
      id: c.id, title: c.title, category: c.category,
      enrolled: c.enrolled, completionRate: c.completionRate,
      rating: c.rating, completed: 0,
    })),
    recentLearners: learners.slice(-10).reverse().map(u => ({
      name: u.name,
      email: u.email,
      company: u.company,
      enrolled: 0,
      completed: 0,
      lastActive: 'Invited',
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

// GET all learners
app.get('/api/admin/learners', (req, res) => {
  const learners = USERS
    .filter(u => u.role === 'learner')
    .map(({ password: _pw, ...u }) => u);
  res.json({ success: true, data: learners });
});

// POST invite a new learner
app.post('/api/admin/invite', (req, res) => {
  const { name, email, company } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  const exists = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, error: 'A user with this email already exists.' });
  }

  const tempPassword = generatePassword();
  const id = `learner_${Date.now()}`;

  const newUser = {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    company: company ? company.trim() : '',
    role: 'learner',
    avatar: name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    password: tempPassword,
    enrolledCourses: [],
    completedCourses: [],
    invitedAt: new Date().toISOString(),
    tempPassword,
  };

  USERS.push(newUser);

  res.json({
    success: true,
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      company: newUser.company,
      tempPassword,
      loginUrl: process.env.APP_URL || '',
    },
  });
});

// DELETE a learner
app.delete('/api/admin/learners/:id', (req, res) => {
  const idx = USERS.findIndex(u => u.id === req.params.id && u.role === 'learner');
  if (idx === -1) return res.status(404).json({ success: false, error: 'Learner not found.' });
  USERS.splice(idx, 1);
  res.json({ success: true });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const { password: _pw, tempPassword: _tp, ...safe } = user;
  res.json({ success: true, data: safe });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
}

app.listen(PORT, () => console.log(`Okiru Learn LMS running on port ${PORT}`));
module.exports = app;
