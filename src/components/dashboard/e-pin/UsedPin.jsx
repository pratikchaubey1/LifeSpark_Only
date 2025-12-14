import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

function UsedPin() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [used, setUsed] = useState([]);

  async function load() {
    setMsg("");
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/epins/used`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load used pins");
      setUsed(Array.isArray(data.epins) ? data.epins : []);
    } catch (e) {
      setMsg(e.message || "Failed to load used pins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="w-full min-h-[60vh] flex items-start justify-center px-4 py-6">
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-indigo-700">Used ePin Report</h2>
            <div className="text-xs text-slate-500">Records: {used.length}</div>
          </div>
          <button onClick={load} className="border px-3 py-2 rounded text-sm">Refresh</button>
        </div>

        {msg && <div className="border rounded px-3 py-2 text-sm bg-white">{msg}</div>}

        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-auto border rounded bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Package</th>
                  <th className="p-3 text-left">Used At</th>
                </tr>
              </thead>
              <tbody>
                {used.map((p) => (
                  <tr key={p.code} className="border-t">
                    <td className="p-3 font-mono">{p.code}</td>
                    <td className="p-3">{p.packageId || "-"}</td>
                    <td className="p-3">{p.usedAt ? String(p.usedAt).slice(0, 19).replace("T", " ") : "-"}</td>
                  </tr>
                ))}
                {used.length === 0 && (
                  <tr><td colSpan={3} className="p-6 text-center text-slate-500">No used pins yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsedPin;
