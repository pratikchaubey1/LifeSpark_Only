import React, { useEffect, useState } from "react";
import config from "../../config/config";

import {
  FiMenu,
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiRefreshCw,
  FiSend,
  FiClock,
} from "react-icons/fi";

const API_BASE = config.apiUrl;

export default function Withdraw({ onMenuOpen }) {
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
        fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),

        fetch(`${API_BASE}/withdrawals`, {
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
      setMsg("Failed to load data.");
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
    if (!amt || amt <= 0) return setMsg("Enter valid amount.");
    if (amt > balance) return setMsg("Insufficient balance.");
    if (!upiId.trim()) return setMsg("UPI ID required.");
    if (!upiNo.trim()) return setMsg("UPI Number required.");

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/withdrawals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amt, upiId, upiNo }),
      });

      const data = await res.json();
      if (!res.ok) return setMsg(data.message || "Failed.");

      setMsg("Withdrawal request submitted (Pending).");
      setWithdrawals((prev) => [data.withdrawal, ...prev]);
      setAmount("");
    } catch {
      setMsg("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-100">
        <div className="text-indigo-700 text-lg font-medium animate-pulse">
          Loading Withdrawals…
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6 flex justify-center">
      <div className="w-full max-w-5xl space-y-8">

        {/* HEADER - Menu + Title */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* MENU BUTTON */}
            <button
              onClick={() => onMenuOpen?.()}
              className="p-2 rounded-lg bg-white shadow hover:bg-slate-100 active:scale-95 transition"
            >
              <FiMenu className="text-slate-700 text-xl" />
            </button>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Withdraw Funds
            </h2>
          </div>

          <button
            onClick={loadAll}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-white shadow hover:shadow-md transition"
          >
            <FiRefreshCw className="text-indigo-600" />
            Refresh
          </button>
        </div>

        {/* Balance display */}
        <p className="text-lg text-gray-700">
          Available Balance:{" "}
          <span className="ml-2 px-4 py-1 bg-green-100 text-green-700 font-semibold rounded-full text-base">
            ₹ {balance}
          </span>
        </p>

        {/* MESSAGE */}
        {msg && (
          <div className="rounded-xl px-4 py-3 text-sm bg-yellow-100 text-yellow-800 border border-yellow-300">
            {msg}
          </div>
        )}

        {/* WITHDRAW FORM */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">

          {/* UPI ID */}
          <div className="flex items-center bg-slate-100 border p-3 rounded-xl gap-3">
            <FiCreditCard className="text-slate-500 text-xl" />
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="Your UPI ID (example@upi)"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>

          {/* UPI Number */}
          <div className="flex items-center bg-slate-100 border p-3 rounded-xl gap-3">
            <FiSmartphone className="text-slate-500 text-xl" />
            <input
              value={upiNo}
              onChange={(e) => setUpiNo(e.target.value)}
              placeholder="UPI Linked Mobile Number"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>

          {/* Amount */}
          <div className="flex items-center bg-slate-100 border p-3 rounded-xl gap-3">
            <FiDollarSign className="text-slate-500 text-xl" />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Withdrawal Amount"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-95 disabled:opacity-60 transition"
          >
            <FiSend />
            {submitting ? "Submitting..." : "Submit Withdrawal"}
          </button>
        </div>

        {/* HISTORY */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="font-semibold mb-4 text-indigo-700 text-lg flex items-center gap-2">
            <FiClock /> Withdrawal History
          </h3>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-indigo-50 text-indigo-900">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Requested</th>
                </tr>
              </thead>

              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b hover:bg-indigo-50/50">
                    <td className="p-3 font-mono">{w.id}</td>
                    <td className="p-3 text-right font-semibold">₹ {w.amount}</td>
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {w.requestedAt
                        ? String(w.requestedAt).slice(0, 19).replace("T", " ")
                        : "-"}
                    </td>
                  </tr>
                ))}

                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      No withdrawals yet.
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
