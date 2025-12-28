import React, { useState, useEffect } from "react";
import { FiLayers, FiUsers, FiDollarSign, FiEye } from "react-icons/fi";
import config from "../../../config/config";

const API_BASE = config.apiUrl;

export default function LevelIncome({ sidebarOpen, onMenuOpen }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [levelData, setLevelData] = useState([]);
    const [totalIncome, setTotalIncome] = useState(0);
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
                            <p className="text-slate-500 text-sm mt-1">10 Level Income Structure</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Total Level Income</p>
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
                                    <span className="text-slate-700 font-medium">{level.userCount}</span>

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
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Level {selectedLevel.level} Users</h2>
                                <p className="text-blue-100 text-sm mt-1">
                                    {selectedLevel.userCount} users • ₹{selectedLevel.totalIncome.toFixed(2)} total income
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {selectedLevel.users.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <FiUsers size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>No users at this level yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                                            <tr>
                                                <th className="p-3 text-left font-semibold">Name</th>
                                                <th className="p-3 text-left font-semibold">Email</th>
                                                <th className="p-3 text-left font-semibold">Invite Code</th>
                                                <th className="p-3 text-left font-semibold">Status</th>
                                                <th className="p-3 text-left font-semibold">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedLevel.users.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium text-slate-800">{user.name}</td>
                                                    <td className="p-3 text-slate-600">{user.email}</td>
                                                    <td className="p-3 font-mono text-blue-600">{user.inviteCode}</td>
                                                    <td className="p-3">
                                                        {user.isActivated ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-slate-600 text-xs">
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
