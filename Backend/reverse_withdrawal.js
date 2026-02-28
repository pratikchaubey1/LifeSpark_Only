/**
 * Reverse an accidentally approved withdrawal.
 * 
 * What this script does:
 * 1. Finds withdrawal WD-1772291144851
 * 2. Finds user LS233763
 * 3. Sets withdrawal status to 'rejected'
 * 4. Subtracts the amount from user.withdrawal (undoing the approval increment)
 * 5. Adds the amount back to user.balance (refunding the deduction)
 * 
 * Run: node reverse_withdrawal.js
 */

const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://pratikup42_db_user:vaUJqTtHFheWKaLr@cluster0.bvyo9tk.mongodb.net/mydatabase?retryWrites=true&w=majority';

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCol = db.collection('users');
    const withdrawalsCol = db.collection('withdrawals');

    const WITHDRAWAL_ID = 'WD-1772291144851';
    const INVITE_CODE = 'LS233763';

    // Step 1: Find the withdrawal
    const withdrawal = await withdrawalsCol.findOne({ withdrawalId: WITHDRAWAL_ID });
    if (!withdrawal) {
        console.error('❌ Withdrawal not found:', WITHDRAWAL_ID);
        process.exit(1);
    }
    console.log('\n📋 Withdrawal found:');
    console.log('  ID:', withdrawal.withdrawalId);
    console.log('  Amount:', withdrawal.amount);
    console.log('  Status:', withdrawal.status);
    console.log('  UserId:', withdrawal.userId);

    // Step 2: Find the user
    const user = await usersCol.findOne({ inviteCode: INVITE_CODE });
    if (!user) {
        console.error('❌ User not found:', INVITE_CODE);
        process.exit(1);
    }
    console.log('\n👤 User found:');
    console.log('  Name:', user.name);
    console.log('  InviteCode:', user.inviteCode);
    console.log('  Balance (before):', user.balance);
    console.log('  Withdrawal total (before):', user.withdrawal);

    // Verify the user matches the withdrawal
    if (withdrawal.userId !== user._id.toString()) {
        console.error('❌ MISMATCH: Withdrawal userId does not match user _id!');
        console.error('  Withdrawal userId:', withdrawal.userId);
        console.error('  User _id:', user._id.toString());
        process.exit(1);
    }

    const amount = Number(withdrawal.amount) || 0;
    if (amount <= 0) {
        console.error('❌ Invalid withdrawal amount:', amount);
        process.exit(1);
    }

    // Step 3: Update withdrawal status to 'rejected'
    await withdrawalsCol.updateOne(
        { _id: withdrawal._id },
        {
            $set: {
                status: 'rejected',
                reviewedAt: new Date(),
                reviewedBy: 'admin-reversal'
            }
        }
    );
    console.log('\n✅ Withdrawal status changed to "rejected"');

    // Step 4: Update user — subtract from withdrawal total, add back to balance
    const newWithdrawal = Math.max((Number(user.withdrawal) || 0) - amount, 0);
    const newBalance = (Number(user.balance) || 0) + amount;

    await usersCol.updateOne(
        { _id: user._id },
        {
            $set: {
                withdrawal: newWithdrawal,
                balance: newBalance
            }
        }
    );
    console.log('✅ User balance refunded');

    // Step 5: Verify
    const updatedUser = await usersCol.findOne({ inviteCode: INVITE_CODE });
    const updatedWd = await withdrawalsCol.findOne({ withdrawalId: WITHDRAWAL_ID });

    console.log('\n--- AFTER REVERSAL ---');
    console.log('  Withdrawal status:', updatedWd.status);
    console.log('  User balance:', updatedUser.balance, `(was ${user.balance}, refunded +${amount})`);
    console.log('  User withdrawal total:', updatedUser.withdrawal, `(was ${user.withdrawal}, reversed -${amount})`);
    console.log('\n🎉 Done! Withdrawal reversed successfully.');

    await mongoose.connection.close();
}

run().catch(err => {
    console.error('Script error:', err);
    process.exit(1);
});
