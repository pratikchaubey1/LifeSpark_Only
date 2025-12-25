const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Epin = require('../models/Epin');
const EpinTransfer = require('../models/EpinTransfer');
const Kyc = require('../models/Kyc');
const Withdrawal = require('../models/Withdrawal');
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');
const Testimonial = require('../models/Testimonial');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_me';

// Helper: Generate codes
async function generateUniqueInviteCode() { // Modified to be async/db-aware
  let code;
  let exists = true;
  while (exists) {
    code = 'LS' + Math.floor(100000 + Math.random() * 900000);
    const user = await User.findOne({ inviteCode: code });
    if (!user) exists = false;
  }
  return code;
}

async function generateUniqueUserId() {
  let id;
  let exists = true;
  while (exists) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = await User.findOne({ id });
    if (!user) exists = false;
  }
  return id;
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

function normalizeIdValue(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

async function checkUnique(field, value, currentUserId) {
  const v = normalizeIdValue(value);
  if (!v) return null;

  const clash = await User.findOne({
    [field]: v,
    id: { $ne: currentUserId }
  });

  if (clash) {
    return `${field} already used by another user.`;
  }
  return null;
}

// Create a new member from admin panel
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { name, email, password, phone, address, sponsorId, sponsorName } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password are required' });
    }

    const existingEmail = await User.findOne({ email: String(email).toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const normalizePhone = (v) => {
      const digits = String(v || '').replace(/\D/g, '');
      if (!digits) return '';
      return digits.length > 10 ? digits.slice(-10) : digits;
    };

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      const existingPhone = await User.findOne({ phone: phone }); // Simple check
      if (existingPhone) {
        return res.status(409).json({ message: 'Phone number already registered' });
      }
    }

    const inviteCode = await generateUniqueInviteCode();
    const newId = await generateUniqueUserId();

    const newUser = new User({
      id: newId,
      name,
      email: String(email).toLowerCase(),
      password, // stored as plain text per original logic for this endpoint (though not recommended)
      phone: normalizedPhone || (phone || ''),
      address: address || '',
      sponsorId: sponsorId || 'WSE-COMPANY',
      sponsorName: sponsorName || 'WSE Company',
      inviteCode,
      role: 'member',
      roleAssignedBy: 'admin',
      roleAssignedAt: new Date(),
      lastDailyCredit: new Date().toISOString().slice(0, 10),
      createdAt: new Date(),
    });

    await newUser.save();

    const userObj = newUser.toObject();
    const { password: _pw, ...userWithoutSensitive } = userObj;
    return res.status(201).json({ user: userWithoutSensitive });
  } catch (err) {
    console.error('Admin create user error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with invite stats for admin panel
router.get('/users', adminAuth, async (req, res) => {
  try {
    // Fetch all users to memory to process relationships
    // If dataset grows large, this needs pagination and aggregation
    const users = await User.find().lean();

    const result = users.map((user) => {
      // Find invitees in memory suitable for small dataset
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
        // payment info (for admin viewing)
        upiId: user.upiId || '',
        upiNo: user.upiNo || '',
        bankDetails: user.bankDetails || null,
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
  } catch (err) {
    console.error('Admin users fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a user's payment details (admin-only)
router.put('/users/:id/payment-details', adminAuth, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Optional uniqueness checks
    const upiErr = await checkUnique('upiId', req.body.upiId, user.id);
    if (upiErr) return res.status(409).json({ message: upiErr });

    const nextBankAccountNo = normalizeIdValue(req.body?.bankDetails?.accountNo);
    if (nextBankAccountNo) {
      const clash = await User.findOne({
        'bankDetails.accountNo': nextBankAccountNo,
        id: { $ne: user.id }
      });
      if (clash) {
        return res.status(409).json({ message: 'bankDetails.accountNo already used by another user.' });
      }
    }

    if (req.body.upiId !== undefined) user.upiId = req.body.upiId;
    if (req.body.upiNo !== undefined) user.upiNo = req.body.upiNo;

    if (req.body.bankDetails && typeof req.body.bankDetails === 'object') {
      user.bankDetails = {
        ...(user.bankDetails || {}),
        accountHolder: req.body.bankDetails.accountHolder ?? user.bankDetails?.accountHolder ?? '',
        bankName: req.body.bankDetails.bankName ?? user.bankDetails?.bankName ?? '',
        accountNo: req.body.bankDetails.accountNo ?? user.bankDetails?.accountNo ?? '',
        ifsc: req.body.bankDetails.ifsc ?? user.bankDetails?.ifsc ?? '',
        branchName: req.body.bankDetails.branchName ?? user.bankDetails?.branchName ?? '',
      };
    }

    await user.save();

    const userObj = user.toObject();
    const { password, ...userWithoutPassword } = userObj;
    return res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error('Admin update payment error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set role (admin-only)
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body || {};
    const allowed = new Set(['member', 'franchise']);
    if (!role || !allowed.has(String(role))) {
      return res.status(400).json({ message: 'Invalid role. Allowed: member, franchise' });
    }

    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    user.roleAssignedBy = 'admin';
    user.roleAssignedAt = new Date();
    await user.save();

    const userObj = user.toObject();
    const { password, ...userWithoutPassword } = userObj;
    return res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error('Admin role update error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get KYC uploads for admin panel
router.get('/kyc', adminAuth, async (req, res) => {
  try {
    const kycs = await Kyc.find().lean();
    // Populate user info manually since we track userId as string, not ObjectId ref
    // Could use $lookup in future
    const userIds = kycs.map(k => k.userId);
    const users = await User.find({ id: { $in: userIds } }).lean();

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
  } catch (err) {
    console.error('Admin kyc fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdrawal requests for admin
router.get('/withdrawals', adminAuth, async (req, res) => {
  try {
    const items = await Withdrawal.find().sort({ requestedAt: -1 }).lean();
    const userIds = items.map(w => w.userId);
    const users = await User.find({ id: { $in: userIds } }).lean();

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
  } catch (err) {
    console.error('Admin withdrawals fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve withdrawal
router.post('/withdrawals/:id/approve', adminAuth, async (req, res) => {
  try {
    const w = await Withdrawal.findOne({ id: req.params.id });
    if (!w) return res.status(404).json({ message: 'Withdrawal request not found' });

    if (w.status !== 'pending') {
      return res.status(400).json({ message: `Cannot approve withdrawal in status: ${w.status}` });
    }

    const user = await User.findOne({ id: w.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const balance = Number(user.balance) || 0;
    const amount = Number(w.amount) || 0;

    if (amount <= 0) return res.status(400).json({ message: 'Invalid withdrawal amount' });
    if (amount > balance) {
      return res.status(400).json({ message: 'User has insufficient balance to approve this withdrawal.' });
    }

    // Deduct balance
    user.balance = balance - amount;
    user.withdrawal = (Number(user.withdrawal) || 0) + amount;
    await user.save();

    w.status = 'approved';
    w.approvedAt = new Date();
    w.approvedBy = 'admin';
    await w.save();

    return res.json({ withdrawal: w, user: { id: user.id, balance: user.balance, withdrawal: user.withdrawal } });
  } catch (err) {
    console.error('Withdrawal approve error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple stats endpoint
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const count = await User.countDocuments();
    const siteName = process.env.SITE_NAME || 'Life Spark Associates';
    res.json({ siteName, activeMembers: count });
  } catch (err) {
    console.error('Admin stats error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Projects management
router.get('/projects', adminAuth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/projects', adminAuth, async (req, res) => {
  try {
    const { title, desc, imageUrl, href } = req.body || {};

    if (!title || !desc) {
      return res.status(400).json({ message: 'title and desc are required' });
    }

    const project = new Project({
      id: `PRJ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: String(title).trim(),
      desc: String(desc).trim(),
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
      href: href ? String(href).trim() : '',
      createdAt: new Date(),
    });
    await project.save();

    return res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Team Members
router.get('/site/team-members', adminAuth, async (req, res) => {
  try {
    const items = await TeamMember.find().sort({ createdAt: -1 });
    return res.json({ teamMembers: items });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/site/team-members', adminAuth, async (req, res) => {
  try {
    const { name, role, imageUrl } = req.body || {};

    if (!name || !role) {
      return res.status(400).json({ message: 'name and role are required' });
    }

    const member = new TeamMember({
      id: `TEAM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: String(name).trim(),
      role: String(role).trim(),
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
      createdAt: new Date(),
    });
    await member.save();

    return res.status(201).json({ member });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Testimonials
router.get('/site/testimonials', adminAuth, async (req, res) => {
  try {
    const items = await Testimonial.find().sort({ createdAt: -1 });
    return res.json({ testimonials: items });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/site/testimonials', adminAuth, async (req, res) => {
  try {
    const { text, name, role } = req.body || {};

    if (!text || !name || !role) {
      return res.status(400).json({ message: 'text, name and role are required' });
    }

    const testimonial = new Testimonial({
      id: `TST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: String(text).trim(),
      name: String(name).trim(),
      role: String(role).trim(),
      createdAt: new Date(),
    });
    await testimonial.save();

    return res.status(201).json({ testimonial });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// E-Pin management for admin panel
router.get('/epins', adminAuth, async (req, res) => {
  try {
    const pool = await Epin.find({ used: false, ownerUserId: null });
    const codes = pool.map((e) => e.code);
    res.json({ epins: codes, available: codes.length });
  } catch (err) {
    console.error('Admin epins fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/epins/transfer', adminAuth, async (req, res) => {
  try {
    const { toUserId, count } = req.body || {};
    const howMany = Math.min(Math.max(parseInt(count || 1, 10) || 1, 1), 10);

    if (!toUserId) {
      return res.status(400).json({ message: 'toUserId is required' });
    }

    const target = await User.findOne({ id: String(toUserId) });
    if (!target) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Available Admin Pins
    // Limit search to howMany to avoid fetching all
    const available = await Epin.find({ used: false, ownerUserId: null }).limit(howMany);

    if (available.length < howMany) {
      const total = await Epin.countDocuments({ used: false, ownerUserId: null });
      return res.status(400).json({ message: `Not enough available pins in pool. Available: ${total}` });
    }

    const now = new Date();
    const selectedCodes = [];

    for (const e of available) {
      e.ownerUserId = target.id;
      e.transferredAt = now;
      e.transferredBy = 'admin';
      await e.save();
      selectedCodes.push(e.code);
    }

    const transferRecord = new EpinTransfer({
      id: `EPTR-${Date.now()}`,
      fromUserId: null,
      toUserId: target.id,
      toUserName: target.name,
      codes: selectedCodes,
      count: selectedCodes.length,
      transferredAt: now,
      transferredBy: 'admin',
    });
    await transferRecord.save();

    return res.status(201).json({ transfer: transferRecord });

  } catch (err) {
    console.error('Admin epin transfer error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/epins', adminAuth, async (req, res) => {
  try {
    const { count } = req.body || {};
    const howMany = Math.min(Math.max(parseInt(count || 1, 10) || 1, 1), 100);

    const newEpins = [];

    // Simple code generator
    function generateCode() {
      const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${part()}-${part()}-${part()}`;
    }

    // Generate in checking loop
    let created = 0;
    while (created < howMany) {
      const code = generateCode();
      // Check uniqueness 
      // Note: Checking deeply inside loop for DB is slow, but assuming rare collisions for now.
      // For strictness, catch E11000 duplicate error
      const exists = await Epin.findOne({ code });
      if (!exists) {
        await Epin.create({
          code,
          ownerUserId: null,
          used: false,
          createdAt: new Date()
        });
        newEpins.push({ code });
        created++;
      }
    }

    res.status(201).json({ epins: newEpins.map((e) => e.code) });
  } catch (err) {
    console.error('Admin create epin error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
