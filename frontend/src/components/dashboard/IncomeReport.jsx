import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function IncomeReport({ sidebarOpen, onMenuOpen }) {
  const tabs = [
    "Level Income",
    "AutoPool Income",
    "Re-purchase Income",
    "Rank Reward",
  ];

  const [activeTab, setActiveTab] = useState("Level Income");

  const [loading, setLoading] = useState(false);
  const [levelData, setLevelData] = useState([]);
  const [autopoolData, setAutopoolData] = useState([]);
  const [repurchaseData, setRepurchaseData] = useState([]);
  const [rankData, setRankData] = useState([]);

  const fetchData = async (url, setter, fallback) => {
    try {
      setLoading(true);
      setter(fallback);
    } catch {
      setter(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Level Income") {
      fetchData("", setLevelData, [
        { level: "L1", users: 49, amount: 175.15 },
        { level: "L2", users: 16, amount: 2430.66 },
        { level: "L3", users: 25, amount: 794.62 },
        { level: "L4", users: 15, amount: 565.61 },
        { level: "L5", users: 33, amount: 159.24 },
        { level: "L6", users: 67, amount: 723.41 },
        { level: "L7", users: 36, amount: 1694.37 },
        { level: "L8", users: 73, amount: 1774.99 },
        { level: "L9", users: 1, amount: 2349.01 },
        { level: "L10", users: 27, amount: 1965.85 },
      ]);
    }

    if (activeTab === "AutoPool Income") {
      fetchData("", setAutopoolData, [
        { pool: "AutoPool A", entries: 12, amount: 1500 },
        { pool: "AutoPool B", entries: 5, amount: 4200 },
      ]);
    }

    if (activeTab === "Re-purchase Income") {
      fetchData("", setRepurchaseData, [
        { id: "RP-001", date: "2025-12-01", amount: 2499.0 },
        { id: "RP-002", date: "2025-12-05", amount: 1299.0 },
      ]);
    }

    if (activeTab === "Rank Reward") {
      fetchData("", setRankData, [
        { rank: "Bronze", amount: 500.0, date: "2025-11-28" },
        { rank: "Silver", amount: 1200.0, date: "2025-12-02" },
      ]);
    }
  }, [activeTab]);

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #ffffff, #d8ebff)",
      }}
    >

      {/* ===================== MENU BUTTON ===================== */}
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

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-slate-900">Income Report</h1>

      <p className="text-slate-700 mt-1 text-sm">
        Level, AutoPool, Re-purchase & Rank rewards — responsive and beautiful UI
      </p>

      {/* TABS */}
      <div className="flex flex-wrap gap-3 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition 
              ${
                activeTab === tab
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-slate-800 border-slate-400 hover:bg-slate-100"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && (
        <p className="mt-10 text-blue-600 animate-pulse text-lg">
          Loading…
        </p>
      )}

      {/* ================= LEVEL INCOME ================= */}
      {!loading && activeTab === "Level Income" && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">
            Level Income (10 Levels)
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {levelData.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {item.level}
                  </div>

                  <div>
                    <p className="text-slate-800">{item.users} users</p>
                    <p className="font-semibold text-blue-700">
                      ₹ {item.amount}
                    </p>
                  </div>
                </div>

                <span className="text-blue-500 cursor-pointer">View</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ================= AUTOPOOL INCOME ================= */}
      {!loading && activeTab === "AutoPool Income" && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">AutoPool Income</h2>

          <table className="min-w-full mt-5 bg-white border border-slate-300 rounded-xl overflow-hidden">
            <thead className="bg-blue-100 text-slate-800">
              <tr>
                <th className="px-4 py-3">Pool</th>
                <th className="px-4 py-3">Entries</th>
                <th className="px-4 py-3">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {autopoolData.map((row, i) => (
                <tr key={i} className="border-b hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-slate-800">{row.pool}</td>
                  <td className="px-4 py-3 text-slate-800">{row.entries}</td>
                  <td className="px-4 py-3 text-slate-800">₹ {row.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-slate-600 mt-4">
            This is frontend-only data.
          </p>
        </div>
      )}

      {/* ================= REPURCHASE INCOME ================= */}
      {!loading && activeTab === "Re-purchase Income" && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Re-purchase Income</h2>

          <table className="min-w-full mt-5 bg-white border border-slate-300 rounded-xl">
            <thead className="bg-blue-100 text-slate-800">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount (₹)</th>
              </tr>
            </thead>

            <tbody>
              {repurchaseData.map((row, i) => (
                <tr key={i} className="border-b hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-slate-800">{row.id}</td>
                  <td className="px-4 py-3 text-slate-800">{row.date}</td>
                  <td className="px-4 py-3 text-slate-800">₹ {row.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-slate-600 mt-4">Frontend-only data.</p>
        </div>
      )}

      {/* ================= RANK REWARD ================= */}
      {!loading && activeTab === "Rank Reward" && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Rank Rewards</h2>

          <table className="min-w-full mt-5 bg-white border border-slate-300 rounded-xl">
            <thead className="bg-blue-100 text-slate-800">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Reward (₹)</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {rankData.map((row, i) => (
                <tr key={i} className="border-b hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-slate-800">{row.rank}</td>
                  <td className="px-4 py-3 text-slate-800">₹ {row.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-800">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-slate-600 mt-4">Frontend-only data.</p>
        </div>
      )}
    </div>
  );
}
