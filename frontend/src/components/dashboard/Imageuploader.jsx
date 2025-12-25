import React, { useState } from "react";
import config from "../../config/config";

const API_BASE = config.apiUrl;

export default function KycTextForm({ onMenuOpen }) {
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarAddress, setAadhaarAddress] = useState("");
  const [issuedState, setIssuedState] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setMsg("");

    if (!pan || !aadhaar || !aadhaarAddress || !issuedState) {
      return setMsg("Please fill all fields.");
    }

    const token = localStorage.getItem("token");
    if (!token) return setMsg("Please login again.");

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/kyc-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pan,
          aadhaar,
          aadhaarAddress,
          issuedState,
        }),
      });

      const data = await res.json();

      if (!res.ok) return setMsg(data.message || "KYC submission failed");

      setMsg("KYC Submitted Successfully!");
    } catch (err) {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /** Dark Back Input Style */
  const inputBase =
    "w-full p-3 mt-1 rounded-xl bg-slate-200 border border-slate-400 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white shadow-xl border border-slate-300 rounded-2xl p-6 sm:p-8 space-y-10">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => onMenuOpen?.()}
            className="p-2 rounded-xl bg-slate-300 hover:bg-slate-400 active:scale-95 transition"
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

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">KYC Details</h1>
        </div>

        {msg && (
          <div className="p-3 rounded-xl bg-slate-200 border border-slate-400 text-sm text-slate-800">
            {msg}
          </div>
        )}

        {/* FORM */}
        <div className="space-y-6">

          {/* PAN */}
          <div>
            <label className="text-sm font-semibold text-slate-800">PAN Number</label>
            <input
              className={inputBase}
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              placeholder="Enter PAN Number"
            />
          </div>

          {/* Aadhaar */}
          <div>
            <label className="text-sm font-semibold text-slate-800">Aadhaar Number</label>
            <input
              className={inputBase}
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              placeholder="Enter Aadhaar Number"
            />
          </div>

          {/* Aadhaar Address */}
          <div>
            <label className="text-sm font-semibold text-slate-800">Aadhaar Address</label>
            <textarea
              className={inputBase}
              value={aadhaarAddress}
              onChange={(e) => setAadhaarAddress(e.target.value)}
              placeholder="Enter Aadhaar Address"
              rows={3}
            ></textarea>
          </div>

          {/* Issued State */}
          <div>
            <label className="text-sm font-semibold text-slate-800">Issued State</label>
            <input
              className={inputBase}
              value={issuedState}
              onChange={(e) => setIssuedState(e.target.value)}
              placeholder="Enter Issued State"
            />
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>

          <button className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:scale-95 transition">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
