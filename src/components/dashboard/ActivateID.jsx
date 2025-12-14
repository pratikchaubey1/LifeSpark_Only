// src/components/ActivateID.jsx
import React, { useState } from "react";
import { FiZap, FiKey, FiCheckCircle } from "react-icons/fi";

export default function ActivateID({ compact = false }) {
  const [epin, setEpin] = useState("");
  const [pkg, setPkg] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!pkg) return setMsg("Please select a package.");
    if (!epin) return setMsg("Please enter E-Pin.");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return setMsg("Please login again to activate your ID.");
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/dashboard/activate-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ epin, packageId: pkg }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setMsg(data.message || "Activation failed. Please check your E-Pin.");
      }

      setMsg(data.message || `Activated Successfully! Package: ${pkg}, E-Pin: ${epin}`);
      setEpin("");
    } catch (err) {
      console.error("Activation error", err);
      setMsg("Something went wrong while activating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerPadding = compact
    ? "px-3 py-4"
    : "px-3 sm:px-4 py-6 sm:py-8";

  const packages = [
    { id: "Basic", label: "Basic", price: "₹499", desc: "Starter benefits" },
    { id: "Standard", label: "Standard", price: "₹999", desc: "Better rewards" },
    { id: "Premium", label: "Premium", price: "₹1999", desc: "Maximum benefits" },
  ];

  return (
    <div
      className={`w-full min-h-screen bg-slate-100 flex items-start sm:items-center justify-center ${containerPadding}`}
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-slate-100 p-5 sm:p-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <FiZap size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
              Member Activate
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Choose a package and use your E-Pin to activate your account.
            </p>
          </div>
        </div>

        {/* Card Content */}
        <div className="bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-100">
          <h2 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <FiKey className="text-indigo-500" />
            E-Pin Activation
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Package Selection (cards) */}
            <div>
              <p className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Select Package
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages.map((item) => {
                  const isActive = pkg === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPkg(item.id);
                        setMsg("");
                      }}
                      className={`flex flex-col items-start justify-between rounded-xl border px-3 py-2.5 text-left text-xs sm:text-sm transition ${
                        isActive
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-semibold flex items-center gap-1.5">
                        {item.label}
                        {isActive && (
                          <FiCheckCircle className="text-emerald-500" size={14} />
                        )}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-500 mt-1">
                        {item.price} • {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* E-Pin Input */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                E-Pin
              </label>
              <div className="relative">
                <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={epin}
                  onChange={(e) => {
                    setEpin(e.target.value);
                    setMsg("");
                  }}
                  placeholder="Enter E-Pin"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Use the valid E-Pin provided to you by the company.
              </p>
            </div>

            {/* Message */}
            {msg && (
              <p
                className={`text-xs sm:text-sm font-medium rounded-lg px-3 py-2 ${
                  msg.startsWith("Activated")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-red-50 text-red-600 border border-red-100"
                }`}
              >
                {msg}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Activating..." : "Activate Now"}
            </button>

            <p className="text-[10px] sm:text-[11px] text-slate-400 text-center">
              Note: Once activated, the selected package cannot be changed.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
