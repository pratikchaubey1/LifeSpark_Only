require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const col = db.collection('users');

    const totalActive = await col.countDocuments({ isActivated: true });
    const withReferrals = await col.countDocuments({ 
        isActivated: true, 
        'directInviteIds.0': { $exists: true } 
    });
    const noReferrals = await col.countDocuments({ 
        isActivated: true, 
        $or: [
            { directInviteIds: { $size: 0 } }, 
            { directInviteIds: { $exists: false } }, 
            { directInviteIds: null }
        ] 
    });
    const withDateSet = await col.countDocuments({ 
        isActivated: true, 
        firstReferralDate: { $ne: null } 
    });

    console.log('--- Diagnostic Results ---');
    console.log('Total Active Users:', totalActive);
    console.log('Active Users with Referrals (1+):', withReferrals);
    console.log('Active Users without Referrals (0):', noReferrals);
    console.log('Active Users with firstReferralDate already set:', withDateSet);
    console.log('--------------------------');

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
