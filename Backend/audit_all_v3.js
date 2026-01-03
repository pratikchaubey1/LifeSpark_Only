const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const User = require('./models/User');

async function generateReport() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        let report = "=== INCOME BREAKDOWN REPORT ===\n\n";

        // 1. Audit LS753401 (The User in Question)
        const user = await User.findOne({ inviteCode: 'LS753401' });
        if (user) {
            report += `[USER] ${user.name} (${user.inviteCode})\n`;
            report += `Status: ${user.isActivated ? 'ACTIVATED' : 'INACTIVE'}\n`;
            report += `Activated At: ${user.activatedAt ? user.activatedAt.toISOString() : 'N/A'}\n`;
            report += `Sponsor: ${user.sponsorId}\n`;
            report += `Total Income: ${user.totalIncome}\n`;
            report += `Balance: ${user.balance}\n\n`;
        } else {
            report += `[USER] LS753401 NOT FOUND\n\n`;
        }

        // 2. Audit LS939413 (The Downline)
        const referral = await User.findOne({ inviteCode: 'LS939413' });
        if (referral) {
            report += `[DOWNLINE] ${referral.name} (${referral.inviteCode})\n`;
            report += `Status: ${referral.isActivated ? 'ACTIVATED' : 'INACTIVE'}\n`;
            report += `Activated At: ${referral.activatedAt ? referral.activatedAt.toISOString() : 'N/A'}\n`;
            report += `Sponsor: ${referral.sponsorId}\n\n`;
        } else {
            report += `[DOWNLINE] LS939413 NOT FOUND\n\n`;
        }

        // 3. Audit Admin (LS958826)
        const admin = await User.findOne({ inviteCode: 'LS958826' });
        if (admin) {
            report += `[ADMIN] ${admin.name} (${admin.inviteCode})\n`;
            report += `Total Income: ${admin.totalIncome}\n`;
            report += `Direct Referrals:\n`;

            const adminDirects = await User.find({ sponsorId: 'LS958826' });
            adminDirects.forEach(d => {
                report += ` - ${d.name} (${d.inviteCode}) [${d.isActivated ? 'ACTIVE' : 'INACTIVE'}]\n`;
            });
            report += "\n";
        }

        // 4. Analysis
        report += "=== ANALYSIS ===\n";
        if (user && referral) {
            if (referral.isActivated) {
                if (referral.sponsorId === user.inviteCode) {
                    if (user.totalIncome === 0) {
                        report += "ISSUE CHECK: Referral is active, User is sponsor, but Income is 0.\n";
                        if (user.isActivated && referral.activatedAt && user.activatedAt) {
                            if (user.activatedAt > referral.activatedAt) {
                                report += "CAUSE: User activated AFTER Referral.\n";
                                report += `User Active: ${user.activatedAt.toISOString()}\n`;
                                report += `Ref Active:  ${referral.activatedAt.toISOString()}\n`;
                            } else {
                                report += "CAUSE: Unknown. User activated BEFORE Referral but got no money.\n";
                            }
                        } else {
                            report += "CAUSE: Activation timestamps missing or user inactive.\n";
                        }
                    } else {
                        report += "Income seems correct.\n";
                    }
                } else {
                    report += `MISMATCH: Referral lists sponsor as ${referral.sponsorId}, not ${user.inviteCode}\n`;
                }
            } else {
                report += "Referral is NOT activated. No income expected.\n";
            }
        }

        fs.writeFileSync('audit_report.txt', report);
        console.log("Report generated in audit_report.txt");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

generateReport();
