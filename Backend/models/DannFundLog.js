const mongoose = require('mongoose');

const dannFundLogSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userName: String,
    userInviteCode: String,
    type: {
        type: String,
        required: true,
        enum: ['contribution', 'transfer'],
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('DannFundLog', dannFundLogSchema);
