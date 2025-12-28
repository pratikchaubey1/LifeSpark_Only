const express = require('express');
const SiteSettings = require('../models/SiteSettings');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public: Get site settings
router.get('/', async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            // Initialize if not exists
            settings = new SiteSettings();
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        console.error('Get site settings error', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Update site settings
router.post('/', adminAuth, async (req, res) => {
    try {
        const { marqueeText, marqueeEnabled, popupImageUrl, popupEnabled } = req.body;

        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings();
        }

        if (marqueeText !== undefined) settings.marqueeText = marqueeText;
        if (marqueeEnabled !== undefined) settings.marqueeEnabled = marqueeEnabled;
        if (popupImageUrl !== undefined) settings.popupImageUrl = popupImageUrl;
        if (popupEnabled !== undefined) settings.popupEnabled = popupEnabled;

        settings.updatedAt = Date.now();
        await settings.save();

        res.json({ message: 'Settings updated successfully', settings });
    } catch (err) {
        console.error('Update site settings error', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
