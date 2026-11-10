const User = require('../models/User');
const { getDownlineByLevels } = require('./team');

const RANK_TIERS = [
  { level: 1, rank: 'Associate', target: 10, reward: 'Silver coin / 500' },
  { level: 2, rank: 'Executive Associate', target: 100, reward: 'Mobile / 8000' },
  { level: 3, rank: 'Team Leader', target: 1000, reward: 'Tab / 15000' },
  { level: 4, rank: 'Senior Leader', target: 10000, reward: 'Laptop / 20,000' },
  { level: 5, rank: 'Bronze Manager', target: 100000, reward: 'Bike / 75000' },
  { level: 6, rank: 'Silver Manager', target: 1000000, reward: '2 lakh' },
  { level: 7, rank: 'Gold Director', target: 10000000, reward: 'ALTO' },
  { level: 8, rank: 'Platinum Director', target: 100000000, reward: 'SWIFT' },
  { level: 9, rank: 'Diamond Ambassador', target: 1000000000, reward: 'SCORPIO' },
  { level: 10, rank: 'Crown Royal Ambassador', target: 100000000000, reward: 'BUNGALOW' }
];

/**
 * Calculates a user's rank according to downline levels & targets.
 * Level 1: 10 members -> Associate
 * Level 2: 100 members -> Executive Associate
 * Level 3: 1,000 members -> Team Leader
 * ...
 * Level 10: 100,000,000,000 members -> Crown Royal Ambassador
 */
async function calculateUserRank(user) {
  if (!user) {
    return {
      rank: 'Member',
      calculatedRank: 'Member',
      achievedLevel: 0,
      levelCounts: {},
      nextTier: RANK_TIERS[0],
      tiers: RANK_TIERS
    };
  }

  // 1. Fetch direct referrals (ALL, to get their IDs for tree traversal)
  const directMembers = await User.find({ sponsorId: user.inviteCode })
    .select('_id isActivated')
    .lean();
  const directIds = directMembers.map(m => m._id.toString());

  // 2. Map downline by level (all IDs — active filtering done below)
  const levelUserIdsMap = await getDownlineByLevels(directIds);

  // 3. Collect ALL downline IDs across all levels, then batch-fetch activation status
  const allDownlineIds = [];
  for (let l = 1; l <= 10; l++) {
    if (levelUserIdsMap[l]) allDownlineIds.push(...levelUserIdsMap[l]);
  }

  // Single DB query to get activation status of all downline members
  const activationMap = {};
  if (allDownlineIds.length > 0) {
    const allUsers = await User.find({ _id: { $in: allDownlineIds } })
      .select('_id isActivated')
      .lean();
    allUsers.forEach(u => { activationMap[u._id.toString()] = u.isActivated; });
  }
  // Also include direct members in activation map
  directMembers.forEach(m => { activationMap[m._id.toString()] = m.isActivated; });

  // 4. Count ONLY active IDs at each level
  const levelCounts = {};
  for (let l = 1; l <= 10; l++) {
    const ids = levelUserIdsMap[l] || [];
    // Count only activated members — RANK is based on active IDs only
    levelCounts[l] = ids.filter(id => activationMap[id] === true).length;
  }
  // Level 1: active direct referrals
  const activeDirectCount = directMembers.filter(m => m.isActivated).length;
  if (activeDirectCount > (levelCounts[1] || 0)) {
    levelCounts[1] = activeDirectCount;
  }

  // 3. Determine achieved rank level sequentially
  let calculatedRank = 'Member';
  let achievedLevel = 0;

  for (const tier of RANK_TIERS) {
    const count = levelCounts[tier.level] || 0;
    if (count >= tier.target) {
      calculatedRank = tier.rank;
      achievedLevel = tier.level;
    } else {
      break; // Sequential progression
    }
  }

  // 4. Admin override check
  let finalRank = calculatedRank;
  if (user.customRank && user.customRank !== 'Auto' && user.customRank.trim() !== '') {
    finalRank = user.customRank.trim();
  } else if (user.rank && user.rank !== 'Member' && user.rank !== 'Auto' && achievedLevel === 0) {
    finalRank = user.rank;
  }

  // 5. Next Tier info
  const nextTierConfig = RANK_TIERS.find(t => t.level === achievedLevel + 1) || null;
  let nextTier = null;
  if (nextTierConfig) {
    const currentCount = levelCounts[nextTierConfig.level] || 0;
    const progressPercent = Math.min(100, Math.round((currentCount / nextTierConfig.target) * 100));
    nextTier = {
      level: nextTierConfig.level,
      rank: nextTierConfig.rank,
      target: nextTierConfig.target,
      reward: nextTierConfig.reward,
      currentCount,
      progressPercent
    };
  }

  return {
    rank: finalRank,
    calculatedRank,
    achievedLevel,
    levelCounts,
    nextTier,
    tiers: RANK_TIERS
  };
}

module.exports = {
  RANK_TIERS,
  calculateUserRank
};

