import React, { useState } from "react";
import config from "../../config/config";

const API_BASE = config.apiUrl;

export default function EditPassword({ onMenuOpen }) {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setMsg("");

    if (!newPass || !confirmPass) {
      return setMsg("Please enter both fields.");
    }

    if (newPass !== confirmPass) {
      return setMsg("Passwords do not match!");
    }

    const token = localStorage.getItem("token");
    if (!token) return setMsg("Please login again.");

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: newPass }),
      });

      const data = await res.json();
      if (!res.ok) return setMsg(data.message || "Failed to update password");

      setMsg("Password updated successfully!");
      setNewPass("");
      setConfirmPass("");
    } catch (err) {
      setMsg("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    "w-full p-3 mt-1 rounded-xl border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white shadow-xl border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-10">

        {/* HEADER */}
        <div className="flex justify-between items-center">

          {/* MENU BUTTON */}
          <button
            onClick={() => onMenuOpen?.()}
            className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 transition mr-2"
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

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Change Password</h1>
        </div>

        {/* MESSAGE */}
        {msg && (
          <div className="p-3 rounded-xl border bg-slate-50 text-sm text-slate-700">
            {msg}
          </div>
        )}

        {/* FORM */}
        <div className="space-y-6">

          <div>
            <label className="text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              type="password"
              className={inputBase}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              className={inputBase}
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Re-enter password"
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
            {submitting ? "Updating..." : "Update Password"}
          </button>

          <button className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:scale-95 transition">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
