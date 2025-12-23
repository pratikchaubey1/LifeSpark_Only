import React, { useEffect, useState } from "react";
import config from "../../../config/config";

const API_BASE = config.apiUrl;

export default function UsedPin({ onMenuOpen }) {
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
      const res = await fetch(`${API_BASE}/epins/used`, {
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-5 flex justify-center">
      <div className="w-full max-w-5xl space-y-8">

        {/* TOP BAR — Menu Button + Title */}
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

          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Used ePin Report
          </h2>
        </div>

        {/* REFRESH & COUNT */}
        <div className="flex items-center justify-between bg-white border border-slate-200 shadow-sm p-4 rounded-xl">
          <p className="text-sm text-slate-600">
            Total Used Pins: <span className="font-semibold">{used.length}</span>
          </p>

          <button
            onClick={load}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-black hover:text-white transition text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        {/* MESSAGE */}
        {msg && (
          <div className="rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-sm">
            {msg}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white shadow-md rounded-xl border border-slate-200 p-0 overflow-hidden">
          {loading ? (
            <div className="p-4 text-sm text-black animate-pulse">Loading...</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b">
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
                      className="border-b last:border-none hover:bg-slate-100/70 transition"
                    >
                      <td className="p-3 font-mono">{p.code}</td>
                      <td className="p-3">{p.packageId || "-"}</td>
                      <td className="p-3">
                        {p.usedAt
                          ? String(p.usedAt).slice(0, 19).replace("T", " ")
                          : "-"}
                      </td>
                    </tr>
                  ))}

                  {used.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-6 text-center text-black"
                      >
                        No used pins found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
