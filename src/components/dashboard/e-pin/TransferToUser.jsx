import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

function TransferToUser() {
  const [to, setTo] = useState("");
  const [count, setCount] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [lastTransfer, setLastTransfer] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);

  async function loadMyPinsCount() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/epins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAvailableCount(Array.isArray(data.epins) ? data.epins.length : 0);
    } catch (e) {
      // ignore
    }
  }

  async function loadTransfers() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/epins/transfers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTransfers(Array.isArray(data.transfers) ? data.transfers : []);
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    loadMyPinsCount();
    loadTransfers();
  }, []);

  async function handleTransfer() {
    setMsg("");
    setLastTransfer(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login first.");
      return;
    }

    const n = Number(count);
    if (!to.trim()) {
      setMsg("Enter target user ID or invite code.");
      return;
    }
    if (!Number.isFinite(n) || n < 1 || n > 10) {
      setMsg("Transfer count must be between 1 and 10.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/epins/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to, count: n }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Transfer failed");

      setLastTransfer(data.transfer);
      setTo("");
      setCount("1");
      await loadMyPinsCount();
      await loadTransfers();
      setMsg("Transfer completed.");
    } catch (e) {
      setMsg(e.message || "Transfer failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full p-4 flex justify-center">
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-indigo-700">ePin Transfer To Member</h2>
            <div className="text-xs text-slate-500">My available pins: {availableCount}</div>
          </div>
        </div>

        {msg && <div className="border rounded px-3 py-2 text-sm bg-white">{msg}</div>}

        <div className="bg-white border rounded-md shadow p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Target user ID or invite code"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="Count (1-10)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={handleTransfer}
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? "Transferring..." : "Transfer Now"}
            </button>
          </div>

          {lastTransfer && (
            <div className="text-sm">
              <div className="font-semibold">
                Sent {lastTransfer.count} pins to {lastTransfer.toUserName}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {lastTransfer.codes.map((c) => (
                  <span key={c} className="px-2 py-1 rounded border bg-slate-50 font-mono text-xs">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-md shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Transfer History</div>
            <button onClick={loadTransfers} className="border px-3 py-1.5 rounded text-xs">Refresh</button>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 text-left">From</th>
                  <th className="p-2 text-left">To</th>
                  <th className="p-2 text-right">Count</th>
                  <th className="p-2 text-left">When</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-2">{t.fromUserName || "admin"}</td>
                    <td className="p-2">{t.toUserName || t.toUserId}</td>
                    <td className="p-2 text-right">{t.count}</td>
                    <td className="p-2">{t.transferredAt ? String(t.transferredAt).slice(0, 19).replace("T", " ") : "-"}</td>
                  </tr>
                ))}
                {transfers.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-500">No transfers yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransferToUser;
