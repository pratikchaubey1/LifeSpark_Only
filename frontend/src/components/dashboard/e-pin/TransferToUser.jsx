import React, { useEffect, useState } from "react";

import config from "../../../config/config";

const API_BASE = config.apiUrl;

function TransferToUser() {
  const [to, setTo] = useState("");
  const [count, setCount] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [lastTransfer, setLastTransfer] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [me, setMe] = useState(null);
  const [directMembers, setDirectMembers] = useState([]);

  async function loadMyPinsCount() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/epins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok)
        setAvailableCount(Array.isArray(data.epins) ? data.epins.length : 0);
    } catch {}
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
    } catch {}
  }

  async function loadMe() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMe(data.user);
    } catch {}
  }

  async function loadDirectMembers() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/team/direct`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok)
        setDirectMembers(Array.isArray(data.members) ? data.members : []);
    } catch {}
  }

  useEffect(() => {
    loadMe();
    loadMyPinsCount();
    loadTransfers();
    loadDirectMembers();
  }, []);

  async function handleTransfer() {
    setMsg("");
    setLastTransfer(null);

    const token = localStorage.getItem("token");
    if (!token) return setMsg("Please login first.");

    const n = Number(count);
    if (!to.trim()) return setMsg("Enter target User ID or Invite Code.");
    if (!Number.isFinite(n) || n < 1 || n > 10)
      return setMsg("Transfer count must be between 1 and 10.");

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
      setMsg("Transfer completed successfully.");
    } catch (e) {
      setMsg(e.message || "Transfer failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full p-6 bg-white text-black flex justify-center">
      <div className="w-full max-w-4xl space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">ePin Transfer</h2>
          <p className="text-sm text-gray-500">
            Available Pins: <span className="font-medium">{availableCount}</span>
          </p>
          {me?.id && (
            <p className="text-xs text-gray-500 mt-1">
              Your User ID: <span className="font-mono">{me.id}</span>
              {me.inviteCode && (
                <> • Invite Code: <span className="font-mono">{me.inviteCode}</span></>
              )}
            </p>
          )}
        </div>

        {/* Message */}
        {msg && (
          <div className="border border-black rounded-lg px-4 py-2 text-sm">
            {msg}
          </div>
        )}

        {/* Transfer Box */}
        <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Target User ID / Invite Code"
              className="border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            <input
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="Count (1-10)"
              className="border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              onClick={handleTransfer}
              disabled={submitting}
              className="border border-black rounded-lg px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition disabled:opacity-60"
            >
              {submitting ? "Transferring..." : "Transfer Now"}
            </button>
          </div>

          {lastTransfer && (
            <div className="text-sm">
              <div className="font-semibold">
                Sent {lastTransfer.count} pins to {lastTransfer.toUserName}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {lastTransfer.codes.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 border rounded font-mono text-xs"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Direct Members */}
        <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between mb-3">
            <div className="font-semibold">My Direct Members</div>
            <button
              onClick={loadDirectMembers}
              className="border px-3 py-1.5 rounded text-xs hover:bg-black hover:text-white transition"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">User ID</th>
                  <th className="p-2 text-left">Invite</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {directMembers.map((m) => (
                  <tr key={m.id} className="border-b">
                    <td className="p-2">{m.name}</td>
                    <td className="p-2 font-mono text-xs">{m.id}</td>
                    <td className="p-2 font-mono text-xs">{m.inviteCode || "-"}</td>
                    <td className="p-2">{m.isActivated ? "Active" : "Inactive"}</td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => setTo(String(m.id))}
                        className="border px-3 py-1.5 rounded text-xs hover:bg-black hover:text-white transition"
                      >
                        Use ID
                      </button>
                    </td>
                  </tr>
                ))}
                {directMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No direct members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transfer History */}
        <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between mb-3">
            <div className="font-semibold">Transfer History</div>
            <button
              onClick={loadTransfers}
              className="border px-3 py-1.5 rounded text-xs hover:bg-black hover:text-white transition"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-2 text-left">From</th>
                  <th className="p-2 text-left">To</th>
                  <th className="p-2 text-right">Count</th>
                  <th className="p-2 text-left">When</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-2">{t.fromUserName || "admin"}</td>
                    <td className="p-2">{t.toUserName || t.toUserId}</td>
                    <td className="p-2 text-right">{t.count}</td>
                    <td className="p-2">
                      {t.transferredAt
                        ? String(t.transferredAt).slice(0, 19).replace("T", " ")
                        : "-"}
                    </td>
                  </tr>
                ))}
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No transfers yet.
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

export default TransferToUser;
