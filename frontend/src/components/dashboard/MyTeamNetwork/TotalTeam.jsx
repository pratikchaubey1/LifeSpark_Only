import React, { useState, useEffect } from "react";
import { FiUsers, FiEye, FiCheckCircle, FiXCircle } from "react-icons/fi";
import config from "../../../config/config";

const API_BASE = config.apiUrl;

export default function TotalTeam({ sidebarOpen, onMenuOpen }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [levelData, setLevelData] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [modalFilter, setModalFilter] = useState('all'); // all, active, inactive
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchTeamLevels();
    }, []);

    async function fetchTeamLevels() {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE}/team/levels`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch team data");

            // Sort levels 1-10 explicitly just in case
            const levels = data.levels || [];
            levels.sort((a, b) => a.level - b.level);

            // Ensure we show 10 levels even if empty
            const fullLevels = [];
            for (let i = 1; i <= 10; i++) {
                const existing = levels.find(l => l.level === i);
                if (existing) fullLevels.push(existing);
                else fullLevels.push({ level: i, activeCount: 0, inactiveCount: 0, totalCount: 0, users: [] });
            }

            setLevelData(fullLevels);
        } catch (err) {
            setError(err.message || "Failed to fetch team data");
        } finally {
            setLoading(false);
        }
    }

    function handleViewLevel(level) {
        setSelectedLevel(level);
        setModalFilter('all'); // Reset filter
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setSelectedLevel(null);
    }

    // Filter users based on selection
    const filteredUsers = selectedLevel ? selectedLevel.users.filter(user => {
        if (modalFilter === 'active') return user.isActivated;
        if (modalFilter === 'inactive') return !user.isActivated;
        return true;
    }) : [];

    return (
        <div className="min-h-screen bg-[#f3f6fb] p-4 md:p-8">
            {/* MENU BUTTON */}
            {!sidebarOpen && (
                <button
                    onClick={() => onMenuOpen?.()}
                    className="mb-5 p-2 rounded-lg bg-white shadow hover:bg-slate-100 active:scale-95 transition border"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-slate-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            )}

            {/* MAIN CARD */}
            <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-[#e2e8f0] p-6 md:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow">
                            <FiUsers size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Total Team</h1>
                            <p className="text-slate-500 text-sm mt-1">10 Level Team Structure</p>
                        </div>
                    </div>
                    <div className="text-right">
                        {/* Aggregated totals */}
                        <p className="text-xs text-slate-500">Total Members</p>
                        <p className="text-2xl font-bold text-indigo-600">
                            {levelData.reduce((acc, curr) => acc + (curr.totalCount || 0), 0)}
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-slate-600">Loading team data...</p>
                    </div>
                )}

                {/* TABLE */}
                {!loading && !error && (
                    <div className="border rounded-2xl overflow-hidden shadow">
                        {/* Table Header */}
                        <div className="bg-indigo-600 text-white grid grid-cols-5 gap-4 p-4 font-semibold text-sm">
                            <span className="flex items-center gap-2">Level</span>
                            <span className="flex items-center gap-2 text-center justify-center">Total Members</span>
                            <span className="flex items-center gap-2 text-center justify-center">Active</span>
                            <span className="flex items-center gap-2 text-center justify-center">Inactive</span>
                            <span className="text-center">Action</span>
                        </div>

                        {/* Table Rows */}
                        <div>
                            {levelData.map((level, index) => (
                                <div
                                    key={level.level}
                                    className={`grid grid-cols-5 gap-4 p-4 border-b hover:bg-indigo-50/50 transition ${index % 2 === 0 ? "bg-slate-50/30" : ""}`}
                                >
                                    {/* Level */}
                                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                                        <span className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                            {level.level}
                                        </span>
                                        Level {level.level}
                                    </span>

                                    {/* Total Members */}
                                    <span className="text-slate-700 font-medium text-center">{level.totalCount}</span>

                                    {/* Active */}
                                    <span className="text-green-600 font-semibold text-center">{level.activeCount}</span>

                                    {/* Inactive */}
                                    <span className="text-red-500 font-medium text-center">{level.inactiveCount}</span>

                                    {/* Action */}
                                    <div className="text-center">
                                        <button
                                            onClick={() => handleViewLevel(level)}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline inline-flex items-center gap-1"
                                        >
                                            <FiEye /> View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL for viewing users at a level */}
            {showModal && selectedLevel && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">

                        {/* Modal Header */}
                        <div className="bg-indigo-600 text-white p-5 flex flex-col md:flex-row items-center justify-between flex-shrink-0 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-lg">L{selectedLevel.level}</span>
                                    Level Members
                                </h2>
                                <p className="text-indigo-100 text-sm mt-1 opacity-90">
                                    Total: {selectedLevel.totalCount}
                                </p>
                            </div>

                            {/* Filters */}
                            <div className="flex bg-indigo-700/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setModalFilter('all')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${modalFilter === 'all' ? 'bg-white text-indigo-700 shadow' : 'text-indigo-100 hover:bg-white/10'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setModalFilter('active')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${modalFilter === 'active' ? 'bg-emerald-500 text-white shadow' : 'text-indigo-100 hover:bg-white/10'}`}
                                >
                                    Active ({selectedLevel.activeCount})
                                </button>
                                <button
                                    onClick={() => setModalFilter('inactive')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${modalFilter === 'inactive' ? 'bg-rose-500 text-white shadow' : 'text-indigo-100 hover:bg-white/10'}`}
                                >
                                    Inactive ({selectedLevel.inactiveCount})
                                </button>
                            </div>

                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 md:relative md:top-auto md:right-auto h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xl transition"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body with simple scroll */}
                        <div className="p-0 overflow-y-auto flex-1">
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 bg-slate-50 h-full flex flex-col justify-center items-center">
                                    <FiUsers size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No {modalFilter !== 'all' ? modalFilter : ''} members found at this level</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto min-h-full">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-5 py-3 text-left font-semibold text-slate-600 w-12">#</th>
                                                <th className="px-5 py-3 text-left font-semibold text-slate-600">Name / Mobile</th>
                                                <th className="px-5 py-3 text-left font-semibold text-slate-600">ID / Invite</th>
                                                <th className="px-5 py-3 text-center font-semibold text-slate-600">Status</th>
                                                <th className="px-5 py-3 text-right font-semibold text-slate-600">Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {filteredUsers.map((user, idx) => (
                                                <tr key={user.id} className="hover:bg-indigo-50/30 transition group">
                                                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="font-medium text-slate-800">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.phone}</div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition">
                                                            {user.inviteCode}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        {user.isActivated ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 gap-1 border border-emerald-200">
                                                                <FiCheckCircle size={10} /> ACTIVE
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 gap-1 border border-rose-100">
                                                                <FiXCircle size={10} /> INACTIVE
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3 text-right text-slate-500 text-xs tabular-nums">
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="bg-slate-50 p-3 px-6 border-t border-slate-200 text-xs text-slate-400 flex justify-between items-center flex-shrink-0">
                            <span>Showing {filteredUsers.length} users</span>
                            <button onClick={closeModal} className="text-indigo-600 hover:text-indigo-800 font-medium">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
