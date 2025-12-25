const mongoose = require('mongoose');

const BankDetailsSchema = new mongoose.Schema({
  accountHolder: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountNo: { type: String, default: '' },
  ifsc: { type: String, default: '' },
  branchName: { type: String, default: '' }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Keeping custom ID for now to maintain compatibility with frontend or references
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  
  // Sponsor/Network
  sponsorId: { type: String }, // inviteCode of sponsor
  sponsorName: { type: String },
  inviteCode: { type: String, unique: true },
  directInviteIds: [{ type: String }], // Array of user IDs
  
  // Roles
  role: { type: String, enum: ['member', 'franchise', 'admin'], default: 'member' },
  roleAssignedBy: { type: String },
  roleAssignedAt: { type: Date },

  // Activation
  isActivated: { type: Boolean, default: false },
  activationPackage: { type: String },
  activatedAt: { type: Date },
  activationPin: { type: String },

  // Wallet
  balance: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },
  withdrawal: { type: Number, default: 0 },
  freedomIncome: { type: Number, default: 0 },
  dailyBonusIncome: { type: Number, default: 0 },
  rankRewardIncome: { type: Number, default: 0 },
  
  // Timestamps/Tracking
  lastDailyCredit: { type: String }, // format YYYY-MM-DD
  createdAt: { type: Date, default: Date.now },
  
  // Extended Profile
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
  bankDetails: { type: BankDetailsSchema, default: () => ({}) }
});

module.exports = mongoose.model('User', UserSchema);
