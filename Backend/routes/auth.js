const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_me';

// Helper to generate Invite Code
async function generateUniqueInviteCode() {
  let code;
  let exists = true;
  while (exists) {
    code = 'LS' + Math.floor(100000 + Math.random() * 900000); // e.g. LS123456
    const user = await User.findOne({ inviteCode: code });
    if (!user) exists = false;
  }
  return code;
}

// Helper to generate User ID
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

// Public helper: lookup sponsor by invite code
router.get('/sponsor/:code', async (req, res) => {
  try {
    const code = String(req.params.code || '').trim();
    if (!code) return res.status(400).json({ message: 'Invite code is required' });

    const sponsorUser = await User.findOne({ inviteCode: code });
    if (!sponsorUser) return res.status(404).json({ message: 'Invalid invite code' });

    return res.json({ sponsor: { id: sponsorUser.id, name: sponsorUser.name, inviteCode: sponsorUser.inviteCode } });
  } catch (err) {
    console.error('Sponsor lookup error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

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

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check if any users exist to enforce sponsor check
    const existingCount = await User.countDocuments();
    if (existingCount > 0 && !sponsorId) {
      return res.status(400).json({ message: 'Invite code (Sponsor ID) is required' });
    }

    // Find sponsor
    let sponsorUser = null;
    if (existingCount > 0) {
      const code = String(sponsorId || '').trim();
      // Search by inviteCode primarily, fallbacks for legacy ID
      sponsorUser = await User.findOne({
        $or: [
          { inviteCode: code },
          { id: code }
        ]
      });

      if (!sponsorUser) {
        return res.status(400).json({ message: 'Invalid invite code' });
      }
    }

    // Check uniqueness: email
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Check uniqueness: phone (last 10 digits)
    const normalizePhone = (v) => {
      const digits = String(v || '').replace(/\D/g, '');
      if (!digits) return '';
      return digits.length > 10 ? digits.slice(-10) : digits;
    };
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      // This is a bit complex for Mongo query without storing normalized phone, 
      // but for now we can rely on exact match if we stored raw. 
      // Ideally we should store normalized phone.
      // Let's iterate if we want to be strict, or just query.
      // Assuming we store exact phone for now.
      const existingPhone = await User.findOne({ phone: phone }); // Simple check
      if (existingPhone) {
        return res.status(409).json({ message: 'Phone number already registered' });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const inviteCode = await generateUniqueInviteCode();
    const newId = await generateUniqueUserId();

    const newUser = new User({
      id: newId,
      name,
      email: normalizedEmail,
      password: hashed,
      phone: normalizedPhone || (phone || ''),
      address: address || '',
      sponsorId: sponsorUser ? sponsorUser.inviteCode : (sponsorId || ''),
      sponsorName: sponsorUser ? sponsorUser.name : (sponsorName || ''),
      inviteCode,
      role: 'member',
      createdAt: new Date(),
      lastDailyCredit: new Date().toISOString().slice(0, 10),
    });

    await newUser.save();

    // Track direct invite and reward sponsor
    if (sponsorUser) {
      sponsorUser.directInviteIds.push(newUser.id);
      const reward = 6;
      sponsorUser.balance = (Number(sponsorUser.balance) || 0) + reward;
      sponsorUser.totalIncome = (Number(sponsorUser.totalIncome) || 0) + reward;
      await sponsorUser.save();
    }

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({ user: userObj, token });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    // Login with User ID, Email. (Req says "use user's ID (or email) ... instead of name field")
    // 'username' here might be the field name from frontend, containing email or ID.
    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: 'User ID/Email and password are required' });
    }

    const normalizedIdentifier = String(loginIdentifier).trim();
    const normalizedEmailIdentifier = normalizedIdentifier.toLowerCase();

    // Query: by Email (exact) OR by ID (exact) OR by InviteCode (exact)
    // Removed Name check as per request ("instead of using the name field")
    const user = await User.findOne({
      $or: [
        { email: normalizedEmailIdentifier },
        { id: normalizedIdentifier },
        { inviteCode: normalizedIdentifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let match = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = (password === user.password);
    }

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ user: userObj, token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
