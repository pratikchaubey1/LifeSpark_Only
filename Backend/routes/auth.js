const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');
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

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

function generateInviteCode(users) {
  let code;
  do {
    code = 'LS' + Math.floor(100000 + Math.random() * 900000); // e.g. LS123456
  } while (users.some((u) => u.inviteCode === code));
  return code;
}

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      sponsorId, // invite code of the sponsor / upline
      sponsorName,
      phone,
      address,
    } = req.body;

    if (!sponsorId) {
      return res.status(400).json({ message: 'Invite code (Sponsor ID) is required' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const users = loadUsers();

    // Block registration without valid invite code, except for very first user
    let sponsorUser = null;
    if (users.length > 0) {
      // Allow matching by sponsor's inviteCode (recommended), or by legacy id / sponsorId
      sponsorUser = users.find(
        (u) =>
          u.inviteCode === sponsorId ||
          u.id === sponsorId ||
          (u.sponsorId && u.sponsorId === sponsorId)
      );
      if (!sponsorUser) {
        return res.status(400).json({ message: 'Invalid invite code' });
      }
    }

    const existing = users.find((u) => u.email === email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const inviteCode = generateInviteCode(users);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashed,
      phone: phone || '',
      address: address || '',
      sponsorId: sponsorId || '',
      sponsorName: sponsorName || '',
      inviteCode,
      // Activation status is controlled by separate E-Pin store (not per-member pin)
      isActivated: false,
      activationPackage: null,
      activatedAt: null,
      balance: 0,
      totalIncome: 0,
      withdrawal: 0,
      freedomIncome: 0,
      dailyBonusIncome: 0,
      rankRewardIncome: 0,
      lastDailyCredit: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    // Track who invited this user (direct downline) on sponsor record
    if (sponsorUser) {
      if (!Array.isArray(sponsorUser.directInviteIds)) {
        sponsorUser.directInviteIds = [];
      }
      sponsorUser.directInviteIds.push(newUser.id);
    }

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _pw, ...userWithoutSensitive } = newUser;

    res.status(201).json({ user: userWithoutSensitive, token });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = loadUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _pw, ...userWithoutSensitive } = user;

    res.json({ user: userWithoutSensitive, token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
