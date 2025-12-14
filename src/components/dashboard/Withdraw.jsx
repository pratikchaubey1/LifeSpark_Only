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
        setWithdrawals(Array.isArray(listData.withdrawals) ? listData.withdrawals : []);
      }
    } catch (e) {
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
    if (!token) {
      setMsg("Please login again.");
      return;
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setMsg("Enter a valid amount.");
      return;
    }
    if (amt > balance) {
      setMsg("Insufficient balance.");
      return;
    }
    if (!String(upiId).trim()) {
      setMsg("UPI ID is required.");
      return;
    }
    if (!String(upiNo).trim()) {
      setMsg("UPI Number is required.");
      return;
    }

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
      if (!res.ok) {
        setMsg(data.message || "Withdrawal request failed.");
        return;
      }

      setMsg("Withdrawal request submitted. Status: pending.");
      setWithdrawals((prev) => [data.withdrawal, ...prev]);
      setAmount("");
    } catch (e) {
      setMsg("Withdrawal request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-slate-600">Loading withdrawals...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 flex items-start sm:items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Withdraw</h2>
            <p className="text-xs text-slate-500 mt-1">Available balance: <span className="font-mono">{balance}</span></p>
          </div>
          <button onClick={loadAll} className="border px-3 py-2 rounded text-sm">Refresh</button>
        </div>

        {msg && <div className="mb-4 rounded-lg border bg-white px-3 py-2 text-sm">{msg}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-600">UPI ID</label>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900"
              placeholder="yourid@bank"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-600">UPI Number</label>
            <input
              value={upiNo}
              onChange={(e) => setUpiNo(e.target.value)}
              className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900"
              placeholder="UPI linked mobile number"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-600">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900"
              placeholder="Enter amount"
            />
            <p className="text-[11px] text-slate-400 mt-1">Amount must be less than or equal to balance.</p>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Withdrawal"}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">My Requests</h3>
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Requested</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-t">
                    <td className="p-3 font-mono">{w.id}</td>
                    <td className="p-3 text-right">{w.amount}</td>
                    <td className="p-3">{w.status}</td>
                    <td className="p-3">{w.requestedAt ? String(w.requestedAt).slice(0, 19).replace("T", " ") : "-"}</td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">No requests yet.</td>
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
