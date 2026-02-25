import React, { useState, useEffect } from "react";
import { FiLayers, FiUsers, FiDollarSign, FiEye } from "react-icons/fi";
import config from "../../../config/config";

const API_BASE = config.apiUrl;

export default function LevelIncome({ sidebarOpen, onMenuOpen }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [levelData, setLevelData] = useState([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [apiUserInfo, setApiUserInfo] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchLevelIncome();
    }, []);

    async function fetchLevelIncome() {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login to view level income");
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_BASE}/level-income`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch level income");

            setLevelData(data.levels || []);
            setTotalIncome(data.totalLevelIncome || 0);
            setApiUserInfo(data.currentUserInfo || null);
        } catch (err) {
            setError(err.message || "Failed to fetch level income");
        } finally {
            setLoading(false);
        }
    }

    function handleViewLevel(level) {
        setSelectedLevel(level);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setSelectedLevel(null);
    }

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
                        <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow">
                            <FiLayers size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Team Business Income</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <p className="text-slate-500 text-sm">10 Level Structure</p>
                                {apiUserInfo && (
                                    <span className="text-[11px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100 font-medium">
                                        User: {apiUserInfo.name} ({apiUserInfo.inviteCode})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <button
                            onClick={fetchLevelIncome}
                            disabled={loading}
                            className={`text-xs font-semibold px-3 py-1 rounded-full transition ${loading ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                }`}
                        >
                            {loading ? "Refreshing..." : "↻ Refresh"}
                        </button>
                        <p className="text-xs text-slate-500 mt-2">Total Level Income</p>
                        <p className="text-2xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</p>
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
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-slate-600">Loading level income data...</p>
                    </div>
                )}

                {/* TABLE */}
                {!loading && !error && (
                    <div className="border rounded-2xl overflow-hidden shadow">
                        {/* Table Header */}
                        <div className="bg-[#0369a1] text-white grid grid-cols-5 gap-4 p-4 font-semibold text-sm">
                            <span className="flex items-center gap-2">
                                <FiLayers /> Level
                            </span>
                            <span className="flex items-center gap-2">
                                <FiDollarSign /> Income
                            </span>
                            <span className="flex items-center gap-2">
                                <FiUsers /> Team
                            </span>
                            <span className="flex items-center gap-2">
                                <FiDollarSign /> Business
                            </span>
                            <span className="text-center">Action</span>
                        </div>

                        {/* Table Rows */}
                        <div>
                            {levelData.map((level, index) => (
                                <div
                                    key={level.level}
                                    className={`grid grid-cols-5 gap-4 p-4 border-b hover:bg-blue-50/50 transition ${index % 2 === 0 ? "bg-slate-50/30" : ""
                                        }`}
                                >
                                    {/* Level */}
                                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                                        <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                            {level.level}
                                        </span>
                                        Level {level.level}
                                    </span>

                                    {/* Income per user */}
                                    <span className="text-slate-700 font-medium">₹{level.incomePerUser}</span>

                                    {/* Team count */}
                                    <span className="text-slate-700 font-medium">
                                        <span className="text-blue-600" title="Total Activated Members (Green Dots)">{level.activeUserCount}</span>
                                        <span className="text-slate-400 mx-1">/</span>
                                        <span className="text-slate-500 text-xs" title="Total Invited (Active + Inactive)">{level.userCount}</span>
                                    </span>

                                    {/* Total Business/Income */}
                                    <span className="text-green-600 font-semibold">₹{level.totalIncome.toFixed(2)}</span>

                                    {/* Action */}
                                    <div className="text-center">
                                        <button
                                            onClick={() => handleViewLevel(level)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline inline-flex items-center gap-1"
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
                        <div className="bg-blue-600 text-white p-6 flex flex-col md:flex-row items-center justify-between flex-shrink-0 gap-4">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-lg">L{selectedLevel.level}</span>
                                    Level Members
                                </h1>
                                <p className="text-blue-100 text-sm mt-1">
                                    {selectedLevel.activeUserCount} Activated / {selectedLevel.userCount} Total • ₹{selectedLevel.totalIncome.toFixed(2)} total income
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 md:relative md:top-auto md:right-auto h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-2xl transition"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body with simple scroll */}
                        <div className="p-0 overflow-y-auto flex-1">
                            {selectedLevel.users.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 bg-slate-50 h-full flex flex-col justify-center items-center">
                                    <FiUsers size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No members found at this level</p>
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
                                                <th className="px-5 py-3 text-right font-semibold text-slate-600 font-mono">Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {selectedLevel.users.map((user, idx) => (
                                                <tr key={user.id} className="hover:bg-blue-50/30 transition group">
                                                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="font-medium text-slate-800">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.phone || user.email}</div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700 transition">
                                                            {user.inviteCode}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        {user.isActivated ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 gap-1 border border-green-200">
                                                                ACTIVE
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 gap-1 border border-red-100">
                                                                INACTIVE
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

                        {/* Modal Footer */}
                        <div className="bg-slate-50 p-4 flex justify-end border-t">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
