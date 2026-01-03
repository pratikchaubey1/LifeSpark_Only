const User = require('../models/User');

const LEVEL_INCOME_RATES = {
    1: 6,
    2: 5,
    3: 4,
    4: 3,
    5: 2,
    6: 1,
    7: 0.5,
    8: 0.5,
    9: 0.5,
    10: 0.5
};

const SPONSOR_INCOME = 50;

/**
 * Distribute income to 10 levels of sponsors when a user activates.
 * @param {Object} beneficiary - The user who just activated.
 */
async function distributeIncome(beneficiary) {
    try {
        if (!beneficiary.sponsorId) return;

        let currentSponsorCode = beneficiary.sponsorId;

        for (let level = 1; level <= 10; level++) {
            if (!currentSponsorCode) break;

            const sponsor = await User.findOne({ inviteCode: currentSponsorCode });
            if (!sponsor) break;

            let totalToCredit = 0;
            const levelRate = LEVEL_INCOME_RATES[level] || 0;

            // 1. Level 1 logic: Give SPONSOR_INCOME (50) + Level 1 rate (6) = ₹56 total
            if (level === 1) {
                totalToCredit = SPONSOR_INCOME + levelRate;
                sponsor.levelIncome = (Number(sponsor.levelIncome) || 0) + levelRate;
            } else {
                // 2. Level 2-10 logic: Give the standard level rate
                totalToCredit = levelRate;
                sponsor.levelIncome = (Number(sponsor.levelIncome) || 0) + levelRate;
            }

            if (totalToCredit > 0) {
                sponsor.balance = (Number(sponsor.balance) || 0) + totalToCredit;
                sponsor.totalIncome = (Number(sponsor.totalIncome) || 0) + totalToCredit;

                console.log(`Crediting Level ${level} Sponsor ${sponsor.inviteCode}: +₹${totalToCredit}`);
                await sponsor.save();
            }

            // Move up to the next sponsor in the chain
            currentSponsorCode = sponsor.sponsorId;
        }
    } catch (err) {
        console.error('Error distributing income:', err);
    }
}

/**
 * Distribute level income daily to 10 sponsors when a user receives their daily bonus.
 * @param {Object} beneficiary - The user who just received daily bonus.
 */
async function distributeDailyLevelIncome(beneficiary) {
    try {
        if (!beneficiary.sponsorId) return;

        let currentSponsorCode = beneficiary.sponsorId;

        for (let level = 1; level <= 10; level++) {
            if (!currentSponsorCode) break;

            const sponsor = await User.findOne({ inviteCode: currentSponsorCode });
            if (!sponsor) break;

            const levelRate = LEVEL_INCOME_RATES[level] || 0;

            if (levelRate > 0) {
                sponsor.balance = (Number(sponsor.balance) || 0) + levelRate;
                sponsor.totalIncome = (Number(sponsor.totalIncome) || 0) + levelRate;
                sponsor.levelIncome = (Number(sponsor.levelIncome) || 0) + levelRate;

                // console.log(`Crediting Daily Level ${level} Sponsor ${sponsor.inviteCode}: +₹${levelRate}`);
                await sponsor.save();
            }

            // Move up
            currentSponsorCode = sponsor.sponsorId;
        }
    } catch (err) {
        console.error('Error distributing daily level income:', err);
    }
}

module.exports = {
    distributeIncome,
    distributeDailyLevelIncome
};
