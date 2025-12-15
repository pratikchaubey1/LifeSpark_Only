import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

export default function Withdraw() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const [balance, setBalance] = useState(0);
  const [upiId, setUpiId] = useState("");
  const [upiNo, setUpiNo] = useState("");
  const [amount, setAmount] = useState("");

  const [withdrawals, setWithdrawals] = useState([]);

  const loadAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [profileRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/withdrawals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const profileData = await profileRes.json();
      const listData = await listRes.json();

      if (profileRes.ok) {
        setBalance(Number(profileData.user?.balance) || 0);
        setUpiId(profileData.user?.upiId || "");
        setUpiNo(profileData.user?.upiNo || "");
      }

      if (listRes.ok) {
        setWithdrawals(
          Array.isArray(listData.withdrawals) ? listData.withdrawals : []
        );
      }
    } catch {
      setMsg("Failed to load withdrawals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSubmit = async () => {
    setMsg("");
    const token = localStorage.getItem("token");
    if (!token) return setMsg("Please login again.");

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0)
      return setMsg("Enter a valid amount.");
    if (amt > balance) return setMsg("Insufficient balance.");
    if (!upiId.trim()) return setMsg("UPI ID is required.");
    if (!upiNo.trim()) return setMsg("UPI Number is required.");

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/withdrawals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amt, upiId, upiNo }),
      });

      const data = await res.json();
      if (!res.ok) return setMsg(data.message || "Withdrawal failed.");

      setMsg("Withdrawal request submitted. Status: Pending.");
      setWithdrawals((prev) => [data.withdrawal, ...prev]);
      setAmount("");
    } catch {
      setMsg("Withdrawal request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-indigo-600 font-medium">Loading withdrawals…</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Withdraw Funds
            </h2>
            <p className="text-sm text-gray-600">
              Available Balance:
              <span className="ml-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                ₹ {balance}
              </span>
            </p>
          </div>

          <button
            onClick={loadAll}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white shadow hover:shadow-md transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Message */}
        {msg && (
          <div className="rounded-xl px-4 py-3 text-sm bg-yellow-100 text-yellow-800 border border-yellow-200">
            {msg}
          </div>
        )}

        {/* Withdraw Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="UPI ID (yourid@bank)"
            className="border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <input
            value={upiNo}
            onChange={(e) => setUpiNo(e.target.value)}
            placeholder="UPI Linked Mobile Number"
            className="border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Withdrawal Amount"
            className="border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Withdrawal"}
          </button>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="font-semibold mb-3 text-indigo-700">
            My Withdrawal Requests
          </h3>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Requested</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b hover:bg-indigo-50 transition">
                    <td className="p-3 font-mono">{w.id}</td>
                    <td className="p-3 text-right font-semibold">
                      ₹ {w.amount}
                    </td>
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {w.requestedAt
                        ? String(w.requestedAt)
                            .slice(0, 19)
                            .replace("T", " ")
                        : "-"}
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      No requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
