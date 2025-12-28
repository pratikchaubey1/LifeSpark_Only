import React, { useState, useEffect } from "react";
import { FiAward, FiUsers, FiStar, FiGift, FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import config from "../../../config/config";

const API_BASE = config.apiUrl;

export default function RankRewardBusiness({ sidebarOpen, onMenuOpen }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/rewards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(data.progress || []);
      }
    } catch (err) {
      console.error("Error fetching rewards", err);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-white max-w-6xl mx-auto p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
              <FiAward size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Rank & Reward Income
            </h1>
          </div>
          <button
            onClick={fetchRewards}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition active:scale-90"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-auto rounded-2xl border border-slate-300 shadow">
          <table className="w-full text-sm md:text-base">

            {/* TABLE HEADER */}
            <thead>
              <tr className="bg-[#d47300] text-white">
                <th className="p-4 text-left font-semibold w-[60px]">S.N</th>
                <th className="p-4 text-left font-semibold">
                  <div className="flex items-center gap-2"><FiStar size={16} /> Level</div>
                </th>
                <th className="p-4 text-left font-semibold">
                  <div className="flex items-center gap-2"><FiUsers size={16} /> Target</div>
                </th>
                <th className="p-4 text-left font-semibold">
                  Current
                </th>
                <th className="p-4 text-left font-semibold">
                  <div className="flex items-center gap-2"><FiGift size={16} /> Reward</div>
                </th>
                <th className="p-4 text-left font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {(progress.length > 0 ? progress : Array(10).fill({})).map((r, idx) => {
                const level = r.level || (idx + 1);
                const target = r.target || 0;
                const current = r.currentCount || 0;
                const reward = r.reward || "-";
                const isCompleted = current >= target && target > 0;
                const status = r.status || "none";

                return (
                  <tr
                    key={level}
                    className="border-b hover:bg-orange-50 transition"
                  >
                    <td className="p-4 font-semibold text-slate-700">{idx + 1}</td>

                    <td className="p-4 font-medium text-slate-800">
                      <div className="flex items-center gap-3">
                        <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {level}
                        </span>
                        LEVEL {level}
                      </div>
                    </td>

                    <td className="p-4 text-slate-700 font-medium">
                      {target.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className={`font-bold ${isCompleted ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {current.toLocaleString("en-IN")}
                        </div>
                        {!isCompleted && target > 0 && (
                          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-400 rounded-full"
                              style={{ width: `${Math.min(100, (current / target) * 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-slate-800 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiGift className="text-[#d47300]" /> {reward}
                      </div>
                    </td>

                    <td className="p-4">
                      {status === 'given' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                          <FiCheckCircle size={14} /> Received
                        </div>
                      ) : isCompleted ? (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse">
                          Completed
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          In Progress
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
            <h4 className="text-blue-800 font-bold text-sm mb-1">How it works?</h4>
            <p className="text-blue-600 text-xs leading-relaxed">
              Level 1 counting starts with your direct sponsors. Level 2 starts with your sponsor's direct sponsors and so on. Reach targets to unlock rewards!
            </p>
          </div>
          <div className="flex-1 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
            <h4 className="text-amber-800 font-bold text-sm mb-1">Important Note</h4>
            <p className="text-amber-600 text-xs leading-relaxed">
              *Rewards are manually verified and processed by the administration. Status will change to "Received" once processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
