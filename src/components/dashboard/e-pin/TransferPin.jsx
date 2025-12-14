import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

function TransferPin() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [epins, setEpins] = useState([]);

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
      const res = await fetch(`${API_BASE}/api/epins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load epins");
      setEpins(Array.isArray(data.epins) ? data.epins : []);
    } catch (e) {
      setMsg(e.message || "Failed to load epins");
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
            <h2 className="text-xl md:text-2xl font-bold text-indigo-700">My E-Pins</h2>
            <div className="text-xs text-slate-500">Available: {epins.length}</div>
          </div>
          <button onClick={load} className="border px-3 py-2 rounded text-sm">Refresh</button>
        </div>

        {msg && <div className="border rounded px-3 py-2 text-sm bg-white">{msg}</div>}

        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {epins.length === 0 ? (
              <div className="text-slate-500">No E-Pins assigned.</div>
            ) : (
              epins.map((p) => (
                <div key={p.code} className="p-2 border rounded font-mono text-sm truncate bg-white">
                  {p.code}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransferPin;
