const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    role: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
