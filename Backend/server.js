require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cron = require("node-cron");
const fs = require("fs");

// ROUTES
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const kycRoutes = require('./routes/kyc');
const dashboardRoutes = require('./routes/dashboard');
const withdrawalsRoutes = require('./routes/withdrawals');
const epinsRoutes = require('./routes/epins');
const teamRoutes = require('./routes/team');
const projectsRoutes = require('./routes/projects');
const siteRoutes = require('./routes/site');
const adminRoutes = require('./routes/admin');
const testRoutes = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

/* ------------------ MIDDLEWARE ------------------ */

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));

app.use(express.json());

// Static KYC uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ------------------ ROUTES ------------------ */

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/withdrawals', withdrawalsRoutes);
app.use('/api/epins', epinsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'LifeSpark backend is running' });
});

/* ---------------------------------------------------
    ⭐ DAILY BONUS CRON JOB – RUNS EVERY NIGHT AT 12
----------------------------------------------------- */

const USERS_PATH = path.join(__dirname, "data", "users.json");

// Load user data
function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf-8") || "[]");
}

// Save user data
function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

// CRON JOB — runs at 00:00 (midnight)
cron.schedule("0 0 * * *", () => {
  console.log("⏰ Midnight Daily Bonus Started...");

  const users = loadUsers();
  const todayStr = new Date().toISOString().slice(0, 10);

  users.forEach((user) => {
    if (!user.isActivated || !user.activatedAt) return;

    const activationDate = new Date(user.activatedAt);
    const daysSince = Math.floor(
      (new Date() - activationDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSince >= 30) return;

    if (user.lastDailyCredit === todayStr) return;

    const DAILY_BONUS = 50;

    user.balance = (user.balance || 0) + DAILY_BONUS;
    user.dailyBonusIncome = (user.dailyBonusIncome || 0) + DAILY_BONUS;
    user.totalIncome = (user.totalIncome || 0) + DAILY_BONUS;

    user.lastDailyCredit = todayStr;
  });

  saveUsers(users);

  console.log("✔ Daily bonus added to all activated users");
});

/* ------------------ START SERVER ------------------ */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });
