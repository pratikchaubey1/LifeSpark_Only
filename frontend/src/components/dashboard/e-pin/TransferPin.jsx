import React, { useEffect, useState } from "react";
import config from "../../../config/config";

const API_BASE = config.apiUrl;

export default function TransferPin({ onMenuOpen }) {
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
      const res = await fetch(`${API_BASE}/epins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load E-Pins");

      setEpins(Array.isArray(data.epins) ? data.epins : []);
    } catch (e) {
      setMsg(e.message || "Failed to load E-Pins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex justify-center px-4 py-8">
      {/* MAIN CARD */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-6 border border-slate-200 relative">
        {/* ⭐ MENU BUTTON INSIDE CARD (TOP LEFT) */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>


        {/* HEADER */}
        <div className="flex items-start justify-between mt-12">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">My E-Pins</h2>
            <p className="text-sm text-slate-500 mt-1">
              Available Pins:{" "}
              <span className="font-semibold text-slate-900">
                {epins.length}
              </span>
            </p>
          </div>

          <button
            onClick={load}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm shadow hover:bg-slate-700 active:scale-95 transition"
          >
            Refresh
          </button>
        </div>

        {/* MESSAGE */}
        {msg && (
          <div className="mt-4 mb-4 p-3 rounded-xl border bg-slate-50 text-sm text-slate-700 shadow-inner">
            {msg}
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div className="text-sm text-slate-500 animate-pulse mt-4">
            Loading e-pins...
          </div>
        ) : epins.length === 0 ? (
          <div className="border border-dashed rounded-2xl p-10 text-center text-slate-500 bg-slate-50 mt-4">
            No E-Pins assigned yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mt-6">
            {epins.map((p, index) => (
              <div
                key={p.code}
                className="relative bg-white border border-slate-300 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-400 transition group"
              >
                {/* Number badge */}
                <div className="absolute -top-2 -left-2 h-7 w-7 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shadow">
                  {index + 1}
                </div>

                <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                  E-Pin Code
                </div>

                <div className="font-mono text-sm truncate text-slate-800">
                  {p.code}
                </div>

                {/* Accent underline */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
