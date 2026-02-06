import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import config from "../../config/config";
import toast from "react-hot-toast";

export default function Autopool({ sidebarOpen, onMenuOpen }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [requesting, setRequesting] = useState(false);

    // Team view state
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [teamLoading, setTeamLoading] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.apiUrl}/autopool/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load Autopool status");
            setLoading(false);
        }
    };

    const fetchTeamMembers = async (level) => {
        try {
            setTeamLoading(true);
            setSelectedLevel(level);
            setShowTeamModal(true);

            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.apiUrl}/autopool/team/${level}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeamMembers(response.data.members || []);
        } catch (err) {
            console.error(err);
            setTeamMembers([]);
        } finally {
            setTeamLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!window.confirm("Submit request to join the Autopool system?")) return;

        try {
            setRequesting(true);
            const token = localStorage.getItem('token');
            await axios.post(`${config.apiUrl}/autopool/request`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Request submitted successfully!");
            fetchStatus();
        } catch (err) {
            toast.error(err.response?.data?.message || "Request failed");
        } finally {
            setRequesting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Autopool Data...</div>;

    return (
        <div
            className="p-6 min-h-screen"
            style={{
                background: "linear-gradient(to bottom, #ffffff, #d8ebff)",
            }}
        >
            {/* ===================== MENU BUTTON ===================== */}
            {!sidebarOpen && (
                <button
                    onClick={() => onMenuOpen?.()}
                    className="mb-5 p-2 rounded-lg bg-white shadow-md hover:bg-slate-100 active:scale-95 transition inline-flex border border-slate-300"
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

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Autopool Protocol</h1>
                    <p className="text-slate-700 mt-1 text-sm">Global 3x3 Matrix Income System</p>
                </div>

                <div className={`px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider
            ${data?.status === 'active' ? 'bg-green-100 text-green-700' :
                        data?.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                            data?.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {data?.status || 'UNKNOWN'}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            {/* ================= INACTIVE OR REJECTED STATE ================= */}
            {(!data?.status || data?.status === 'inactive' || data?.status === 'rejected') && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mt-10"
                >
                    <div className={`p-8 text-white text-center ${data?.status === 'rejected' ? 'bg-gradient-to-r from-red-600 to-orange-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
                        <h2 className="text-3xl font-bold mb-2">
                            {data?.status === 'rejected' ? 'Request Rejected' : 'Join the Global Autopool'}
                        </h2>
                        <p className="opacity-90">
                            {data?.status === 'rejected'
                                ? 'Your previous request was rejected by the admin. You can try submitting a new request.'
                                : 'Unlock passive income through the global 3x3 matrix'}
                        </p>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-center mb-8">
                            <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 w-full max-w-sm">
                                <p className="text-sm text-slate-500 uppercase font-semibold mb-1">Activation Cost</p>
                                <p className="text-4xl font-extrabold text-slate-900">₹3,000</p>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-slate-800 mb-4">How it works:</h3>
                        <ul className="space-y-3 mb-8 text-slate-600">
                            <li className="flex items-start"><span className="mr-2 text-green-500">✓</span> Join the global company tree</li>
                            <li className="flex items-start"><span className="mr-2 text-green-500">✓</span> Automatic placement (Top-to-bottom, Left-to-right)</li>
                            <li className="flex items-start"><span className="mr-2 text-green-500">✓</span> Earn ₹3,000 immediately when your Level 1 (3 members) fills</li>
                            <li className="flex items-start"><span className="mr-2 text-green-500">✓</span> Total potential income up to Level 10</li>
                        </ul>

                        <button
                            onClick={handleJoin}
                            disabled={requesting}
                            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed
                                ${data?.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {requesting ? "Processing Request..." : (data?.status === 'rejected' ? "Re-Submit Request" : "Request Access Now")}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* ================= REQUESTED STATE ================= */}
            {data?.status === 'requested' && (
                <div className="max-w-md mx-auto mt-20 text-center">
                    <div className="bg-yellow-50 p-8 rounded-2xl border-2 border-yellow-200">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                            ⏳
                        </div>
                        <h2 className="text-2xl font-bold text-yellow-800 mb-2">Request Submitted</h2>
                        <p className="text-yellow-700">
                            Your request to join Autopool has been sent to the admin.
                            <br />Please wait for approval.
                        </p>
                    </div>
                </div>
            )}

            {/* ================= ACTIVE STATE ================= */}
            {data?.status === 'active' && (
                <div className="space-y-6">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                            <p className="text-indigo-100 text-sm font-medium mb-1">Total Autopool Income</p>
                            <p className="text-3xl font-bold">₹ {data.income}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <p className="text-slate-500 text-sm font-medium mb-1">Join Date</p>
                            <p className="text-xl font-bold text-slate-800">
                                {new Date(data.joinDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <p className="text-slate-500 text-sm font-medium mb-1">Current Status</p>
                            <p className="text-xl font-bold text-green-600 flex items-center">
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                Active Member
                            </p>
                        </div>
                    </div>

                    {/* Levels Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800">Income Progression</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Level</th>
                                        <th className="px-6 py-4 text-left">Team Size</th>
                                        <th className="px-6 py-4 text-left">Income</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        { lvl: 1, team: 3, inc: 3000 },
                                        { lvl: 2, team: 9, inc: 6000 },
                                        { lvl: 3, team: 27, inc: 9000 },
                                        { lvl: 4, team: 81, inc: 12000 },
                                        { lvl: 5, team: 243, inc: 15000 },
                                        { lvl: 6, team: 729, inc: 18000 },
                                        { lvl: 7, team: 2187, inc: 21000 },
                                        { lvl: 8, team: 6561, inc: 24000 },
                                        { lvl: 9, team: 19683, inc: 27000 },
                                        { lvl: 10, team: 59049, inc: 30000 },
                                    ].map((level) => {
                                        const isCompleted = data.levelsCompleted.includes(level.lvl);
                                        return (
                                            <tr key={level.lvl} className={isCompleted ? "bg-green-50/50" : ""}>
                                                <td className="px-6 py-4 font-medium text-slate-800">Level {level.lvl}</td>
                                                <td className="px-6 py-4 text-slate-600">{level.team.toLocaleString()}</td>
                                                <td className="px-6 py-4 font-bold text-slate-700">₹ {level.inc.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {isCompleted ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Paid
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => fetchTeamMembers(level.lvl)}
                                                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                                    >
                                                        👁 View Team
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members Modal */}
            {showTeamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Level {selectedLevel} Team Members</h3>
                            <button
                                onClick={() => setShowTeamModal(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {teamLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading team members...</div>
                            ) : teamMembers.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-5xl mb-4">👥</div>
                                    <p className="text-slate-500">No team members at this level yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {teamMembers.map((member, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{member.name}</p>
                                                    <p className="text-xs text-slate-500">ID: {member.inviteCode}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-600">{member.phone}</p>
                                                <p className="text-xs text-slate-400">Joined: {member.joinDate}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                            <p className="text-center text-sm text-slate-500">
                                Total: <span className="font-bold text-slate-700">{teamMembers.length}</span> member(s)
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
