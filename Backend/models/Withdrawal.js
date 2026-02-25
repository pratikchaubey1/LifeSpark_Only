const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    withdrawalId: { type: String, required: true, unique: true }, // e.g., 'WD-1234567890'
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    upiId: { type: String, default: '' },
    upiNo: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, required: true },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: String, default: null },
    source: { type: String, enum: ['balance', 'marriageFund', 'accidentFund'], default: 'balance' },
    type: { type: String, enum: ['withdrawal', 'upgrade'], default: 'withdrawal' },
    method: { type: String, enum: ['upi', 'cash'], default: 'upi' },
}, {
    timestamps: true,
    collection: 'withdrawals'
});

// Indexes for performance
withdrawalSchema.index({ userId: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ requestedAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
