import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config/config';
import { FiTrendingUp, FiRefreshCw } from "react-icons/fi";

export default function UpgradeIncome({ sidebarOpen, onMenuOpen }) {
    const [loading, setLoading] = useState(true);
    const [achievedLevels, setAchievedLevels] = useState(new Set());
    const [error, setError] = useState(null);

    // Upgrade Levels Configuration
    const UPGRADE_LEVELS = [
        { level: 1, income: 10000, upgrade: 1176 },
        { level: 2, income: 20000, upgrade: 1176 },
        { level: 3, income: 30000, upgrade: 1176 },
        { level: 4, income: 40000, upgrade: 1176 },
        { level: 5, income: 50000, upgrade: 1176 },
        { level: 6, income: 60000, upgrade: 1176 },
        { level: 7, income: 70000, upgrade: 1176 },
        { level: 8, income: 80000, upgrade: 1176 },
        { level: 9, income: 90000, upgrade: 1176 },
        { level: 10, income: 100000, upgrade: 1176 },
    ];

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.apiUrl}/withdrawals`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const withdrawals = response.data.withdrawals || [];
            const levels = new Set();

            withdrawals.forEach(w => {
                if (w.upgradeLevel > 0) {
                    levels.add(w.upgradeLevel);
                }
            });

            setAchievedLevels(levels);
        } catch (err) {
            console.error(err);
            setError("Failed to load upgrade status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f7fa] p-4 md:p-6">

            {/* MENU BUTTON */}
            {!sidebarOpen && (
                <button
                    onClick={() => onMenuOpen?.()}
                    className="mb-5 p-2 rounded-lg bg-white shadow hover:bg-slate-100 active:scale-95 transition inline-flex border border-slate-300"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-slate-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            )}

            {/* MAIN CARD */}
            <div className="bg-white max-w-6xl mx-auto p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                            <FiTrendingUp size={24} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                            Upgrade Income
                        </h1>
                    </div>
                    <button
                        onClick={fetchWithdrawals}
                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition active:scale-90"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* TABLE */}
                <div className="overflow-auto rounded-2xl border border-slate-300 shadow">
                    <table className="w-full text-sm md:text-base">
                        <thead>
                            <tr className="bg-teal-600 text-white">
                                <th className="p-4 text-center font-semibold w-[80px]">S.N.</th>
                                <th className="p-4 text-center font-semibold">Level</th>
                                <th className="p-4 text-center font-semibold">Income Limit</th>
                                <th className="p-4 text-center font-semibold">Upgrade Amount</th>
                                <th className="p-4 text-center font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {UPGRADE_LEVELS.map((item, index) => {
                                const isAchieved = achievedLevels.has(item.level);

                                return (
                                    <tr key={item.level} className="hover:bg-teal-50/50 transition duration-150">
                                        <td className="p-4 text-center font-semibold text-slate-700">
                                            {index + 1}
                                        </td>
                                        <td className="p-4 text-center font-bold text-teal-800">
                                            LEVEL {item.level}
                                        </td>
                                        <td className="p-4 text-center font-medium text-slate-700">
                                            ₹{item.income.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center font-bold text-slate-800">
                                            ₹{item.upgrade.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            {isAchieved ? (
                                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                                                    <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    DONE
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                    PENDING
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                    <div className="text-blue-500 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </div>
                    <div>
                        <h4 className="text-blue-800 font-bold text-sm mb-1">How it works</h4>
                        <p className="text-blue-600 text-xs leading-relaxed">
                            Upgrade income is deducted automatically when your total withdrawal crosses the Income Limit for each level.
                            Levels are achieved sequentially based on your cumulative withdrawal history.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
