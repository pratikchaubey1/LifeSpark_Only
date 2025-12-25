const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_me';

function generateInviteCode() {
  return 'LS' + Math.floor(100000 + Math.random() * 900000); // e.g. LS123456
}

async function generateUniqueInviteCode() {
  let code;
  let exists = true;
  while (exists) {
    code = generateInviteCode();
    exists = await User.findOne({ inviteCode: code });
  }
  return code;
}

// Public helper: lookup sponsor by invite code (for auto-fill sponsor name on register page)
router.get('/sponsor/:code', async (req, res) => {
  try {
    const code = String(req.params.code || '').trim();
    if (!code) return res.status(400).json({ message: 'Invite code is required' });

    const sponsorUser = await User.findOne({ inviteCode: code });
    if (!sponsorUser) return res.status(404).json({ message: 'Invalid invite code' });

    return res.json({
      sponsor: {
        id: sponsorUser._id,
        name: sponsorUser.name,
        inviteCode: sponsorUser.inviteCode
      }
    });
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
      sponsorName, // ignored if sponsorId matches an existing user (we set sponsor name automatically)
      phone,
      address,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // For the first-ever user allow signup without sponsor.
    // For all others sponsorId must be a valid invite code.
    const userCount = await User.countDocuments();
    const hasExistingUsers = userCount > 0;

    if (hasExistingUsers && !sponsorId) {
      return res.status(400).json({ message: 'Invite code (Sponsor ID) is required' });
    }

    // Find sponsor
    let sponsorUser = null;
    if (hasExistingUsers) {
      const code = String(sponsorId || '').trim();
      sponsorUser = await User.findOne({
        $or: [
          { inviteCode: code },
          { _id: code },
          { sponsorId: code }
        ]
      });
      if (!sponsorUser) {
        return res.status(400).json({ message: 'Invalid invite code' });
      }
    }

    // Uniqueness: email (case-insensitive)
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Uniqueness: phone (digits-only, last 10 digits) if provided
    const normalizePhone = (v) => {
      const digits = String(v || '').replace(/\D/g, '');
      if (!digits) return '';
      return digits.length > 10 ? digits.slice(-10) : digits;
    };

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      const phoneRegex = new RegExp(normalizedPhone + '$');
      const existingPhone = await User.findOne({ phone: phoneRegex });
      if (existingPhone) {
        return res.status(409).json({ message: 'Phone number already registered' });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const inviteCode = await generateUniqueInviteCode();

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashed,
      phone: normalizedPhone || (phone || ''),
      address: address || '',
      // Always store sponsorId as the sponsor's inviteCode for consistency
      sponsorId: sponsorUser ? sponsorUser.inviteCode : (sponsorId || ''),
      // Sponsor name is always derived from sponsorUser (if any)
      sponsorName: sponsorUser ? sponsorUser.name : (sponsorName || ''),
      inviteCode,
      // Roles: member (default), franchise
      role: 'member',
      roleAssignedBy: null,
      roleAssignedAt: null,
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
      // Optional extended profile fields
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
    });

    await newUser.save();

    // Track who invited this user (direct downline) on sponsor record
    if (sponsorUser) {
      if (!Array.isArray(sponsorUser.directInviteIds)) {
        sponsorUser.directInviteIds = [];
      }
      sponsorUser.directInviteIds.push(newUser._id.toString());

      // Reward inviter ₹6 when someone registers using their invite code
      const reward = 6;
      sponsorUser.balance = (Number(sponsorUser.balance) || 0) + reward;
      sponsorUser.totalIncome = (Number(sponsorUser.totalIncome) || 0) + reward;

      await sponsorUser.save();
    }

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
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
    console.log('Login request body:', req.body);
    const { email, username, password } = req.body;
    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      console.log('Login failed: Missing credentials');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const normalizedIdentifier = String(loginIdentifier).trim().toLowerCase();
    console.log('Login identifier:', normalizedIdentifier);

    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier },
        { inviteCode: { $regex: new RegExp('^' + normalizedIdentifier + '$', 'i') } },
        { name: { $regex: new RegExp('^' + normalizedIdentifier + '$', 'i') } }
      ]
    });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Handle plain text passwords for legacy users
    let match = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      match = await bcrypt.compare(password, user.password);
    } else {
      // Fallback for plain text passwords (if any exist)
      match = (password === user.password);
    }

    if (!match) {
      console.log('Login failed: Password mismatch for user', user._id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login success for user:', user._id);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ user: userObj, token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
