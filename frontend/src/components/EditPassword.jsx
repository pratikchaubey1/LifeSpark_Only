import React, { useState } from "react";
import { FiLock, FiX, FiCheckCircle } from "react-icons/fi";

const ChangePassword = ({ setActiveSection }) => {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    if (passwords.newPassword.length < 6) {
      alert("❌ Password must be at least 6 characters!");
      return;
    }

    console.log("Updated Password:", passwords.newPassword);
    alert("✔ Password updated successfully!");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-3 sm:p-4 relative">
      {/* Close Button */}
      <button
        onClick={() => setActiveSection(null)}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 h-10 w-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-red-50 text-slate-600 hover:text-red-600 transition"
      >
        <FiX size={22} />
      </button>

      {/* Card */}
      <div className="w-full max-w-md bg-white p-5 sm:p-7 rounded-2xl shadow-lg border border-slate-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <FiLock size={22} />
          </div>
          <div>
            <h1 className="font-semibold text-lg sm:text-xl text-slate-900">
              Change Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Create a strong password to keep your account secure.
            </p>
          </div>
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            New Password
          </label>
          <div className="relative mt-1.5">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-5">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <div className="relative mt-1.5">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-[0.98] transition"
        >
          <FiCheckCircle size={18} />
          Update Password
        </button>

        {/* Helper Text */}
        <p className="mt-3 text-[11px] text-slate-400 text-center">
          Password must be at least 6 characters long.
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
