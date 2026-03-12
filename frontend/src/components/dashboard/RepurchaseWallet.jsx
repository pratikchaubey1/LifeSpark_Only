import React, { useEffect, useState } from "react";
import config from "../../config/config";
import {
    FiMenu,
    FiRefreshCw,
    FiClock,
    FiShoppingBag,
    FiTrendingDown,
    FiArrowDownCircle
} from "react-icons/fi";

const API_BASE = config.apiUrl;

export default function RepurchaseWallet({ onMenuOpen }) {
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState("info");

    const [balance, setBalance] = useState(0);
    const [logs, setLogs] = useState([]);

    const loadData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setMsg("Please login first.");
            setMsgType("error");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [profileRes, logsRes] = await Promise.all([
                fetch(`${API_BASE}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE}/dashboard/income-logs?type=repurchase_transfer`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const profileData = await profileRes.json();
            const logsData = await logsRes.json();

            if (profileRes.ok) {
                setBalance(Number(profileData.user?.repurchaseWallet) || 0);
            }

            if (logsRes.ok) {
                setLogs(Array.isArray(logsData.logs) ? logsData.logs : []);
            }
        } catch (err) {
            console.error("Load repurchase data error", err);
            setMsg("Failed to load wallet data.");
            setMsgType("error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="mt-4 text-slate-500 font-medium">Loading repurchase wallet...</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center text-slate-800">
            <div className="w-full max-w-5xl space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onMenuOpen?.()}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition active:scale-95"
                        >
                            <FiMenu className="text-slate-600 text-xl" />
                        </button>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-none flex items-center gap-2">
                                <FiShoppingBag className="text-indigo-600" /> Repurchase Wallet
                            </h2>
                            <div className="text-xs text-slate-500 mt-1">Accumulated funds from withdrawals</div>
                        </div>
                    </div>

                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition active:scale-95"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* BALANCE CARD */}
                    <div className="lg:col-span-12 xl:col-span-4">
                        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <FiShoppingBag size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Total Repurchase Fund</div>
                                <div className="text-4xl md:text-5xl font-bold mt-2 font-mono">₹{balance.toLocaleString()}</div>
                                <div className="mt-6 flex items-center gap-2 text-indigo-100 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                                    <FiArrowDownCircle size={14} />
                                    <span>10% auto-deducted from withdrawals</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HISTORY */}
                    <div className="lg:col-span-12 xl:col-span-8">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <FiClock className="text-indigo-600" /> Transfer History
                                </h3>
                            </div>

                            <div className="overflow-x-auto flex-1 max-h-[500px]">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-100">
                                            <th className="px-6 py-4">Transaction Details</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {logs.map((log, idx) => (
                                            <tr key={log._id || idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-slate-800">
                                                        {log.description || "Withdrawal Deduction"}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                                                        {log.createdAt ? new Date(log.createdAt).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="text-base font-bold text-emerald-600 font-mono">+ ₹{Number(log.amount).toLocaleString()}</div>
                                                </td>
                                            </tr>
                                        ))}

                                        {logs.length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center opacity-40">
                                                        <FiShoppingBag size={48} className="text-slate-300" />
                                                        <div className="mt-3 text-sm text-slate-500 font-medium">No repurchase transfers yet.</div>
                                                        <p className="text-xs text-slate-400 mt-1">Found credits will appear here after your next withdrawal.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
