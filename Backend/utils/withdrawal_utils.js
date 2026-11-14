const Withdrawal = require('../models/Withdrawal');
const Epin = require('../models/Epin');

const WITHDRAWAL_TIERS = [
  { limit: 5000, fee: 1000 },
  { limit: 15000, fee: 1000 },
  { limit: 25000, fee: 1000 },
  { limit: 40000, fee: 1500 },
  { limit: 80000, fee: 2000 },
  { limit: 120000, fee: 2500 },
  { limit: 160000, fee: 2500 },
];

async function getTotalWithdrawnAmount(userId) {
  const uid = userId ? userId.toString() : '';
  if (!uid) return { totalWithdrawn: 0, totalCash: 0, totalEpin: 0 };

  // Cash withdrawals: approved + pending, excluding upgrade fee requests
  const withdrawnAgg = await Withdrawal.aggregate([
    {
      $match: {
        userId: uid,
        type: { $ne: 'upgrade' },
        withdrawalId: { $not: /^UP-/ },
        status: { $in: ['approved', 'pending'] }
      }
    },
    { $group: { _id: null, total: { $sum: { $ifNull: ['$originalAmount', '$amount'] } } } }
  ]);
  const totalCash = withdrawnAgg.length > 0 ? withdrawnAgg[0].total : 0;

  // Self-generated E-Pins purchased from wallet balance
  const epinAgg = await Epin.aggregate([
    {
      $match: {
        $or: [
          { generatedByUserId: uid },
          { ownerUserId: uid, isSelfGenerated: true },
          { ownerUserId: uid, pinTag: 'SELF-GENERATED' },
          { ownerUserId: uid, code: { $regex: /^SELF-/i } }
        ]
      }
    },
    { $group: { _id: null, total: { $sum: { $ifNull: ['$cost', 1650] } } } }
  ]);
  const totalEpin = epinAgg.length > 0 ? epinAgg[0].total : 0;

  return {
    totalWithdrawn: totalCash + totalEpin,
    totalCash,
    totalEpin
  };
}

module.exports = {
  WITHDRAWAL_TIERS,
  getTotalWithdrawnAmount
};

