import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config/config";

export default function AdminAutopool() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const response = await axios.get(`${config.apiUrl}/autopool/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load requests");
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

            alert(`Approved! Placed under: ${res.data.parent || 'ROOT'}`);

            // Remove from list
            setRequests(requests.filter(r => r._id !== userId));
        } catch (err) {
            alert(err.response?.data?.message || "Approval failed");
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
                <div className="overflow-x-auto">
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
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleApprove(user._id)}
                                            disabled={processing === user._id}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
                                        >
                                            {processing === user._id ? "Processing..." : "Approve & Place"}
                                        </button>
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
