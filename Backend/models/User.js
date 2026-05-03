const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Authentication & Basic Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },

  // Referral System
  sponsorId: { type: String, default: '' }, // Sponsor's invite code
  sponsorName: { type: String, default: '' },
  inviteCode: { type: String, required: true, unique: true },
  directInviteIds: [{ type: String }], // Array of user IDs who used this user's invite code

  // Role Management
  role: { type: String, enum: ['member', 'franchise'], default: 'member' },
  roleAssignedBy: { type: String, default: null },
  roleAssignedAt: { type: Date, default: null },

  // Activation Status
  isActivated: { type: Boolean, default: false },
  activationPackage: { type: String, default: null }, // e.g., 'Basic', 'Standard'
  activatedAt: { type: Date, default: null },

  // Block Status
  isBlocked: { type: Boolean, default: false },

  // 60-Day Upgrade System
  firstReferralDate: { type: Date, default: null },   // Set when user's first direct member joins
  upgradeStatus: { type: String, enum: ['none', 'pending', 'approved', 'expired'], default: 'none' },
  upgradeRequestedAt: { type: Date, default: null },
  upgradeApprovedAt: { type: Date, default: null },
  incomeExpiryDate: { type: Date, default: null },   // 60 days from activation/upgrade

  // Financial Fields
  balance: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },
  withdrawal: { type: Number, default: 0 },
  freedomIncome: { type: Number, default: 0 },
  dailyBonusIncome: { type: Number, default: 0 },
  rankRewardIncome: { type: Number, default: 0 },
  levelIncome: { type: Number, default: 0 },
  marriageFund: { type: Number, default: 0 },
  accidentFund: { type: Number, default: 0 },
  repurchaseWallet: { type: Number, default: 0 },
  upgradeLevel: { type: Number, default: 0 }, // Tracks how many 10k withdrawal segments unlocked
  lastDailyCredit: { type: String, default: () => new Date().toISOString().slice(0, 10) },

  // Reward Tracking
  rewardCompletions: [
    {
      level: { type: Number, required: true },
      status: { type: String, enum: ['pending', 'claimed', 'given'], default: 'pending' },
      completedAt: { type: Date, default: Date.now },
      processedAt: { type: Date, default: null },
      processedBy: { type: String, default: null }
    }
  ],

  // Autopool System
  autopoolStatus: { type: String, enum: ['inactive', 'requested', 'active', 'rejected'], default: 'inactive' },
  autopoolParent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  autopoolChildren: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  autopoolJoinDate: { type: Date, default: null },
  autopoolLevelIncome: { type: Number, default: 0 },
  autopoolLevelsCompleted: [{ type: Number }], // Stores levels (1, 2, 3...) that have been paid out

  // Extended Profile Fields
  gender: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pinCode: { type: String, default: '' },
  age: { type: String, default: '' },
  panNo: { type: String, default: '' },
  aadhaarNo: { type: String, default: '' },
  nomineeName: { type: String, default: '' },
  nomineeRelation: { type: String, default: '' },
  upiNo: { type: String, default: '' },
  upiId: { type: String, default: '' },

  // Bank Details
  bankDetails: {
    accountHolder: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNo: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    branchName: { type: String, default: '' }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'users'
});

// Indexes for performance
// Note: 'email' and 'inviteCode' already have unique indexes from schema definition
userSchema.index({ phone: 1 });
userSchema.index({ sponsorId: 1 });
userSchema.index({ isActivated: 1 });
userSchema.index({ isBlocked: 1 });
userSchema.index({ autopoolStatus: 1 });
userSchema.index({ sponsorId: 1, isActivated: 1 }); // Compound index for referral queries

module.exports = mongoose.model('User', userSchema);
