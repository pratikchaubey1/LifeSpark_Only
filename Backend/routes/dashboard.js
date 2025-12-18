const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');
const EPINS_PATH = path.join(__dirname, '..', 'data', 'epins.json');

/* -------------------- FILE HELPERS -------------------- */

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8') || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

function loadEpins() {
  if (!fs.existsSync(EPINS_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(EPINS_PATH, 'utf-8') || '[]');
  } catch {
    return [];
  }
}

function saveEpins(epins) {
  fs.writeFileSync(EPINS_PATH, JSON.stringify(epins, null, 2));
}

function ensureActivationFlag(users) {
  let changed = false;
  users.forEach((u) => {
    if (typeof u.isActivated !== 'boolean') {
      u.isActivated = false;
      changed = true;
    }
  });
  if (changed) saveUsers(users);
}

/* -------------------- ROUTES -------------------- */

router.get('/', auth, (req, res) => {
  const users = loadUsers();
  ensureActivationFlag(users);

  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = users[idx];

  const { password, ...safeUser } = user;

  res.json({
    user: safeUser,
    cards: {
      totalIncome: user.totalIncome || 0,
      withdrawal: user.withdrawal || 0,
      balance: user.balance || 0,
      dailyBonusIncome: user.dailyBonusIncome || 0,
      freedomIncome: user.freedomIncome || 0,
      rankRewardIncome: user.rankRewardIncome || 0,
    },
  });
});

/* -------------------- ACTIVATE ID -------------------- */

router.post('/activate-id', auth, (req, res) => {
  const { epin, packageId } = req.body || {};

  if (!epin || !packageId) {
    return res.status(400).json({ message: 'E-Pin and package are required' });
  }

  const users = loadUsers();
  ensureActivationFlag(users);

  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = users[idx];

  if (user.isActivated) {
    return res.status(400).json({ message: 'This ID is already activated.' });
  }

  const epins = loadEpins().map((e) => ({
    ownerUserId: e.ownerUserId ?? null,
    ...e,
  }));

  const epinIndex = epins.findIndex((p) => {
    const match = String(p.code).trim() === String(epin).trim();
    const unused = !p.used;
    const allowedOwner =
      p.ownerUserId === null || p.ownerUserId === user.id;
    return match && unused && allowedOwner;
  });

  if (epinIndex === -1) {
    return res.status(400).json({ message: 'Invalid or already used E-Pin.' });
  }

  const epinObj = epins[epinIndex];

  epinObj.used = true;
  epinObj.usedByUserId = user.id;
  epinObj.usedAt = new Date().toISOString();
  epinObj.packageId = packageId;

  epins[epinIndex] = epinObj;
  saveEpins(epins);

  user.isActivated = true;
  user.activationPackage = packageId;
  user.activatedAt = new Date().toISOString();
  user.lastDailyCredit = null;

  users[idx] = user;
  saveUsers(users);

  const { password, ...safeUser } = user;

  res.json({
    message: 'ID activated successfully.',
    user: safeUser,
  });
});

module.exports = router;
