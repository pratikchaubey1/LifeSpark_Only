import React, { useEffect, useState } from "react";
import config from "../../config/config";
import {
    FiMenu,
    FiHeart,
    FiDollarSign,
    FiRefreshCw,
    FiSend,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiTrendingUp
} from "react-icons/fi";

const API_BASE = config.apiUrl;

export default function DannFund({ onMenuOpen }) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState("info");

    const [userBalance, setUserBalance] = useState(0);
    const [amount, setAmount] = useState("");
    const [stats, setStats] = useState({ balance: 0, logs: [] });

    const loadData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            setLoading(true);
            const [profileRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/funds/dann/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const profileData = await profileRes.json();
            const statsData = await statsRes.json();

            if (profileRes.ok) setUserBalance(Number(profileData.user?.balance) || 0);
            if (statsRes.ok) setStats(statsData);
        } catch (err) {
            console.error("Load Dann data error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleContribute = async () => {
        setMsg("");
        const token = localStorage.getItem("token");
        if (!token) return setMsg("Please login first.");

        const amt = Number(amount);
        if (!amt || amt <= 0) return setMsg("Enter a valid amount.");
        if (amt > userBalance) return setMsg("Insufficient balance in your wallet.");

        try {
            setSubmitting(true);
            const res = await fetch(`${API_BASE}/funds/dann/contribute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ amount: amt })
            });

            const data = await res.json();
            if (!res.ok) {
                setMsgType("error");
                return setMsg(data.message || "Contribution failed.");
            }

            setMsg(data.message);
            setMsgType("success");
            setAmount("");
            await loadData();
        } catch (err) {
            setMsg("Failed to process contribution.");
            setMsgType("error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="mt-4 text-slate-500 font-medium tracking-tight">Loading Dann Fund...</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center text-slate-800 font-sans">
            <div className="w-full max-w-5xl space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onMenuOpen?.()}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 transition-all active:scale-95"
                        >
                            <FiMenu className="text-xl" />
                        </button>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-none tracking-tight flex items-center gap-2 italic">
                                <FiHeart className="text-indigo-600 animate-pulse" /> DANN FUND
                            </h2>
                            <div className="text-[10px] md:text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest opacity-70">Empowerment through collective growth</div>
                        </div>
                    </div>

                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm shadow-indigo-100"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                        <span className="hidden sm:inline uppercase tracking-widest">Refresh</span>
                    </button>
                </div>

                <div className="flex justify-center">
                    {/* CONTRIBUTION BOX */}
                    <div className="w-full max-w-xl space-y-6">

                        {/* BALANCE CARD */}
                        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group text-center">
                            <div className="absolute -top-10 -right-10 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <FiHeart size={200} />
                            </div>
                            <div className="relative z-10 space-y-2">
                                <div className="text-indigo-100 text-xs font-bold uppercase tracking-[0.2em] opacity-80">Your Wallet Balance</div>
                                <div className="text-4xl md:text-5xl font-black tracking-tighter">₹{userBalance.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* FORM */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6 transition-all hover:shadow-lg">
                            <div className="space-y-1">
                                <h3 className="font-black text-slate-900 flex items-center gap-2 text-lg tracking-tight uppercase">
                                    <FiTrendingUp className="text-indigo-600" /> Contribute to Dann Fund
                                </h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                                    Your personal contribution helps empower collective community growth.
                                </p>
                            </div>

                            {msg && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in zoom-in-95 duration-300 ${msgType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                                    {msgType === 'success' ? <FiCheckCircle className="shrink-0" /> : <FiAlertCircle className="shrink-0" />}
                                    <span className="text-xs font-bold uppercase tracking-tight">{msg}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Amount to Donate</label>
                                    <div className="group relative flex items-center">
                                        <div className="absolute left-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <FiDollarSign className="text-lg" />
                                        </div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Min. ₹1"
                                            className="w-full pl-12 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 transition-all text-slate-800 placeholder:text-slate-300 shadow-inner"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleContribute}
                                    disabled={submitting || !amount || Number(amount) <= 0}
                                    className="w-full py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                                >
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FiSend className="text-sm" />
                                            Confirm Contribution
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
