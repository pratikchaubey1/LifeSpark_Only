import React from "react";

export default function TeamBusiness() {
  // Autopool Package (as per provided chart)
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
    <div className="p-6 bg-white text-black">
      <h1 className="text-2xl font-semibold mb-4">Autopool Package</h1>
      <div className="text-xs text-slate-500 mb-4">Package Only 3000 Rs</div>

      <div className="overflow-auto rounded-xl border border-gray-300">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 bg-white">
              <th className="p-3 border-r font-semibold text-left">S.N</th>
              <th className="p-3 border-r font-semibold text-left">Level</th>
              <th className="p-3 border-r font-semibold text-left">Team</th>
              <th className="p-3 font-semibold text-left">Pool Income</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.level} className="border-b border-gray-200 hover:bg-gray-100 transition">
                <td className="p-3 border-r">{idx + 1}</td>
                <td className="p-3 border-r font-medium">LEVEL {r.level}</td>
                <td className="p-3 border-r">{r.team.toLocaleString("en-IN")}</td>
                <td className="p-3">₹ {r.poolIncome.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
