const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // WD-...
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    upiId: { type: String, default: '' },
    upiNo: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    approvedBy: { type: String }
});

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
