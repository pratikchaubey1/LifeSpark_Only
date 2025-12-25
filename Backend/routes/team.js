const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Direct team members (users invited by current user)
router.get('/direct', auth, async (req, res) => {
  try {
    const me = await User.findOne({ id: req.user.id });
    if (!me) return res.status(404).json({ message: 'User not found' });

    const ids = Array.isArray(me.directInviteIds) ? me.directInviteIds : [];

    // Fetch details of all invited users
    const direct = await User.find({ id: { $in: ids } });

    const response = direct.map((u) => ({
      id: u.id,
      name: u.name,
      inviteCode: u.inviteCode,
      isActivated: !!u.isActivated,
      role: u.role || 'member',
      createdAt: u.createdAt || null,
    }));

    return res.json({ members: response });
  } catch (err) {
    console.error('Team fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
