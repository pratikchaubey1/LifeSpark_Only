const m = require('mongoose');
require('dotenv').config();

(async () => {
    await m.connect(process.env.MONGO_URI);
    const u = m.connection.db.collection('users');

    const user = await u.findOne({ inviteCode: 'LS937623' });
    console.log('inviteCode=' + user.inviteCode);
    console.log('sponsorId=' + user.sponsorId);

    // Check direct members
    const directs = await u.find({ sponsorId: 'LS937623' }).project({ name: 1, inviteCode: 1, isActivated: 1 }).toArray();
    console.log('directMembers=' + directs.length);
    directs.forEach(d => console.log('  -> ' + d.name + ' (' + d.inviteCode + ') active=' + d.isActivated));

    // Check via directInviteIds
    const dii = user.directInviteIds || [];
    console.log('directInviteIds count=' + dii.length);

    // Full level income calculation
    const R = { 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1, 7: 0.5, 8: 0.5, 9: 0.5, 10: 0.5 };
    let ids = directs.map(d => d._id.toString());
    let total = 0;

    for (let l = 1; l <= 10; l++) {
        if (!ids.length) { console.log('L' + l + ': 0 members'); continue; }
        const oids = ids.map(i => new m.Types.ObjectId(i));
        const us = await u.find({ _id: { $in: oids } }).project({ _id: 1, inviteCode: 1, isActivated: 1 }).toArray();
        const ac = us.filter(x => x.isActivated).length;
        const inc = ac * R[l];
        total += inc;
        console.log('L' + l + ': ' + us.length + ' total, ' + ac + ' active, Rs.' + inc);
        const codes = us.map(x => x.inviteCode).filter(Boolean);
        if (codes.length > 0) {
            const next = await u.find({ sponsorId: { $in: codes } }).project({ _id: 1 }).toArray();
            ids = next.map(x => x._id.toString());
        } else {
            ids = [];
        }
    }

    console.log('TotalUncapped=Rs.' + total);
    console.log('Cap=Rs.500');
    console.log('ShouldGet=Rs.' + Math.min(total, 500));

    await m.connection.close();
})();
