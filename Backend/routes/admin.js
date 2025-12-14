const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');
const EPINS_PATH = path.join(__dirname, '..', 'data', 'epins.json');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_me';

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  const raw = fs.readFileSync(USERS_PATH, 'utf-8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function loadEpins() {
  if (!fs.existsSync(EPINS_PATH)) return [];
  const raw = fs.readFileSync(EPINS_PATH, 'utf-8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function saveEpins(epins) {
  fs.writeFileSync(EPINS_PATH, JSON.stringify(epins, null, 2));
}

// Simple admin login: username: admin, password: admin123
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username !== 'admin' || password !== 'admin123') {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
  return res.json({ token });
});

// Middleware to protect admin routes
function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Invalid authorization header' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    req.admin = true;
    next();
  } catch (err) {
    console.error('Admin JWT verify error', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
// Get all users with invite stats for admin panel
router.get('/users', adminAuth, (req, res) => {
  const users = loadUsers();

  const result = users.map((user) => {
    const userInvitees = users.filter((u) => u.sponsorId === user.inviteCode);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      sponsorId: user.sponsorId || '',
      sponsorName: user.sponsorName || '',
      inviteCode: user.inviteCode,
      isActivated: !!user.isActivated,
      activationPackage: user.activationPackage || null,
      balance: user.balance || 0,
      totalIncome: user.totalIncome || 0,
      withdrawal: user.withdrawal || 0,
      freedomIncome: user.freedomIncome || 0,
      dailyBonusIncome: user.dailyBonusIncome || 0,
      rankRewardIncome: user.rankRewardIncome || 0,
      createdAt: user.createdAt || null,
      directInviteCount: userInvitees.length,
      invitees: userInvitees.map((inv) => ({
        id: inv.id,
        name: inv.name,
        email: inv.email,
        phone: inv.phone || '',
        balance: inv.balance || 0,
        inviteCode: inv.inviteCode,
      })),
    };
  });

  res.json({ users: result });
});

// Simple stats endpoint used by the admin panel for site name and active members
router.get('/stats', adminAuth, (req, res) => {
  const users = loadUsers();

  const siteName = process.env.SITE_NAME || 'Life Spark Associates';
  // For now, treat all registered users as "active" for this simple summary.
  const activeMembers = Array.isArray(users) ? users.length : 0;

  res.json({ siteName, activeMembers });
});

// E-Pin management for admin panel (central pool of pins)
router.get('/epins', adminAuth, (req, res) => {
  const epins = loadEpins();
  // Return only codes for now; details stay server-side
  const codes = epins.map((e) => e.code);
  res.json({ epins: codes });
});

router.post('/epins', adminAuth, (req, res) => {
  const { count } = req.body || {};
  const howMany = Math.min(Math.max(parseInt(count || 1, 10) || 1, 1), 100);

  const existing = loadEpins();
  const codesSet = new Set(existing.map((e) => e.code));
  const newEpins = [];

  function generateCode() {
    const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${part()}-${part()}-${part()}`;
  }

  while (newEpins.length < howMany) {
    const code = generateCode();
    if (!codesSet.has(code)) {
      codesSet.add(code);
      newEpins.push({
        code,
        used: false,
        usedByUserId: null,
        usedAt: null,
        packageId: null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const all = [...newEpins, ...existing];
  saveEpins(all);

  res.status(201).json({ epins: newEpins.map((e) => e.code) });
});

module.exports = router;
