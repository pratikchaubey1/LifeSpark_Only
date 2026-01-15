const User = require('../models/User');

// BFS to find the first node that has less than 3 children
// This ensures top-to-bottom, left-to-right filling of the global tree.
async function findGlobalAutopoolParent() {
    // 1. Find the Company Node (Root of Autopool)
    // We assume the first user (usually company) is the root.
    // Or we find a specific "root" user.
    // Ideally, the "Company" is the one with 'autopoolStatus': 'active' and 'autopoolParent': null (if they are the absolute root).
    // Or we look for the user with inviteCode 'LS999601' or similar if known, but better to rely on DB structure.

    // Strategy: Find the root. The root is the user with autopoolStatus='active' and NO autopoolParent.
    // There should be exactly ONE such user (The Company).
    const rootUser = await User.findOne({ autopoolStatus: 'active', autopoolParent: null });

    if (!rootUser) {
        // If NO root exists, then this new user will BECOME the root.
        // This likely only happens for the very first company account enablement.
        return null;
    }

    // BFS Queue
    const queue = [rootUser];

    while (queue.length > 0) {
        const current = queue.shift();

        // Check children count
        // autopoolChildren is an array of IDs
        if (current.autopoolChildren.length < 3) {
            return current;
        }

        // Add children to queue to continue searching
        // We must fetch them to ensure order, or if we have them populated.
        // Since autopoolChildren is just IDs, we need to fetch the User objects to potentially add them to queue?
        // Wait, if we just need to traverse, we can fetch them.
        // optimization: fetch children sorted by some criteria if needed, but array order in autopoolChildren should be insertion order (left-to-right).

        const children = await User.find({ _id: { $in: current.autopoolChildren } });

        // We need to maintain the order strictly as they appear in the parent's array
        // Database find() might not return in order of the $in array.
        const childrenMap = {};
        children.forEach(c => childrenMap[c._id.toString()] = c);

        const orderedChildren = current.autopoolChildren.map(id => childrenMap[id.toString()]);

        for (const child of orderedChildren) {
            if (child) queue.push(child);
        }
    }

    throw new Error("Unable to find autopool parent spots (Tree might be infinite??)");
}

// Income Charts
const POOL_INCOME_LEVELS = [
    { level: 1, requiredMembers: 3, income: 3000 },
    { level: 2, requiredMembers: 9, income: 6000 },
    { level: 3, requiredMembers: 27, income: 9000 },
    { level: 4, requiredMembers: 81, income: 12000 },
    { level: 5, requiredMembers: 243, income: 15000 },
    { level: 6, requiredMembers: 729, income: 18000 },
    { level: 7, requiredMembers: 2187, income: 21000 },
    { level: 8, requiredMembers: 6561, income: 24000 }, // Note: User said 6551 in text but chart usually follows power of 3. Chart img says 6561 (3^8). Text said '6551'. I will use 6561 (3^8) for consistency unless strictly told. Chart img shows "6551" but logic is 3x. 2187*3 = 6561. I'll stick to 6561. Wait, image shows 6551? Let me re-read user text. "6551". I will use 6561 as it is mathematically correct for a 3x3 matrix, 6551 must be a typo in their manual entry or image.
    { level: 9, requiredMembers: 19683, income: 27000 },
    { level: 10, requiredMembers: 59049, income: 30000 }
];

async function distributeAutopoolIncome(newUser) {
    if (!newUser.autopoolParent) return;

    let currentAncestorId = newUser.autopoolParent;
    let depth = 1;

    // We traverse up to 10 levels
    while (currentAncestorId && depth <= 10) {
        const ancestor = await User.findById(currentAncestorId);
        if (!ancestor) break;

        // Check if this ancestor has completed the requirements for 'depth'
        // We need to count how many 'active' autopool nodes are at this specific depth relative to the ancestor.

        const count = await getAutopoolDescendantsCountAtLevel(ancestor._id, depth);

        // Find the configuration for this level
        const config = POOL_INCOME_LEVELS.find(l => l.level === depth);

        if (config) {
            // Check if they already got paid for this level
            if (!ancestor.autopoolLevelsCompleted.includes(depth)) {
                if (count >= config.requiredMembers) {
                    // PAY THEM
                    ancestor.balance += config.income;
                    ancestor.totalIncome += config.income;
                    ancestor.autopoolLevelIncome += config.income;
                    ancestor.autopoolLevelsCompleted.push(depth);

                    await ancestor.save();
                    console.log(`[Autopool] Credited Level ${depth} income (${config.income}) to ${ancestor.name}`);
                }
            }
        }

        currentAncestorId = ancestor.autopoolParent;
        depth++;
    }
}

// Helpers
async function getAutopoolDescendantsCountAtLevel(rootId, targetLevel) {
    // Level 0 = root
    // Level 1 = children
    // We want to count nodes at distance = targetLevel

    // This can be recursive or iterative.
    // Iterative BFS is safer.

    let currentLevelNodes = [rootId];

    for (let i = 0; i < targetLevel; i++) {
        // Get all children of currentLevelNodes
        // We only care about populated autopoolChildren
        const parents = await User.find({ _id: { $in: currentLevelNodes } }).select('autopoolChildren');
        let nextLevelIds = [];

        for (const p of parents) {
            if (p.autopoolChildren && p.autopoolChildren.length > 0) {
                nextLevelIds.push(...p.autopoolChildren);
            }
        }

        if (nextLevelIds.length === 0) return 0;
        currentLevelNodes = nextLevelIds;
    }

    return currentLevelNodes.length;
}

module.exports = {
    findGlobalAutopoolParent,
    distributeAutopoolIncome
};
