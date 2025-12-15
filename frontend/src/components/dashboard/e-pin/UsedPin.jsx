import React, { useEffect, useState } from "react";

import config from "../../../config/config";

const API_BASE = config.apiUrl;

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
    <div className="w-full p-6 bg-white text-black flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Used ePin Report</h2>
            <p className="text-sm text-gray-500">
              Records: <span className="font-medium">{used.length}</span>
            </p>
          </div>

          <button
            onClick={load}
            className="border border-black px-4 py-2 rounded-lg text-sm hover:bg-black hover:text-white transition"
          >
            Refresh
          </button>
        </div>

        {/* Message */}
        {msg && (
          <div className="border border-black rounded-lg px-4 py-2 text-sm">
            {msg}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-auto border border-gray-300 rounded-xl bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-white sticky top-0">
                <tr>
                  <th className="p-3 text-left font-semibold">Code</th>
                  <th className="p-3 text-left font-semibold">Package</th>
                  <th className="p-3 text-left font-semibold">Used At</th>
                </tr>
              </thead>

              <tbody>
                {used.map((p) => (
                  <tr
                    key={p.code}
                    className="border-b last:border-none hover:bg-gray-100 transition"
                  >
                    <td className="p-3 font-mono">{p.code}</td>
                    <td className="p-3">{p.packageId || "-"}</td>
                    <td className="p-3">
                      {p.usedAt
                        ? String(p.usedAt)
                            .slice(0, 19)
                            .replace("T", " ")
                        : "-"}
                    </td>
                  </tr>
                ))}

                {used.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-6 text-center text-gray-500"
                    >
                      No used pins yet.
                    </td>
                  </tr>
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
