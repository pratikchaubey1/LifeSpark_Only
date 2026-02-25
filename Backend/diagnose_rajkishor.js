const mongoose = require('mongoose');
const User = require('./models/User');

async function debugData() {
    try {
        const MONGO_URI = 'mongodb+srv://pratikup42_db_user:vaUJqTtHFheWKaLr@cluster0.bvyo9tk.mongodb.net/mydatabase?retryWrites=true&w=majority';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({}).lean();
        console.log(`Total users: ${users.length}`);

        // Find Rajkishor Prasad specifically
        const rajkishor = users.find(u => u.name.toLowerCase().includes('rajkishor'));
        if (!rajkishor) {
            console.log('❌ Rajkishor not found by name');
        } else {
            console.log(`\nFound User: ${rajkishor.name} (${rajkishor.inviteCode})`);
            console.log(`User ID: ${rajkishor._id.toString()}`);
            console.log(`Invite Code: "${rajkishor.inviteCode}" (Length: ${rajkishor.inviteCode.length})`);

            // Check sponsorId in children
            const kidsExact = users.filter(u => u.sponsorId === rajkishor.inviteCode);
            const kidsTrimmed = users.filter(u => u.sponsorId && u.sponsorId.trim() === rajkishor.inviteCode.trim());
            const kidsInsensitive = users.filter(u => u.sponsorId && u.sponsorId.toLowerCase() === rajkishor.inviteCode.toLowerCase());
            const kidsAsId = users.filter(u => u.sponsorId && u.sponsorId.toString() === rajkishor._id.toString());

            console.log(`\nReferral Analysis for ${rajkishor.inviteCode}:`);
            console.log(`- Exact Match sponsorId: ${kidsExact.length}`);
            console.log(`- Trimmed Match: ${kidsTrimmed.length}`);
            console.log(`- Case-Insensitive Match: ${kidsInsensitive.length}`);
            console.log(`- sponsorId matching parent ID (NOT code): ${kidsAsId.length}`);

            if (kidsExact.length > 0) {
                const first = kidsExact[0];
                console.log(`\nExample Referral: ${first.name}`);
                console.log(`- sponsorId value in DB: "${first.sponsorId}"`);
                console.log(`- isActivated: ${first.isActivated}`);
                console.log(`- activatedAt: ${first.activatedAt}`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('DIAGNOSTIC CRASHED:', err);
    }
}

debugData();
