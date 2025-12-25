import React from "react";
import { FiStar, FiTrendingUp, FiArrowUpRight } from "react-icons/fi";

export default function FreedomBusiness({ sidebarOpen, onMenuOpen }) {
  const rows = [
    { level: 1, income: 10000, upgrade: 1000 },
    { level: 2, income: 20000, upgrade: 2000 },
    { level: 3, income: 30000, upgrade: 3000 },
    { level: 4, income: 40000, upgrade: 4000 },
    { level: 5, income: 50000, upgrade: 5000 },
    { level: 6, income: 60000, upgrade: 6000 },
    { level: 7, income: 70000, upgrade: 7000 },
    { level: 8, income: 80000, upgrade: 8000 },
    { level: 9, income: 90000, upgrade: 9000 },
    { level: 10, income: 100000, upgrade: 10000 },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-4">

      {/* ===== MENU BUTTON ===== */}
      {!sidebarOpen && (
        <button
          onClick={() => onMenuOpen?.()}
          className="mb-5 p-2 rounded-lg bg-white shadow-md hover:bg-slate-100 active:scale-95 transition inline-flex border border-slate-300"
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

      {/* ===== MAIN CARD ===== */}
      <div className="mx-auto max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">

        {/* Top Heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow">
            <FiTrendingUp size={24} />
          </div>

          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Upgrade Income Chart
          </h1>
        </div>

        {/* Table */}
        <div className="overflow-auto rounded-xl border border-slate-300 shadow">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">S.N</th>
                <th className="p-3 text-left flex items-center gap-1">
                  <FiStar /> Level
                </th>
                <th className="p-3 text-left">Income</th>
                <th className="p-3 text-left flex items-center gap-1">
                  <FiArrowUpRight /> Upgrade
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.level}
                  className="border-b hover:bg-indigo-50/70 transition cursor-pointer"
                >
                  <td className="p-3 font-semibold text-slate-700">
                    {idx + 1}
                  </td>

                  <td className="p-3 font-semibold text-indigo-700 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">
                      {r.level}
                    </span>
                    LEVEL {r.level}
                  </td>

                  <td className="p-3 text-slate-700 font-medium">
                    ₹ {r.income.toLocaleString("en-IN")}
                  </td>

                  <td className="p-3 text-slate-700 font-medium">
                    ₹ {r.upgrade.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-slate-500 mt-4">
          *Upgrade income is credited automatically as per company policy.
        </p>
      </div>
    </div>
  );
}
