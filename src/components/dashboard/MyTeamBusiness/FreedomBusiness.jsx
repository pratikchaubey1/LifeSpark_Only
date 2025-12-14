// src/components/FreedomBusiness.jsx
import React from "react";
import { TrendingUp, Users, Briefcase } from "lucide-react";

export default function FreedomBusiness() {
  const rows = [
    { level: 1, income: 30 },
    { level: 2, income: 60 },
    { level: 3, income: 120 },
    { level: 4, income: 240 },
    { level: 5, income: 480 },
    { level: 6, income: 960 },
    { level: 7, income: 1920 },
    { level: 8, income: 3840 },
    { level: 9, income: 7680 },
    { level: 10, income: 15360 },
  ];

  return (
    <div className="p-6 bg-white text-black">
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="text-black" />
        <h2 className="text-2xl font-semibold">
          Freedom Business Income
        </h2>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-white">
              <th className="px-4 py-3 text-left font-semibold">Level</th>
              <th className="px-4 py-3 text-left font-semibold">Income</th>
              <th className="px-4 py-3 text-left font-semibold flex items-center gap-1">
                <Users size={14} /> Team
              </th>
              <th className="px-4 py-3 text-left font-semibold flex items-center gap-1">
                <Briefcase size={14} /> Business
              </th>
              <th className="px-4 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr
                key={r.level}
                className="border-b last:border-none hover:bg-gray-100 transition"
              >
                <td className="px-4 py-3">Level {r.level}</td>

                <td className="px-4 py-3 font-medium">
                  ₹ {r.income}
                </td>

                <td className="px-4 py-3">
                  <div className="h-2 w-20 bg-gray-200 rounded-full">
                    <div className="h-full w-[10%] bg-black rounded-full" />
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="h-2 w-24 bg-gray-200 rounded-full">
                    <div className="h-full w-[15%] bg-black rounded-full" />
                  </div>
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => alert(`View details for level ${r.level}`)}
                    className="px-4 py-1.5 border border-black rounded-full text-xs font-medium hover:bg-black hover:text-white transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
