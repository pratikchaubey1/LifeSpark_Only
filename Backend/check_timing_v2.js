const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkTimingV2() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const sponsor = await User.findOne({ inviteCode: 'LS753401' });
        const referral = await User.findOne({ inviteCode: 'LS939413' }); // Rajkishor

        console.log("=== TIMING AUDIT V2 ===");

        if (sponsor) {
            console.log(`\nSponsor (LS753401): ${sponsor.name}`);
            console.log(`- Created At: ${sponsor.createdAt}`);
            console.log(`- Activated: ${sponsor.isActivated}`);
            console.log(`- Activated At: ${sponsor.activatedAt ? sponsor.activatedAt.toISOString() : 'NULL'}`);
            console.log(`- Balance: ${sponsor.balance}`);
        } else {
            console.log("Sponsor LS753401 NOT FOUND");
        }

        if (referral) {
            console.log(`\nReferral (LS939413): ${referral.name}`);
            console.log(`- Sponsor ID: ${referral.sponsorId}`);
            console.log(`- Created At: ${referral.createdAt}`);
            console.log(`- Activated: ${referral.isActivated}`);
            console.log(`- Activated At: ${referral.activatedAt ? referral.activatedAt.toISOString() : 'NULL'}`);
        } else {
            console.log("Referral LS939413 NOT FOUND");
        }

        if (sponsor && referral) {
            console.log("\n--- Comparison ---");
            if (sponsor.activatedAt && referral.activatedAt) {
                if (sponsor.activatedAt < referral.activatedAt) {
                    console.log("TIMING OK: Sponsor activated BEFORE Referral.");
                } else {
                    console.log("TIMING ISSUE: Sponsor activated AFTER Referral.");
                }
            } else {
                console.log("Cannot compare activation times (one is missing).");
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTimingV2();
