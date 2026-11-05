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

  // 1. Fetch direct referrals
  const directMembers = await User.find({ sponsorId: user.inviteCode })
    .select('_id isActivated')
    .lean();
  const directIds = directMembers.map(m => m._id.toString());

  // 2. Map downline by level
  const levelUserIdsMap = await getDownlineByLevels(directIds);

  const levelCounts = {};
  for (let l = 1; l <= 10; l++) {
    levelCounts[l] = (levelUserIdsMap[l] || []).length;
  }
  // Ensure level 1 count is at least direct referrals count
  if (directMembers.length > (levelCounts[1] || 0)) {
    levelCounts[1] = directMembers.length;
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

