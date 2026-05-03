/**
 * Fresh Start Script: Reset all upgrade statuses
 * 
 * Sets upgradeStatus = 'none' and clears approval/request dates.
 * This makes every user subject to the 60-day rule from scratch
 * based on their calculated timers.
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function freshStart() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('🔄 Resetting upgrade statuses for all users...');

    const result = await usersCollection.updateMany(
      {},
      {
        $set: {
          upgradeStatus: 'none',
          upgradeApprovedAt: null,
          upgradeRequestedAt: null
        }
      }
    );

    console.log(`\n📊 Fresh Start Complete!`);
    console.log(`   ✅ Users reset: ${result.matchedCount}`);

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Reset error:', err);
    await mongoose.connection.close();
  }
}

freshStart();
