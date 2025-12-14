const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

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

router.get('/', auth, (req, res) => {
  const { password, activationPin, ...userWithoutSensitive } = req.user;
  res.json({ user: userWithoutSensitive });
});

router.put('/', auth, (req, res) => {
  const allowedFields = ['name', 'phone', 'address'];

  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });

  const updated = { ...users[idx] };
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updated[field] = req.body[field];
    }
  });
  users[idx] = updated;
  saveUsers(users);

  const { password, ...userWithoutPassword } = updated;
  res.json({ user: userWithoutPassword });
});

module.exports = router;
