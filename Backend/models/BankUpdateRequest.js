const mongoose = require('mongoose');

const bankUpdateRequestSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  userInviteCode: { type: String, default: '' },
  userPhone: { type: String, default: '' },
  currentBankDetails: {
    accountHolder: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNo: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    branchName: { type: String, default: '' }
  },
  requestedBankDetails: {
    accountHolder: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNo: { type: String, required: true },
    ifsc: { type: String, required: true },
    branchName: { type: String, required: true }
  },
  reason: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  adminRemark: { type: String, default: '' },
  reviewedBy: { type: String, default: null },
  reviewedAt: { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'bank_update_requests'
});

module.exports = mongoose.model('BankUpdateRequest', bankUpdateRequestSchema);

