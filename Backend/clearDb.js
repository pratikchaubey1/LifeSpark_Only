require('dotenv').config();
const mongoose = require('mongoose');

const clearDatabase = async () => {
    try {
        console.log('🔄 Connecting to Database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('⚠️  Clearing all data...');
        // Drop the entire database
        await mongoose.connection.db.dropDatabase();

        console.log('✅ Database cleared successfully!');
        console.log('🎉 You can now start fresh.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
};

clearDatabase();
