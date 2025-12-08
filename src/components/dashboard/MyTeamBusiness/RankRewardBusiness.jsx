// src/components/RankRewardBusiness.jsx
import React from "react";

export default function RankRewardBusiness() {
  const levels = [1, 2, 3, 4, 5];
  const income = [500, 1000, 10000, 100000, 1000000];
  const team = [10, 100, 1000, 10000, 100000]; // NEW TEAM COLUMN VALUES

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Rank Reward Business Income</h1>

      <div className="overflow-auto rounded-xl shadow-lg border border-gray-400">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-blue-700 text-white">
            <tr className="border-b-2 border-gray-300">
              <th className="p-3 border-r-2">Level</th>
              <th className="p-3 border-r-2">Income</th>
              <th className="p-3 border-r-2">Team</th>     {/* NEW TEAM */}
              <th className="p-3 border-r-2">Team</th>     {/* OLD TEAM */}
              <th className="p-3 border-r-2">Business</th>
            </tr>
          </thead>

          <tbody>
            {levels.map((lvl, index) => (
              <tr key={lvl} className="border-b border-gray-300">
                <td className="p-3 border-r-2 font-semibold">{lvl}</td>
                <td className="p-3 border-r-2">{income[index]}</td>
                <td className="p-3 border-r-2">{team[index]}</td> {/* NEW TEAM */}
                <td className="p-3 border-r-2">0</td>             {/* OLD TEAM */}
                <td className="p-3 border-r-2">0</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
