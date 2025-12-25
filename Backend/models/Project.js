const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
    timestamps: true,
    collection: 'projects'
});

// Indexes for performance
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
