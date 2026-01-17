import React, { useState, useEffect } from "react";
import { FiUsers, FiSearch, FiEdit, FiSave, FiX, FiCheckCircle, FiXCircle } from "react-icons/fi";
import config from "../../config/config";

const API_BASE = config.apiUrl;

export default function FranchiseBankUpdate({ onMenuOpen }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [team, setTeam] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        bankName: "",
        accountNo: "",
        ifsc: "",
        branchName: "",
        accountHolder: "",
        upiId: "",
        upiNo: ""
    });
    const [saving, setSaving] = useState(false);

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

    const openEditModal = (user) => {
        setEditingUser(user);
        // Pre-fill form (we might need to fetch full details if 'team' endpoint doesn't return bank details)
        // Currently 'team' endpoint returns limited fields. We might need to fetch user details or update 'team' endpoint.
        // Let's assume for now we need to fetch specific user details or blindly update.
        // Actually, for editing, we usually want to see existing details.
        // The current GET /franchise/team endpoint (lines 20-67 in franchise.js) selects 'name email inviteCode isActivated activatedAt createdAt directInviteIds'.
        // It does NOT select 'bankDetails' or 'upiId'.
        // I should probably update GET /franchise/team to include bank details OR fetch them when opening modal.
        // Fetching on modal open is safer/cleaner for list performance.
        // But for now, since I can't easily add a "get single user" endpoint without more backend work,
        // I will assume emptiness if not provided, OR better: Update the GET /franchise/team to include bank details.
        // Given the requirement is to "update", typically implies "edit".
        // I will try to fetch user profile or update the backend list to include bank details.
        // Let's update backend first? No, I want to minimize backend changes if possible.
        // Note: The AdminPage fetches ALL withdrawals which contain user info.
        // If I strictly follow the prompt, I should allow "edit and update".
        // I will initialize with empty strings and let them overwrite if data is missing, BUT it's better to show current.
        // I will add bankDetails to the GET /franchise/team projection in backend next.
        // For this file creation, I will assume `user.bankDetails` exists in the `u` object.

        setFormData({
            bankName: user.bankDetails?.bankName || "",
            accountNo: user.bankDetails?.accountNo || "",
            ifsc: user.bankDetails?.ifsc || "",
            branchName: user.bankDetails?.branchName || "",
            accountHolder: user.bankDetails?.accountHolder || "",
            upiId: user.upiId || "",
            upiNo: user.upiNo || ""
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/franchise/update-bank/${editingUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    bankDetails: {
                        bankName: formData.bankName,
                        accountNo: formData.accountNo,
                        ifsc: formData.ifsc,
                        branchName: formData.branchName,
                        accountHolder: formData.accountHolder
                    },
                    upiId: formData.upiId,
                    upiNo: formData.upiNo
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");

            alert(data.message);
            setIsModalOpen(false);
            setEditingUser(null);
            fetchTeam(); // Refresh to see changes (if we display them)
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredTeam = team.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.inviteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f3f6fb] p-4 md:p-8 text-slate-900">
            {/* Menu Toggle */}
            <button
                onClick={() => onMenuOpen?.()}
                className="mb-6 p-2 rounded-lg bg-white shadow hover:bg-slate-100 transition border md:hidden"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-[#e2e8f0] p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <FiUsers size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Update Team Bank Details</h1>
                            <p className="text-slate-500 text-sm mt-1">Manage bank & UPI details for your downline</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-72">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search name, code, or email..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
                        <FiXCircle size={20} />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-3xl shadow-xl border border-[#e2e8f0] p-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                        <p className="mt-4 text-slate-600 font-medium">Loading team members...</p>
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
                                        <th className="px-6 py-4 font-semibold text-sm text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTeam.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                                <FiUsers size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="text-lg font-medium">No members found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTeam.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${u.level <= 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                                                        L{u.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{u.name}</span>
                                                        <span className="text-xs text-slate-500">{u.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-sm text-emerald-600 font-semibold uppercase">
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
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => openEditModal(u)}
                                                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 mx-auto"
                                                    >
                                                        <FiEdit size={14} /> Edit Bank
                                                    </button>
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

            {/* EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Edit Bank Details</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-4 bg-blue-50 text-blue-800 px-4 py-2 rounded text-sm mb-6">
                                Updating details for: <strong>{editingUser?.name}</strong> ({editingUser?.inviteCode})
                            </div>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Account Holder</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                        value={formData.accountHolder}
                                        onChange={e => setFormData({ ...formData, accountHolder: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Bank Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                            value={formData.bankName}
                                            onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Account No</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                            value={formData.accountNo}
                                            onChange={e => setFormData({ ...formData, accountNo: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">IFSC Code</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                            value={formData.ifsc}
                                            onChange={e => setFormData({ ...formData, ifsc: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Branch</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                            value={formData.branchName}
                                            onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <hr className="border-slate-100" />
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">UPI ID</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                        value={formData.upiId}
                                        onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">UPI Phone No</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                        value={formData.upiNo}
                                        onChange={e => setFormData({ ...formData, upiNo: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                                    >
                                        {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <FiSave />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
