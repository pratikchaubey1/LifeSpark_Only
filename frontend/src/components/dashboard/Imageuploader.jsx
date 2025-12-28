import React, { useState, useEffect } from "react";
import config from "../../config/config";

const API_BASE = config.apiUrl;

export default function KycTextForm({ onMenuOpen }) {
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarAddress, setAadhaarAddress] = useState("");
  const [issuedState, setIssuedState] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loadingKyc, setLoadingKyc] = useState(true);
  const [existingKyc, setExistingKyc] = useState(null);

  useEffect(() => {
    fetchExistingKyc();
  }, []);

  const fetchExistingKyc = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingKyc(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/kyc`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.kyc) {
        setExistingKyc(data.kyc);
      }
    } catch (err) {
      console.error("Error fetching KYC", err);
    } finally {
      setLoadingKyc(false);
    }
  };

  const handleSubmit = async () => {
    setMsg("");

    if (!pan || !aadhaar || !aadhaarAddress || !issuedState) {
      return setMsg("Please fill all fields.");
    }

    const token = localStorage.getItem("token");
    if (!token) return setMsg("Please login again.");

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/kyc/text`, {
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
      if (data.kyc) setExistingKyc(data.kyc);
    } catch (err) {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /** Dark Back Input Style */
  const inputBase =
    "w-full p-3 mt-1 rounded-xl bg-slate-200 border border-slate-400 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500";

  if (loadingKyc) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 flex justify-center items-center">
        <div className="p-8 bg-white rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600 font-medium">Checking KYC status...</div>
        </div>
      </div>
    );
  }

  const isSubmitted = existingKyc && existingKyc.panNo;

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
          <div className={`p-4 rounded-xl border text-sm ${msg.includes("Successfully") ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            {msg}
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-emerald-900">Submitted Successfully</div>
                <div className="text-xs text-emerald-700 uppercase tracking-wider font-semibold">Status: {existingKyc.status || 'Pending'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <DetailItem label="PAN Number" value={existingKyc.panNo} />
              <DetailItem label="Aadhaar Number" value={existingKyc.aadhaarNo} />
              <DetailItem label="Issued State" value={existingKyc.issuedState} />
              <div className="md:col-span-2">
                <DetailItem label="Aadhaar Address" value={existingKyc.aadhaarAddress} />
              </div>
            </div>

            {existingKyc.remarks && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-xs font-bold text-amber-800 uppercase mb-1">Admin Remarks</div>
                <div className="text-sm text-amber-700">{existingKyc.remarks}</div>
              </div>
            )}

            {existingKyc.status === 'rejected' && (
              <div className="pt-4">
                <button
                  onClick={() => setExistingKyc(null)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition active:scale-95"
                >
                  Edit & Re-submit
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* FORM */}
            <div className="space-y-6">

              {/* PAN */}
              <div>
                <label className="text-sm font-semibold text-slate-800">PAN Number</label>
                <input
                  className={inputBase}
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
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

              <button
                onClick={() => onMenuOpen?.()}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:scale-95 transition"
              >
                Cancel
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-slate-800 font-semibold">{value || 'N/A'}</div>
    </div>
  );
}
