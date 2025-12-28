require('dotenv').config();
const mongoose = require('mongoose');

async function clearDatabase() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear all collections
        console.log('🗑️  Clearing users collection...');
        await mongoose.connection.db.collection('users').deleteMany({});

        console.log('🗑️  Clearing epins collection...');
        await mongoose.connection.db.collection('epins').deleteMany({});

        console.log('🗑️  Clearing epintransfers collection...');
        await mongoose.connection.db.collection('epintransfers').deleteMany({});

        console.log('🗑️  Clearing withdrawals collection...');
        await mongoose.connection.db.collection('withdrawals').deleteMany({});

        console.log('🗑️  Clearing kycs collection...');
        await mongoose.connection.db.collection('kycs').deleteMany({});

        console.log('✅ Database cleared successfully!');
        console.log('');
        console.log('You can now register as the first user without a sponsor code.');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error clearing database:', err);
        process.exit(1);
    }
}

clearDatabase();
