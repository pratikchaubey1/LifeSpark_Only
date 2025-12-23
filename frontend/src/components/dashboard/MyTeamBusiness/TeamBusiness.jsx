import React from "react";
import { FiUsers, FiLayers, FiGift } from "react-icons/fi";

export default function TeamBusiness({ sidebarOpen, onMenuOpen }) {
  const rows = [
    { level: 1, team: 3, poolIncome: 3000 },
    { level: 2, team: 9, poolIncome: 6000 },
    { level: 3, team: 27, poolIncome: 9000 },
    { level: 4, team: 81, poolIncome: 12000 },
    { level: 5, team: 243, poolIncome: 15000 },
    { level: 6, team: 729, poolIncome: 18000 },
    { level: 7, team: 2187, poolIncome: 21000 },
    { level: 8, team: 6561, poolIncome: 24000 },
    { level: 9, team: 19683, poolIncome: 27000 },
    { level: 10, team: 59049, poolIncome: 30000 },
  ];

  return (
    <div className="min-h-screen bg-[#f3f6fb] p-4 md:p-8">

      {/* ===== MENU BUTTON ===== */}
      {!sidebarOpen && (
        <button
          onClick={() => onMenuOpen?.()}
          className="mb-5 p-2 rounded-lg bg-white shadow hover:bg-slate-100 active:scale-95 transition border"
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
      )}

      {/* MAIN CARD */}
      <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-[#e2e8f0] p-6 md:p-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-14 w-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow">
            <FiUsers size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Autopool Package
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Package Price: ₹3000
            </p>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="border rounded-2xl overflow-hidden shadow">

          {/* Orange Header */}
          <div className="bg-[#d47500] text-white grid grid-cols-3 md:grid-cols-4 gap-4 p-4 font-semibold text-sm">
            <span>S.N</span>

            <span className="flex items-center gap-2">
              <FiLayers /> Level
            </span>

            <span className="flex items-center gap-2">
              <FiUsers /> Team
            </span>

            <span className="hidden md:flex items-center gap-2">
              <FiGift /> Pool Income
            </span>
          </div>

          {/* Table Rows */}
          <div>
            {rows.map((r, i) => (
              <div
                key={r.level}
                className={`grid grid-cols-3 md:grid-cols-4 gap-4 p-4 border-b hover:bg-orange-50/50 transition ${
                  i % 2 === 2 ? "bg-orange-50/20" : ""
                }`}
              >
                {/* S.N */}
                <span className="font-semibold text-slate-700">{i + 1}</span>

                {/* Level */}
                <span className="font-semibold text-indigo-700 flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    {r.level}
                  </span>
                  LEVEL {r.level}
                </span>

                {/* Team */}
                <span className="text-slate-700 font-medium">
                  {r.team.toLocaleString("en-IN")}
                </span>

                {/* Pool Income */}
                <span className="hidden md:block text-slate-700 font-semibold">
                  ₹ {r.poolIncome.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
