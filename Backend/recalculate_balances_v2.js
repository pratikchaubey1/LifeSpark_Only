const mongoose = require('mongoose');
const User = require('./models/User');
const Withdrawal = require('./models/Withdrawal');
require('dotenv').config();

async function recalculateBalances() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Set cutoff date to end of 2026-01-13 (IST approx, or just flexible end of day)
        // User said "on and before 2026-01-13"
        const cutoffDate = new Date('2026-01-13T23:59:59.999Z');
        console.log(`Cutoff Date for withdrawals: ${cutoffDate.toISOString()}`);

        const users = await User.find({});
        console.log(`Found ${users.length} users. Processing...`);

        let updatedCount = 0;

        for (const user of users) {
            // 1. Recalculate Total Income from components
            // Ensure fields are numbers (handle undefined/null by defaulting to 0 if needed, usually schema handles default 0)
            const income = (user.freedomIncome || 0) +
                (user.dailyBonusIncome || 0) +
                (user.rankRewardIncome || 0) +
                (user.levelIncome || 0) +
                (user.autopoolLevelIncome || 0);

            // 2. Fetch approved withdrawals on or before cutoff date
            const relevantWithdrawals = await Withdrawal.find({
                userId: user._id.toString(),
                status: 'approved',
                source: 'balance', // Only subtract from main balance
                requestedAt: { $lte: cutoffDate }
            });

            const totalWithdrawn = relevantWithdrawals.reduce((sum, w) => sum + w.amount, 0);

            // 3. New Balance
            const newBalance = income - totalWithdrawn;

            // 4. Update User
            // We update totalIncome to match the sum of components (consistency)
            // We update withdrawal to match the sum of considered withdrawals (consistency)
            // We update balance

            // Log changes for some users to verify
            if (Math.abs(user.balance - newBalance) > 1 || Math.abs(user.totalIncome - income) > 1) {
                // console.log(`Updating ${user.name}: Balance ${user.balance} -> ${newBalance}, Income ${user.totalIncome} -> ${income}`);
            }

            user.totalIncome = income;
            user.balance = newBalance;
            user.withdrawal = totalWithdrawn; // Reset total withdrawal tracking to match the cutoff

            await user.save();
            updatedCount++;
        }

        console.log(`Recalculated balances for ${updatedCount} users.`);

    } catch (err) {
        console.error('Error recalculating balances:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

recalculateBalances();
