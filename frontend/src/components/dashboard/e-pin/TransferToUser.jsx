import React, { useEffect, useState } from "react";
import config from "../../../config/config";

const API_BASE = config.apiUrl;

export default function TransferToUser({ onMenuOpen }) {
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
      const res = await fetch(`${API_BASE}/epins`, {
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
      const res = await fetch(`${API_BASE}/epins/transfers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTransfers(data.transfers || []);
    } catch {}
  }

  async function loadMe() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/profile`, {
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
      const res = await fetch(`${API_BASE}/team/direct`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setDirectMembers(data.members || []);
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
    if (!to.trim()) return setMsg("Enter User ID / Invite Code.");
    if (!Number.isFinite(n) || n < 1 || n > 10)
      return setMsg("Transfer count must be between 1 and 10.");

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/epins/transfer`, {
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-5 flex justify-center">
      <div className="w-full max-w-5xl space-y-8">

        {/* TOP BAR WITH MENU BUTTON */}
        <div className="flex items-center gap-3">
          {/* MENU BUTTON */}
          <button
            onClick={() => onMenuOpen?.()}
            className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 transition"
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

          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">ePin Transfer</h2>
        </div>

        {/* HEADER CARD */}
        <div className="bg-white shadow-md rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">
            Available Pins: <span className="font-semibold">{availableCount}</span>
          </p>

          {me?.id && (
            <p className="text-xs text-slate-500 mt-1">
              User ID: <span className="font-mono">{me.id}</span>
              {me.inviteCode && (
                <> • Invite Code: <span className="font-mono">{me.inviteCode}</span></>
              )}
            </p>
          )}
        </div>

        {/* MESSAGE */}
        {msg && (
          <div className="rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-sm">
            {msg}
          </div>
        )}

        {/* TRANSFER BOX */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Target User ID / Invite Code"
              className="p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-black/60 outline-none"
            />
            <input
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="Count (1-10)"
              className="p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-black/60 outline-none"
            />
            <button
              onClick={handleTransfer}
              disabled={submitting}
              className="px-4 py-3 rounded-lg text-sm font-medium bg-black text-white hover:bg-slate-800 transition disabled:opacity-60"
            >
              {submitting ? "Transferring..." : "Transfer Now"}
            </button>
          </div>

          {lastTransfer && (
            <div className="text-sm bg-slate-50 p-4 rounded-lg border">
              <div className="font-semibold">
                Sent {lastTransfer.count} pins to {lastTransfer.toUserName}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {lastTransfer.codes.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 border rounded font-mono text-xs bg-white"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DIRECT MEMBERS */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-slate-800">My Direct Members</h3>
            <button
              onClick={loadDirectMembers}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs hover:bg-black hover:text-white transition"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b">
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
                        className="px-3 py-1.5 border rounded-lg text-xs hover:bg-black hover:text-white transition"
                      >
                        Use ID
                      </button>
                    </td>
                  </tr>
                ))}

                {directMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">
                      No direct members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TRANSFER HISTORY */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Transfer History</h3>
            <button
              onClick={loadTransfers}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs hover:bg-black hover:text-white transition"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-2 text-left">From</th>
                  <th className="p-2 text-left">To</th>
                  <th className="p-2 text-right">Count</th>
                  <th className="p-2 text-left">Time</th>
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
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      No transfers found.
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
