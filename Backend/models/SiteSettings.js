const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    marqueeText: {
        type: String,
        default: 'सपनों की दुनिया को वास्तविकता में बदलने जा रहा।'
    },
    marqueeEnabled: {
        type: Boolean,
        default: true
    },
    popupImageUrl: {
        type: String,
        default: ''
    },
    popupEnabled: {
        type: Boolean,
        default: false
    },
    cronEnabled: {
        type: Boolean,
        default: true
    },
    dannFundBalance: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
