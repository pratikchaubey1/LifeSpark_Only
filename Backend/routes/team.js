const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Direct team members (users invited by current user)
router.get('/direct', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    if (!me) return res.status(404).json({ message: 'User not found' });

    const ids = Array.isArray(me.directInviteIds) ? me.directInviteIds : [];

    // Find all users whose IDs are in the directInviteIds array
    const directMembers = await User.find({
      _id: { $in: ids }
    }).select('_id name inviteCode isActivated role createdAt');

    const members = directMembers.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      inviteCode: u.inviteCode,
      isActivated: !!u.isActivated,
      role: u.role || 'member',
      createdAt: u.createdAt || null,
    }));

    return res.json({ members });
  } catch (err) {
    console.error('Get team error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
