const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');
const EPINS_PATH = path.join(__dirname, '..', 'data', 'epins.json');
const EPIN_TRANSFERS_PATH = path.join(__dirname, '..', 'data', 'epinTransfers.json');

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
    const arr = JSON.parse(raw || '[]');
    return (Array.isArray(arr) ? arr : []).map((e) => ({
      ownerUserId: e.ownerUserId ?? null,
      ...e,
    }));
  } catch (e) {
    return [];
  }
}

function saveEpins(epins) {
  fs.writeFileSync(EPINS_PATH, JSON.stringify(epins, null, 2));
}

function loadTransfers() {
  if (!fs.existsSync(EPIN_TRANSFERS_PATH)) return [];
  const raw = fs.readFileSync(EPIN_TRANSFERS_PATH, 'utf-8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function saveTransfers(items) {
  fs.writeFileSync(EPIN_TRANSFERS_PATH, JSON.stringify(items, null, 2));
}

// List member-owned unused pins
router.get('/', auth, (req, res) => {
  const epins = loadEpins();
  const mine = epins.filter((e) => !e.used && e.ownerUserId === req.user.id);
  return res.json({ epins: mine });
});

// Used pins report (pins used by current user)
router.get('/used', auth, (req, res) => {
  const epins = loadEpins();
  const mine = epins.filter((e) => e.used && e.usedByUserId === req.user.id);
  return res.json({ epins: mine });
});

// Transfer up to 10 pins from current user to another user
router.post('/transfer', auth, (req, res) => {
  const { to, count } = req.body || {};
  const howMany = Math.min(Math.max(parseInt(count || 1, 10) || 1, 1), 10);

  if (!to) {
    return res.status(400).json({ message: 'to is required (user id or invite code)' });
  }

  const users = loadUsers();
  const target = users.find((u) => u.id === String(to) || u.inviteCode === String(to));
  if (!target) {
    return res.status(404).json({ message: 'Target user not found' });
  }
  if (target.id === req.user.id) {
    return res.status(400).json({ message: 'Cannot transfer pins to yourself' });
  }

  const epins = loadEpins();
  const availableMine = epins.filter((e) => !e.used && e.ownerUserId === req.user.id);
  if (availableMine.length < howMany) {
    return res.status(400).json({ message: `Not enough available pins. Available: ${availableMine.length}` });
  }

  const now = new Date().toISOString();
  const selectedCodes = [];

  let remaining = howMany;
  for (let i = 0; i < epins.length && remaining > 0; i++) {
    const e = epins[i];
    if (e.used) continue;
    if (e.ownerUserId !== req.user.id) continue;

    epins[i] = {
      ...e,
      ownerUserId: target.id,
      transferredAt: now,
      transferredBy: req.user.id,
    };
    selectedCodes.push(e.code);
    remaining--;
  }

  saveEpins(epins);

  const transfers = loadTransfers();
  const transferRecord = {
    id: `EPTR-${Date.now()}`,
    fromUserId: req.user.id,
    fromUserName: req.user.name,
    toUserId: target.id,
    toUserName: target.name,
    codes: selectedCodes,
    count: selectedCodes.length,
    transferredAt: now,
    transferredBy: req.user.id,
  };
  transfers.unshift(transferRecord);
  saveTransfers(transfers);

  return res.status(201).json({ transfer: transferRecord });
});

// Transfer history relevant to current user
router.get('/transfers', auth, (req, res) => {
  const transfers = loadTransfers();
  const mine = transfers.filter((t) => t.fromUserId === req.user.id || t.toUserId === req.user.id);
  return res.json({ transfers: mine });
});

module.exports = router;
