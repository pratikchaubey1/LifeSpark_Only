import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config/config";
import toast from "react-hot-toast";

export default function AdminAutopool() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const [pendingRes, historyRes] = await Promise.all([
                axios.get(`${config.apiUrl}/autopool/requests`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${config.apiUrl}/autopool/history`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setRequests(pendingRes.data);
            setHistory(historyRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load data");
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        if (!window.confirm("Approve this user for Autopool? Global placement will occur.")) return;

        try {
            setProcessing(userId);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const res = await axios.post(`${config.apiUrl}/autopool/approve/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`Approved! Placed under: ${res.data.parent || 'ROOT'}`);
            fetchData(); // Refresh both lists
        } catch (err) {
            toast.error(err.response?.data?.message || "Approval failed");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (userId) => {
        if (!window.confirm("Reject this autopool request?")) return;

        try {
            setProcessing(userId);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            await axios.post(`${config.apiUrl}/autopool/reject/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Request rejected.");
            fetchData(); // Refresh both lists
        } catch (err) {
            toast.error(err.response?.data?.message || "Rejection failed");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="p-10">Loading Requests...</div>;

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Autopool Requests</h2>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {requests.length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    No pending requests found.
                </div>
            ) : (
                <div className="overflow-x-auto mb-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm uppercase">
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Phone</th>
                                <th className="p-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50 transition">
                                    <td className="p-4 font-medium text-slate-800">
                                        {user.name} <br />
                                        <span className="text-xs text-slate-500 font-normal">{user.inviteCode}</span>
                                    </td>
                                    <td className="p-4 text-slate-600">{user.email}</td>
                                    <td className="p-4 text-slate-600">{user.phone}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleReject(user._id)}
                                            disabled={processing === user._id}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
                                        >
                                            {processing === user._id ? "..." : "Reject"}
                                        </button>
                                        <button
                                            onClick={() => handleApprove(user._id)}
                                            disabled={processing === user._id}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
                                        >
                                            {processing === user._id ? "Processing..." : "Approve"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <h2 className="text-xl font-bold text-slate-800 mb-6 mt-10 pt-10 border-t border-slate-200">History Log</h2>
            {history.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic">No history available.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                                <th className="p-3">Data</th>
                                <th className="p-3">User</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {history.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50 transition">
                                    <td className="p-3 text-slate-500 text-sm">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-3 text-slate-700">
                                        {item.userName} ({item.inviteCode})
                                    </td>
                                    <td className="p-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${item.action === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.action}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
