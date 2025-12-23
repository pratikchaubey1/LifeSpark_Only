import React from "react";
import { FiAward, FiUsers, FiStar, FiGift } from "react-icons/fi";

export default function RankRewardBusiness({ sidebarOpen, onMenuOpen }) {
  const rows = [
    { level: 1, team: 10, reward: "Silver Coin" },
    { level: 2, team: 100, reward: "Mobile" },
    { level: 3, team: 500, reward: "Tablet" },
    { level: 4, team: 1000, reward: "Laptop" },
    { level: 5, team: 10000, reward: "Bike" },
    { level: 6, team: 25000, reward: "₹2,00,000 Cash" },
    { level: 7, team: 60000, reward: "Alto Car" },
    { level: 8, team: 150000, reward: "Swift Car" },
    { level: 9, team: 350000, reward: "Scorpio Car" },
    { level: 10, team: 1000000, reward: "Luxury Bungalow" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-4 md:p-6">

      {/* MENU BUTTON */}
      {!sidebarOpen && (
        <button
          onClick={() => onMenuOpen?.()}
          className="mb-5 p-2 rounded-lg bg-white shadow hover:bg-slate-100 active:scale-95 transition inline-flex border border-slate-300"
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
      <div className="bg-white max-w-5xl mx-auto p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
            <FiAward size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            Rank & Reward Income
          </h1>
        </div>

        {/* TABLE */}
        <div className="overflow-auto rounded-2xl border border-slate-300 shadow">
          <table className="w-full text-sm md:text-base">

            {/* TABLE HEADER → EXACT MATCH */}
            <thead>
              <tr className="bg-[#d47300] text-white">
                <th className="p-4 text-left font-semibold w-[80px]">S.N</th>

                <th className="p-4 text-left">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm">
                      <FiStar size={16} /> Level
                    </div>
                  </div>
                </th>

                <th className="p-4 text-left">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm">
                      <FiUsers size={16} /> Team Size
                    </div>
                  </div>
                </th>

                <th className="p-4 text-left">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm">
                      <FiGift size={16} /> Reward
                    </div>
                  </div>
                </th>
              </tr>
            </thead>

            {/* BODY → EXACT LOOK */}
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.level}
                  className="border-b hover:bg-orange-50 transition"
                >
                  {/* S.N */}
                  <td className="p-4 font-semibold text-slate-700">
                    {idx + 1}
                  </td>

                  {/* LEVEL */}
                  <td className="p-4 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="h-7 w-7 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">
                        {r.level}
                      </span>
                      LEVEL {r.level}
                    </div>
                  </td>

                  {/* TEAM */}
                  <td className="p-4 text-slate-700 font-medium">
                    {r.team.toLocaleString("en-IN")}
                  </td>

                  {/* REWARD */}
                  <td className="p-4 text-slate-800 font-medium flex items-center gap-2">
                    <FiGift className="text-[#d47300]" /> {r.reward}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          *Rewards are credited automatically after meeting rank requirements.
        </p>
      </div>
    </div>
  );
}
