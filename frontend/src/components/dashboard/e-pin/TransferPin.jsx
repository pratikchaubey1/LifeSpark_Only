import React, { useEffect, useState } from "react";

import config from "../../../config/config";

const API_BASE = config.apiUrl;

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
    <div className="w-full min-h-[60vh] bg-white text-black flex justify-center p-6">
      <div className="w-full max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              My E-Pins
            </h2>
            <p className="text-sm text-gray-500">
              Available Pins:{" "}
              <span className="font-semibold text-black">
                {epins.length}
              </span>
            </p>
          </div>

          <button
            onClick={load}
            className="border border-black px-4 py-2 rounded-full text-sm font-medium hover:bg-black hover:text-white transition"
          >
            Refresh
          </button>
        </div>

        {/* Message */}
        {msg && (
          <div className="border border-black rounded-xl px-4 py-2 text-sm">
            {msg}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-sm text-gray-500 animate-pulse">
            Loading e-pins...
          </div>
        ) : epins.length === 0 ? (
          <div className="border border-dashed rounded-xl p-10 text-center text-gray-500">
            No E-Pins assigned yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {epins.map((p, index) => (
              <div
                key={p.code}
                className="group relative border border-gray-300 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Number badge */}
                <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-semibold">
                  {index + 1}
                </div>

                <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                  ePin Code
                </div>

                <div className="font-mono text-sm truncate">
                  {p.code}
                </div>

                {/* hover accent */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransferPin;
