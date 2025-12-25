const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // PRJ-...
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    href: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
