require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const mongoose = require('mongoose');
const cron = require("node-cron");

// ROUTES
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const kycRoutes = require('./routes/kyc');
const dashboardRoutes = require('./routes/dashboard');
const withdrawalsRoutes = require('./routes/withdrawals');
const epinsRoutes = require('./routes/epins');
const teamRoutes = require('./routes/team');
const levelIncomeRoutes = require('./routes/levelIncome');
const projectsRoutes = require('./routes/projects');
const siteRoutes = require('./routes/site');
const adminRoutes = require('./routes/admin');
const rewardsRoutes = require('./routes/rewards');
const settingsRoutes = require('./routes/settings');
const testRoutes = require('./routes/test');
const franchiseRoutes = require('./routes/franchise');
const autopoolRoutes = require('./routes/autopool');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

/* ------------------ MIDDLEWARE ------------------ */

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));

app.use(express.json());

// Enable gzip compression for all responses
app.use(compression());

// Static KYC uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ------------------ ROUTES ------------------ */

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/withdrawals', require('./routes/withdrawals'));
app.use('/api/funds', require('./routes/funds'));
app.use('/api/epins', epinsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/level-income', levelIncomeRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/rewards', rewardsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/autopool', autopoolRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'LifeSpark backend is running' });
});

/* ---------------------------------------------------
    ⭐ DAILY BONUS CRON JOB – RUNS EVERY NIGHT AT 12
----------------------------------------------------- */

const User = require('./models/User');
const SiteSettings = require('./models/SiteSettings');
const IncomeLog = require('./models/IncomeLog');

// CRON JOB — runs at 00:00 (midnight)
cron.schedule("31 1 * * *", async () => {
  console.log("⏰ Midnight Daily Bonus Started...");

  try {
    // Check if cron is enabled in admin settings
    const settings = await SiteSettings.findOne().lean();
    if (settings && settings.cronEnabled === false) {
      console.log("⛔ Cron job is DISABLED by admin. Skipping daily bonus.");
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    console.log(`📅 Today: ${todayStr}`);

    // Find all activated users
    const users = await User.find({ isActivated: true, activatedAt: { $ne: null }, isBlocked: { $ne: true } });
    console.log(`👥 Total activated users found: ${users.length}`);

    // Collect users eligible for daily level income distribution
    const usersForLevelIncome = [];
    let skippedCount = 0;
    let bonusCount = 0;

    for (const user of users) {
      const activationDate = new Date(user.activatedAt);
      const daysSince = Math.floor(
        (new Date() - activationDate) / (1000 * 60 * 60 * 24)
      );

      // Skip if already processed today
      if (user.lastDailyCredit === todayStr) {
        skippedCount++;
        continue;
      }

      const DAILY_BONUS = 50;

      // Only give ₹50 daily bonus if within 30 days of activation
      if (daysSince < 30) {
        user.balance = (user.balance || 0) + DAILY_BONUS;
        user.dailyBonusIncome = (user.dailyBonusIncome || 0) + DAILY_BONUS;
        user.totalIncome = (user.totalIncome || 0) + DAILY_BONUS;
        bonusCount++;

        // Log daily bonus
        await IncomeLog.create({
          userId: user._id.toString(),
          userName: user.name || '',
          userInviteCode: user.inviteCode || '',
          type: 'daily_bonus',
          amount: DAILY_BONUS,
          description: `Daily bonus ₹${DAILY_BONUS} (day ${daysSince + 1} of 30)`
        });
      }

      // Collect this user for capped level income distribution
      usersForLevelIncome.push(user);

      user.lastDailyCredit = todayStr;
      await user.save();
    }

    console.log(`⏭️  Skipped (already processed): ${skippedCount}`);
    console.log(`📋 Users for level income: ${usersForLevelIncome.length}`);
    console.log(`🎁 Daily bonus given to: ${bonusCount} users`);

    // Distribute daily level income with per-level caps (done ONCE for all users)
    if (usersForLevelIncome.length > 0) {
      const { distributeDailyLevelIncomeWithCaps } = require('./utils/income');
      console.log(`🚀 Starting level income distribution for ${usersForLevelIncome.length} users...`);
      await distributeDailyLevelIncomeWithCaps(usersForLevelIncome);
    } else {
      console.log(`⚠️  No users to distribute level income to!`);
    }

    console.log("✔ Daily bonus cron job complete");
  } catch (err) {
    console.error("❌ Daily bonus cron job error:", err);
  }
});

/* ------------------ DIAGNOSTIC ROUTES ------------------ */
/* ------------------ GLOBAL ERROR HANDLER ------------------ */
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: err.message
  });
});

/* ------------------ START SERVER ------------------ */

console.log('🔄 Connecting to MongoDB...');
console.log('MongoDB URI:', process.env.MONGO_URI ? process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 'NOT SET');

// Disable auto-indexing in production or if you want to manage them manually
// mongoose.set('autoIndex', false); 

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
