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
    }).select('_id name inviteCode isActivated role createdAt').lean();

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

// Import utility (needs to be at top, but adding here for context or moving to top)
const { getUsersAtLevel } = require('../utils/team');

// Get all users level-wise (1-10) with counts
router.get('/levels', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select('directInviteIds');
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const directIds = Array.isArray(currentUser.directInviteIds) ? currentUser.directInviteIds : [];
    const levels = [];

    // Pre-fetch user IDs for each level
    const levelUserIdsMap = {};

    for (let level = 1; level <= 10; level++) {
      if (level === 1) {
        levelUserIdsMap[level] = directIds;
      } else {
        levelUserIdsMap[level] = await getUsersAtLevel(directIds, level);
      }
    }

    // Process each level
    const levelPromises = Object.entries(levelUserIdsMap).map(async ([level, userIds]) => {
      const levelNum = Number(level);

      if (!userIds.length) {
        return {
          level: levelNum,
          activeCount: 0,
          inactiveCount: 0,
          totalCount: 0,
          users: []
        };
      }

      // Fetch all users at this level (no filters on status)
      const users = await User.find({
        _id: { $in: userIds }
      }).select('_id name phone inviteCode isActivated createdAt activatedAt').lean();

      // Calculate stats
      const activeCount = users.filter(u => u.isActivated).length;
      const inactiveCount = users.length - activeCount;

      return {
        level: levelNum,
        activeCount,
        inactiveCount,
        totalCount: users.length,
        users: users.map(u => ({
          id: u._id.toString(),
          name: u.name,
          phone: u.phone,
          inviteCode: u.inviteCode,
          isActivated: !!u.isActivated,
          createdAt: u.createdAt,
          activatedAt: u.activatedAt
        }))
      };
    });

    const levelResults = await Promise.all(levelPromises);

    // Sort by level just in case
    levelResults.sort((a, b) => a.level - b.level);

    return res.json({ levels: levelResults });

  } catch (err) {
    console.error('Get levels error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
