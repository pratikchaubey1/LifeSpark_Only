const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');
const EPINS_PATH = path.join(__dirname, '..', 'data', 'epins.json');
const EPIN_TRANSFERS_PATH = path.join(__dirname, '..', 'data', 'epinTransfers.json');
const KYC_PATH = path.join(__dirname, '..', 'data', 'kyc.json');
const WITHDRAWALS_PATH = path.join(__dirname, '..', 'data', 'withdrawals.json');
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

function loadKyc() {
  if (!fs.existsSync(KYC_PATH)) return [];
  const raw = fs.readFileSync(KYC_PATH, 'utf-8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
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

function loadEpins() {
  if (!fs.existsSync(EPINS_PATH)) return [];
  const raw = fs.readFileSync(EPINS_PATH, 'utf-8');
  try {
    const arr = JSON.parse(raw || '[]');
    // Back-compat: ensure ownerUserId exists (null means "admin pool")
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

function loadEpinTransfers() {
  if (!fs.existsSync(EPIN_TRANSFERS_PATH)) return [];
  const raw = fs.readFileSync(EPIN_TRANSFERS_PATH, 'utf-8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function saveEpinTransfers(items) {
  fs.writeFileSync(EPIN_TRANSFERS_PATH, JSON.stringify(items, null, 2));
}

function generateInviteCode(users) {
  let code;
  do {
    code = 'LS' + Math.floor(100000 + Math.random() * 900000);
  } while (users.some((u) => u.inviteCode === code));
  return code;
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
// Create a new member from admin panel
// Note: This is separate from /api/auth/register and is intended for "company dedicated" creation.
router.post('/users', adminAuth, (req, res) => {
  const { name, email, password, phone, address, sponsorId, sponsorName } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, password are required' });
  }

  const users = loadUsers();
  const existing = users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const inviteCode = generateInviteCode(users);

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    // NOTE: For parity with the current codebase (file-backed), keep password as plain text here.
    // If you want this to be secure, we should switch this endpoint to bcrypt hashing like /api/auth/register.
    password,
    phone: phone || '',
    address: address || '',
    sponsorId: sponsorId || 'WSE-COMPANY',
    sponsorName: sponsorName || 'WSE Company',
    inviteCode,
    role: 'member',
    roleAssignedBy: 'admin',
    roleAssignedAt: new Date().toISOString(),
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
    gender: '',
    city: '',
    state: '',
    pinCode: '',
    age: '',
    panNo: '',
    aadhaarNo: '',
    nomineeName: '',
    nomineeRelation: '',
    upiNo: '',
    upiId: '',
    bankDetails: {
      accountHolder: '',
      bankName: '',
      accountNo: '',
      ifsc: '',
      branchName: '',
    },
  };

  users.push(newUser);
  saveUsers(users);

  const { password: _pw, ...userWithoutSensitive } = newUser;
  return res.status(201).json({ user: userWithoutSensitive });
});

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
      role: user.role || 'member',
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

// Set role (admin-only) e.g. member | franchise
router.put('/users/:id/role', adminAuth, (req, res) => {
  const { role } = req.body || {};
  const allowed = new Set(['member', 'franchise']);
  if (!role || !allowed.has(String(role))) {
    return res.status(400).json({ message: 'Invalid role. Allowed: member, franchise' });
  }

  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });

  users[idx].role = role;
  users[idx].roleAssignedBy = 'admin';
  users[idx].roleAssignedAt = new Date().toISOString();
  saveUsers(users);

  const { password, ...userWithoutPassword } = users[idx];
  return res.json({ user: userWithoutPassword });
});

// Get KYC uploads for admin panel
router.get('/kyc', adminAuth, (req, res) => {
  const users = loadUsers();
  const kycs = loadKyc();

  const result = kycs.map((k) => {
    const user = users.find((u) => u.id === k.userId);
    return {
      ...k,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role || 'member',
          }
        : null,
    };
  });

  res.json({ kycs: result });
});

// Withdrawal requests for admin
router.get('/withdrawals', adminAuth, (req, res) => {
  ensureWithdrawalsFile();
  const users = loadUsers();
  const items = loadWithdrawals();

  const result = items.map((w) => {
    const user = users.find((u) => u.id === w.userId);
    return {
      ...w,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role || 'member',
            balance: user.balance || 0,
            upiId: user.upiId || '',
            upiNo: user.upiNo || '',
            bankDetails: user.bankDetails || null,
          }
        : null,
    };
  });

  return res.json({ withdrawals: result });
});

// Approve withdrawal (after payment complete)
router.post('/withdrawals/:id/approve', adminAuth, (req, res) => {
  ensureWithdrawalsFile();
  const users = loadUsers();
  const items = loadWithdrawals();

  const wIdx = items.findIndex((w) => w.id === req.params.id);
  if (wIdx === -1) return res.status(404).json({ message: 'Withdrawal request not found' });

  const w = items[wIdx];
  if (w.status !== 'pending') {
    return res.status(400).json({ message: `Cannot approve withdrawal in status: ${w.status}` });
  }

  const uIdx = users.findIndex((u) => u.id === w.userId);
  if (uIdx === -1) return res.status(404).json({ message: 'User not found' });

  const user = users[uIdx];
  const balance = Number(user.balance) || 0;
  const amount = Number(w.amount) || 0;

  if (amount <= 0) return res.status(400).json({ message: 'Invalid withdrawal amount' });
  if (amount > balance) {
    return res.status(400).json({ message: 'User has insufficient balance to approve this withdrawal.' });
  }

  // Deduct balance and track total withdrawal
  user.balance = balance - amount;
  user.withdrawal = (Number(user.withdrawal) || 0) + amount;
  users[uIdx] = user;
  saveUsers(users);

  w.status = 'approved';
  w.approvedAt = new Date().toISOString();
  w.approvedBy = 'admin';
  items[wIdx] = w;
  saveWithdrawals(items);

  return res.json({ withdrawal: w, user: { id: user.id, balance: user.balance, withdrawal: user.withdrawal } });
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
// Admin should NOT see used pins; also hide pins already transferred to members.
router.get('/epins', adminAuth, (req, res) => {
  const epins = loadEpins();
  const pool = epins.filter((e) => !e.used && (e.ownerUserId === null || e.ownerUserId === undefined));
  const codes = pool.map((e) => e.code);
  res.json({ epins: codes, available: codes.length });
});

// Transfer up to 10 pins from admin pool to a member
router.post('/epins/transfer', adminAuth, (req, res) => {
  const { toUserId, count } = req.body || {};
  const howMany = Math.min(Math.max(parseInt(count || 1, 10) || 1, 1), 10);

  if (!toUserId) {
    return res.status(400).json({ message: 'toUserId is required' });
  }

  const users = loadUsers();
  const target = users.find((u) => u.id === String(toUserId));
  if (!target) {
    return res.status(404).json({ message: 'Target user not found' });
  }

  const epins = loadEpins();
  const available = epins.filter((e) => !e.used && (e.ownerUserId === null || e.ownerUserId === undefined));
  if (available.length < howMany) {
    return res.status(400).json({ message: `Not enough available pins in pool. Available: ${available.length}` });
  }

  const now = new Date().toISOString();
  const selectedCodes = [];

  let remaining = howMany;
  for (let i = 0; i < epins.length && remaining > 0; i++) {
    const e = epins[i];
    const inPool = !e.used && (e.ownerUserId === null || e.ownerUserId === undefined);
    if (!inPool) continue;
    epins[i] = {
      ...e,
      ownerUserId: target.id,
      transferredAt: now,
      transferredBy: 'admin',
    };
    selectedCodes.push(e.code);
    remaining--;
  }

  saveEpins(epins);

  const transfers = loadEpinTransfers();
  const transferRecord = {
    id: `EPTR-${Date.now()}`,
    fromUserId: null,
    toUserId: target.id,
    toUserName: target.name,
    codes: selectedCodes,
    count: selectedCodes.length,
    transferredAt: now,
    transferredBy: 'admin',
  };
  transfers.unshift(transferRecord);
  saveEpinTransfers(transfers);

  return res.status(201).json({ transfer: transferRecord });
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
        ownerUserId: null,
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
