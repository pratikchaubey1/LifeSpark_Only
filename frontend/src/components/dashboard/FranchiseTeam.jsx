import React, { useState, useEffect } from "react";
import { FiUsers, FiCheckCircle, FiXCircle, FiPlay, FiSearch } from "react-icons/fi";
import config from "../../config/config";

const API_BASE = config.apiUrl;

export default function FranchiseTeam({ onMenuOpen }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [team, setTeam] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchTeam();
    }, []);

    async function fetchTeam() {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/franchise/team`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch team");
            setTeam(data.team || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleActivate(userId) {
        if (!window.confirm("Are you sure you want to activate this user?")) return;

        setActionLoading(userId);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/franchise/activate/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Activation failed");

            alert(data.message);
            // Refresh team data
            await fetchTeam();
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    }

    const filteredTeam = team.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.inviteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f3f6fb] p-4 md:p-8">
            {/* Menu Toggle for Mobile */}
            <button
                onClick={() => onMenuOpen?.()}
                className="mb-6 p-2 rounded-lg bg-white shadow hover:bg-slate-100 transition border md:hidden"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-3xl shadow-xl border border-[#e2e8f0] p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <FiUsers size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Franchise Team</h1>
                            <p className="text-slate-500 text-sm mt-1">Manage your complete 10-level downline structure</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search name, code, or email..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
                        <FiXCircle size={20} />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="bg-white rounded-3xl shadow-xl border border-[#e2e8f0] p-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-slate-600 font-medium">Loading your downline team...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl border border-[#e2e8f0] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0f172a] text-white">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-sm">Level</th>
                                        <th className="px-6 py-4 font-semibold text-sm">Member</th>
                                        <th className="px-6 py-4 font-semibold text-sm">Invite Code</th>
                                        <th className="px-6 py-4 font-semibold text-sm">Status</th>
                                        <th className="px-6 py-4 font-semibold text-sm">Joined On</th>
                                        <th className="px-6 py-4 font-semibold text-sm text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTeam.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-slate-500">
                                                <FiUsers size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="text-lg font-medium">No members found</p>
                                                <p className="text-sm">Try adjusting your search or grow your team!</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTeam.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${u.level <= 3 ? "bg-amber-100 text-amber-700" :
                                                            u.level <= 6 ? "bg-blue-100 text-blue-700" :
                                                                "bg-slate-100 text-slate-700"
                                                        }`}>
                                                        L{u.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{u.name}</span>
                                                        <span className="text-xs text-slate-500">{u.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-sm text-indigo-600 font-semibold uppercase">
                                                    {u.inviteCode}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.isActivated ? (
                                                        <span className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                                                            <FiCheckCircle /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-rose-500 text-sm font-bold">
                                                            <FiXCircle /> Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {!u.isActivated ? (
                                                        <button
                                                            disabled={actionLoading === u.id}
                                                            onClick={() => handleActivate(u.id)}
                                                            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 mx-auto"
                                                        >
                                                            {actionLoading === u.id ? (
                                                                <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                                                            ) : (
                                                                <FiPlay size={14} />
                                                            )}
                                                            Activate
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Activated</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
