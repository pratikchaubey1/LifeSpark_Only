/**
 * Cleanup Script: Reset timers for users with no active referrals
 * 
 * This script finds all users who have a firstReferralDate set,
 * but do NOT have any active members in their direct downline.
 * It resets their firstReferralDate to null, so their 60-day clock 
 * will only start when their first member actually activates.
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users with a timer set
    const usersWithTimer = await usersCollection.find({
      firstReferralDate: { $ne: null }
    }).toArray();

    console.log(`📋 Checking ${usersWithTimer.length} users with timers...`);

    let resetCount = 0;
    let keptCount = 0;

    for (const user of usersWithTimer) {
      // Check if they have any active direct referrals
      const activeReferral = await usersCollection.findOne({
        sponsorId: user.inviteCode,
        isActivated: true
      });

      if (!activeReferral) {
        // No active referrals! Reset the timer.
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { firstReferralDate: null, upgradeStatus: 'none' } }
        );
        console.log(`🔄 Reset timer for ${user.name} (${user.inviteCode}) - No active referrals found.`);
        resetCount++;
      } else {
        // They have at least one active referral.
        // We should actually set their timer to the date of their FIRST active referral's activation
        // to be extremely fair.
        const firstActive = await usersCollection.find({
          sponsorId: user.inviteCode,
          isActivated: true
        }).sort({ activatedAt: 1 }).limit(1).toArray();

        if (firstActive.length > 0 && firstActive[0].activatedAt) {
            const newDate = new Date(firstActive[0].activatedAt);
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { firstReferralDate: newDate } }
            );
            console.log(`✅ Kept/Updated timer for ${user.name} (${user.inviteCode}) - First active referral was on ${newDate.toLocaleDateString()}`);
        }
        keptCount++;
      }
    }

    console.log(`\n📊 Cleanup Complete!`);
    console.log(`   🔄 Resetted: ${resetCount} users (No active referrals)`);
    console.log(`   ✅ Kept/Updated: ${keptCount} users (Had active referrals)`);

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Cleanup error:', err);
    await mongoose.connection.close();
  }
}

cleanup();
