// src/components/RankRewardBusiness.jsx
import React from "react";

export default function RankRewardBusiness() {
  const levels = [1, 2, 3, 4, 5];
  const income = [500, 1000, 10000, 100000, 1000000];
  const team = [10, 100, 1000, 10000, 100000];

  return (
    <div className="p-6 bg-white text-black">
      <h1 className="text-2xl font-semibold mb-5">
        Rank Reward Business Income
      </h1>

      <div className="overflow-auto rounded-xl border border-gray-300">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 bg-white">
              <th className="p-3 border-r font-semibold text-left">Level</th>
              <th className="p-3 border-r font-semibold text-left">Income</th>
              <th className="p-3 border-r font-semibold text-left">
                Team (New)
              </th>
              <th className="p-3 border-r font-semibold text-left">
                Team (Old)
              </th>
              <th className="p-3 font-semibold text-left">Business</th>
            </tr>
          </thead>

          <tbody>
            {levels.map((lvl, index) => (
              <tr
                key={lvl}
                className="border-b border-gray-200 hover:bg-gray-100 transition"
              >
                <td className="p-3 border-r font-medium">
                  Level {lvl}
                </td>

                <td className="p-3 border-r font-medium">
                  ₹ {income[index]}
                </td>

                <td className="p-3 border-r">
                  {team[index]}
                </td>

                <td className="p-3 border-r">0</td>

                <td className="p-3">0</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
