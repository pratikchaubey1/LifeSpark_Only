/**
 * Migration Script: Backfill incomeExpiryDate for all active users
 * 
 * Sets incomeExpiryDate = activatedAt + 60 days.
 * This ensures the new 'Income Generation Block' applies to all old members.
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function migrateIncomeExpiry() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all activated users who DON'T have an incomeExpiryDate yet
    const usersToUpdate = await usersCollection.find({
      isActivated: true,
      incomeExpiryDate: null,
      activatedAt: { $ne: null }
    }).toArray();

    console.log(`📋 Found ${usersToUpdate.length} users to migrate.\n`);

    if (usersToUpdate.length === 0) {
      console.log('✅ All active users already have an income expiry date.');
      await mongoose.connection.close();
      return;
    }

    let updated = 0;

    for (const user of usersToUpdate) {
      const activationDate = new Date(user.activatedAt);
      const expiryDate = new Date(activationDate.getTime() + 60 * 24 * 60 * 60 * 1000);

      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { incomeExpiryDate: expiryDate } }
      );

      const daysRemaining = Math.floor((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
      console.log(`✅ ${user.name} (${user.inviteCode}) | Expiry: ${expiryDate.toLocaleDateString()} | ${daysRemaining < 0 ? '🔴 EXPIRED FOR UPLINE' : '🟢 ' + daysRemaining + ' days left'}`);
      updated++;
    }

    console.log(`\n📊 Migration Complete!`);
    console.log(`   ✅ Updated: ${updated} users`);

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Migration error:', err);
    await mongoose.connection.close();
  }
}

migrateIncomeExpiry();
