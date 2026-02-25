const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Direct team members (using sponsorId as Source of Truth)
router.get('/direct', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select('inviteCode');
    if (!me) return res.status(404).json({ message: 'User not found' });

    // Find all users who have this user's inviteCode as sponsorId
    const directMembers = await User.find({
      sponsorId: me.inviteCode
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

// Get all users level-wise (1-10) with counts (using optimized traversal)
router.get('/levels', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select('inviteCode');
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // Level 1: Users who were invited directly (Source of Truth: sponsorId)
    const directMembers = await User.find({ sponsorId: currentUser.inviteCode }).select('_id').lean();
    const directIds = directMembers.map(m => m._id.toString());

    // Optimized multi-level traversal
    const { getDownlineByLevels } = require('../utils/team');
    const levelUserIdsMap = await getDownlineByLevels(directIds);

    const levelPromises = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(async (levelNum) => {
      const userIds = levelUserIdsMap[levelNum] || [];

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
    return res.json({ levels: levelResults });

  } catch (err) {
    console.error('Get levels error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
