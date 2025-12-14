const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');
const WITHDRAWALS_PATH = path.join(__dirname, '..', 'data', 'withdrawals.json');

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

function loadWithdrawals() {
  if (!fs.existsSync(WITHDRAWALS_PATH)) return [];
  const raw = fs.readFileSync(WITHDRAWALS_PATH, 'utf-8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function saveWithdrawals(items) {
  fs.writeFileSync(WITHDRAWALS_PATH, JSON.stringify(items, null, 2));
}

function ensureWithdrawalsFile() {
  if (!fs.existsSync(WITHDRAWALS_PATH)) {
    saveWithdrawals([]);
  }
}

function normalize(v) {
  if (v == null) return '';
  return String(v).trim();
}

// List withdrawal requests for current user
router.get('/', auth, (req, res) => {
  ensureWithdrawalsFile();
  const all = loadWithdrawals();
  const mine = all.filter((w) => w.userId === req.user.id);
  return res.json({ withdrawals: mine });
});

// Create withdrawal request
router.post('/', auth, (req, res) => {
  ensureWithdrawalsFile();

  const amount = Number(req.body?.amount);
  const upiId = normalize(req.body?.upiId);
  const upiNo = normalize(req.body?.upiNo);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Valid withdrawal amount is required.' });
  }

  // "ask for upi" (required)
  if (!upiId) {
    return res.status(400).json({ message: 'UPI ID is required.' });
  }

  // optional, but requested
  if (!upiNo) {
    return res.status(400).json({ message: 'UPI Number is required.' });
  }

  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });

  const user = users[idx];
  const balance = Number(user.balance) || 0;

  if (amount > balance) {
    return res.status(400).json({ message: 'Insufficient balance.' });
  }

  const all = loadWithdrawals();
  const item = {
    id: `WD-${Date.now()}`,
    userId: req.user.id,
    amount,
    upiId,
    upiNo,
    status: 'pending', // pending | approved | rejected
    requestedAt: new Date().toISOString(),
    approvedAt: null,
    approvedBy: null,
  };

  all.unshift(item);
  saveWithdrawals(all);

  // Also store latest UPI info on the user profile for convenience
  user.upiId = upiId;
  user.upiNo = upiNo;
  users[idx] = user;
  saveUsers(users);

  return res.status(201).json({ withdrawal: item });
});

module.exports = router;
