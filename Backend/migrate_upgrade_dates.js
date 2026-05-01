/**
 * One-time Migration Script: Set firstReferralDate for existing users
 * 
 * This script finds all users who already have direct referrals (directInviteIds.length > 0)
 * but don't have a firstReferralDate set, and sets it to their activatedAt date.
 * 
 * This ensures old users are also covered by the 60-day upgrade system.
 * 
 * Run with: node migrate_upgrade_dates.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users who have referrals but no firstReferralDate
    const usersToUpdate = await usersCollection.find({
      'directInviteIds.0': { $exists: true },  // Has at least 1 referral
      firstReferralDate: { $eq: null },          // No firstReferralDate set
    }).toArray();

    console.log(`📋 Found ${usersToUpdate.length} users to migrate.\n`);

    if (usersToUpdate.length === 0) {
      console.log('✅ Nothing to do. All users are already migrated.');
      await mongoose.connection.close();
      return;
    }

    let updated = 0;
    let skipped = 0;

    for (const user of usersToUpdate) {
      // Only use activatedAt — skip users without activation date
      if (!user.activatedAt) {
        console.log(`⚠️  Skipping ${user.name} (${user.inviteCode}) — no activatedAt date`);
        skipped++;
        continue;
      }

      const dateToUse = user.activatedAt;

      const daysSince = (Date.now() - new Date(dateToUse).getTime()) / (1000 * 60 * 60 * 24);
      const willExpire = daysSince >= 60;

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            firstReferralDate: new Date(dateToUse),
            upgradeStatus: 'none',  // Let the dashboard check handle expiry
          }
        }
      );

      console.log(`✅ ${user.name} (${user.inviteCode}) → firstReferralDate = ${new Date(dateToUse).toLocaleDateString()} | ${Math.floor(daysSince)} days ago | ${willExpire ? '🔴 WILL BE EXPIRED' : '🟢 Still active'}`);
      updated++;
    }

    console.log(`\n📊 Migration Complete!`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   📋 Total:   ${usersToUpdate.length}`);

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  } catch (err) {
    console.error('❌ Migration error:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migrate();
