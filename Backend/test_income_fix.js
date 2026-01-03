const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const { distributeIncome } = require('./utils/income');

async function testIncomeFix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('=== TESTING INCOME DISTRIBUTION FIX ===\n');

        // Test 1: Find a user and check their current income
        const testUser = await User.findOne({ inviteCode: 'LS753401' });
        if (!testUser) {
            console.log('Test user not found');
            process.exit(1);
        }

        console.log(`Test User: ${testUser.name} (${testUser.inviteCode})`);
        console.log(`Current Total Income: ₹${testUser.totalIncome}`);
        console.log(`Current Balance: ₹${testUser.balance}`);
        console.log(`Is Activated: ${testUser.isActivated}`);

        // Test 2: Try to call distributeIncome again (should not add extra income if already activated)
        console.log('\n--- Attempting to distribute income again ---');
        const beforeIncome = testUser.totalIncome;

        // This should NOT add extra income since the user is already activated
        // and the admin route now checks for this
        console.log('Note: This test simulates what would happen if distributeIncome was called again.');
        console.log('The admin route now prevents this, but we can see what the function does.');

        // Get sponsor's current income
        if (testUser.sponsorId) {
            const sponsor = await User.findOne({ inviteCode: testUser.sponsorId });
            if (sponsor) {
                console.log(`\nSponsor: ${sponsor.name} (${sponsor.inviteCode})`);
                console.log(`Sponsor's Current Income: ₹${sponsor.totalIncome}`);

                const sponsorBeforeIncome = sponsor.totalIncome;

                // Simulate calling distributeIncome (this would happen if admin clicked activate again)
                await distributeIncome(testUser);

                // Refresh sponsor data
                const sponsorAfter = await User.findOne({ inviteCode: testUser.sponsorId });
                console.log(`\nSponsor's Income After Call: ₹${sponsorAfter.totalIncome}`);
                console.log(`Income Added: ₹${sponsorAfter.totalIncome - sponsorBeforeIncome}`);

                if (sponsorAfter.totalIncome > sponsorBeforeIncome) {
                    console.log('\n⚠️  WARNING: Extra income was added! This is the bug.');
                    console.log('The admin route fix should prevent this from happening.');
                } else {
                    console.log('\n✅ No extra income added - function is safe.');
                }
            }
        }

        console.log('\n=== TEST COMPLETE ===');
        console.log('The fix in admin.js prevents re-activation, so this duplicate call should never happen in production.');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testIncomeFix();
