const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    withdrawalId: { type: String, required: true, unique: true }, // e.g., 'WD-1234567890'
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    upiId: { type: String, required: true },
    upiNo: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, required: true },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: String, default: null }
}, {
    timestamps: true,
    collection: 'withdrawals'
});

// Indexes for performance
withdrawalSchema.index({ userId: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ requestedAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
