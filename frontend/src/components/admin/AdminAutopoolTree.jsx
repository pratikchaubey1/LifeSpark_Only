import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config/config";

// Tree Node Component
function TreeNode({ node, level = 0 }) {
    const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels

    if (!node) return null;

    const hasChildren = node.children && node.children.length > 0;
    const colors = [
        "bg-gradient-to-r from-blue-600 to-indigo-700",
        "bg-gradient-to-r from-green-500 to-emerald-600",
        "bg-gradient-to-r from-purple-500 to-violet-600",
        "bg-gradient-to-r from-orange-500 to-amber-600",
        "bg-gradient-to-r from-pink-500 to-rose-600",
    ];

    const bgColor = colors[level % colors.length];

    return (
        <div className="relative">
            {/* Node Card */}
            <div
                className={`${bgColor} text-white rounded-xl p-4 shadow-lg mb-2 cursor-pointer transition-all hover:scale-[1.02] min-w-[200px]`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-bold text-lg">{node.name}</div>
                        <div className="text-sm opacity-90">ID: {node.inviteCode}</div>
                    </div>
                    {hasChildren && (
                        <div className="text-2xl ml-4">
                            {expanded ? "−" : "+"}
                        </div>
                    )}
                </div>
                <div className="mt-2 text-xs opacity-80 flex gap-4">
                    <span>Joined: {node.joinDate}</span>
                    <span>Income: ₹{node.income?.toLocaleString() || 0}</span>
                </div>
                {hasChildren && (
                    <div className="mt-2 text-xs bg-white/20 rounded px-2 py-1 inline-block">
                        {node.childCount} direct children
                    </div>
                )}
            </div>

            {/* Children */}
            {expanded && hasChildren && (
                <div className="ml-8 pl-4 border-l-2 border-slate-200 mt-2 space-y-2">
                    {node.children.map((child, idx) => (
                        <TreeNode key={child.id || idx} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminAutopoolTree() {
    const [loading, setLoading] = useState(true);
    const [tree, setTree] = useState(null);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTree();
    }, []);

    const fetchTree = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const response = await axios.get(`${config.apiUrl}/autopool/tree`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTree(response.data.tree);
            setStats(response.data.stats);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load tree data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-10 text-center">
                <div className="text-lg text-slate-500">Loading Autopool Tree...</div>
                <div className="mt-4 text-sm text-slate-400">This may take a moment for large trees</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Autopool Tree Visualization</h2>
                    <p className="text-slate-500 mt-1">View who joined under whom in the global autopool</p>
                </div>
                <button
                    onClick={fetchTree}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-4 shadow-lg">
                        <p className="text-emerald-100 text-sm">Total Active Members</p>
                        <p className="text-3xl font-bold">{stats.totalActive}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <p className="text-slate-500 text-sm">Root Member</p>
                        <p className="text-xl font-bold text-slate-800">{stats.rootName}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <p className="text-slate-500 text-sm">Root Invite Code</p>
                        <p className="text-xl font-mono font-bold text-slate-800">{stats.rootCode}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Tree Legend */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-700 mb-2">How to use:</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Click on any node to expand/collapse its children</li>
                    <li>• First 2 levels are expanded by default</li>
                    <li>• Tree shows up to 5 levels deep for performance</li>
                    <li>• Each color represents a different level in the tree</li>
                </ul>
            </div>

            {/* Tree Display */}
            {tree ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 overflow-x-auto">
                    <TreeNode node={tree} level={0} />
                </div>
            ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center">
                    <div className="text-5xl mb-4">🌳</div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Autopool Tree Yet</h3>
                    <p className="text-slate-500">No members have been approved into the autopool system.</p>
                </div>
            )}
        </div>
    );
}
