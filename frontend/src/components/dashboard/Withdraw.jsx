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
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from "react-icons/fi";

const API_BASE = config.apiUrl;

export default function Withdraw({ onMenuOpen }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // info, success, error

  const [balance, setBalance] = useState(0);
  const [upiId, setUpiId] = useState("");
  const [upiNo, setUpiNo] = useState("");
  const [amount, setAmount] = useState("");

  const [withdrawals, setWithdrawals] = useState([]);

  const loadAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login first.");
      setMsgType("error");
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
      setMsgType("error");
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
      setMsgType("error");
      return setMsg("Please login again.");
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setMsgType("error");
      return setMsg("Enter valid amount.");
    }
    if (amt > balance) {
      setMsgType("error");
      return setMsg("Insufficient balance.");
    }
    if (!upiId.trim()) {
      setMsgType("error");
      return setMsg("UPI ID required.");
    }
    if (!upiNo.trim()) {
      setMsgType("error");
      return setMsg("UPI Number required.");
    }

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
      if (!res.ok) {
        setMsgType("error");
        return setMsg(data.message || "Failed.");
      }

      setMsg("Withdrawal request submitted successfully.");
      setMsgType("success");
      setWithdrawals((prev) => [data.withdrawal, ...prev]);
      setAmount("");
      setBalance(prev => prev - amt);
    } catch {
      setMsg("Failed to submit request.");
      setMsgType("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-slate-500 font-medium">Loading your account...</div>
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
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-none">
                Withdraw
              </h2>
              <div className="text-xs text-slate-500 mt-1">Payout to your account</div>
            </div>
          </div>

          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition active:scale-95"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: BALANCE & FORM */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">

            {/* BALANCE CARD */}
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <FiDollarSign size={120} />
              </div>
              <div className="relative z-10">
                <div className="text-blue-100 text-sm font-medium uppercase tracking-wider">Available Balance</div>
                <div className="text-4xl md:text-5xl font-bold mt-2">₹{balance.toLocaleString()}</div>
              </div>
            </div>

            {/* MESSAGE */}
            {msg && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-4 duration-300 ${msgType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                msgType === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                {msgType === 'success' ? <FiCheckCircle /> : msgType === 'error' ? <FiXCircle /> : <FiAlertCircle />}
                <span className="text-sm font-medium">{msg}</span>
              </div>
            )}

            {/* WITHDRAW FORM */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                Payout Details
              </h3>

              <InputGroup
                icon={<FiCreditCard />}
                label="UPI ID"
                placeholder="example@upi"
                value={upiId}
                onChange={setUpiId}
              />

              <InputGroup
                icon={<FiSmartphone />}
                label="UPI Mobile Number"
                placeholder="10-digit number"
                value={upiNo}
                onChange={setUpiNo}
              />

              <InputGroup
                icon={<FiDollarSign />}
                label="Amount to Withdraw"
                placeholder="Enter amount"
                value={amount}
                onChange={setAmount}
                type="number"
              />

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 rounded-2xl text-white font-bold bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-slate-200"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiSend />
                    Submit Payout Request
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: HISTORY */}
          <div className="lg:col-span-12 xl:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FiClock className="text-blue-600" /> Withdrawal History
                </h3>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-100">
                      <th className="px-6 py-4">ID / Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {withdrawals.map((w) => (
                      <tr key={w._id || w.withdrawalId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-[11px] font-mono font-bold text-slate-400 leading-none mb-1">
                            {w.withdrawalId || "-"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {w.requestedAt ? new Date(w.requestedAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-base font-bold text-slate-900">₹{Number(w.amount).toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={w.status} />
                        </td>
                      </tr>
                    ))}

                    {withdrawals.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center opacity-40">
                            <FiClock size={48} className="text-slate-300" />
                            <div className="mt-3 text-sm text-slate-500 font-medium">No withdrawal requests yet.</div>
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

function InputGroup({ icon, label, placeholder, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      <div className="group relative flex items-center">
        <div className="absolute left-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onWheel={(e) => type === "number" && e.target.blur()}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 shadow-sm transition-all text-slate-700"
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase() || 'pending';

  if (s === 'approved') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        Approved
      </div>
    );
  }

  if (s === 'rejected') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold uppercase tracking-wider">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        Rejected
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
      Pending
    </div>
  );
}
