const mongoose = require('mongoose');

const incomeLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, default: '' },
    userInviteCode: { type: String, default: '' },
    type: {
        type: String,
        required: true,
        enum: ['daily_bonus', 'sponsor_income', 'level_income', 'daily_level_income', 'marriage_fund', 'accident_fund', 'repurchase_transfer', 'withdrawal'],
        index: true
    },
    amount: { type: Number, required: true },
    level: { type: Number, default: null },
    fromUserId: { type: String, default: null },
    fromUserName: { type: String, default: null },
    description: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now, index: true }
});

// Compound index for efficient filtered queries
incomeLogSchema.index({ type: 1, createdAt: -1 });
incomeLogSchema.index({ userInviteCode: 1, createdAt: -1 });

module.exports = mongoose.model('IncomeLog', incomeLogSchema);
