// src/components/ActivateID.jsx
import React, { useState } from "react";

export default function ActivateID({ compact = false }) {
  // compact prop reduces paddings if you want the side panel tighter
  const [epin, setEpin] = useState("");
  const [pkg, setPkg] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pkg) return setMsg("Please select a package.");
    if (!epin) return setMsg("Please enter E-Pin.");
    setMsg(`Activated Successfully! Package: ${pkg}, Epin: ${epin}`);
  };

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${compact ? "p-4" : "p-8"}`}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">Member Activate</h1>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-medium mb-3">E-Pin Activation</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Package</label>
              <select
                value={pkg}
                onChange={(e) => {
                  setPkg(e.target.value);
                  setMsg("");
                }}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">-- Select Package --</option>
                <option value="Basic">Basic – ₹499</option>
                <option value="Standard">Standard – ₹999</option>
                <option value="Premium">Premium – ₹1999</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-Pin</label>
              <input
                type="text"
                value={epin}
                onChange={(e) => {
                  setEpin(e.target.value);
                  setMsg("");
                }}
                placeholder="Enter E-Pin"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {msg && (
              <p
                className={`text-sm font-medium ${
                  msg.startsWith("Activated") ? "text-green-600" : "text-red-600"
                }`}
              >
                {msg}
              </p>
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
            >
              Activate Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
