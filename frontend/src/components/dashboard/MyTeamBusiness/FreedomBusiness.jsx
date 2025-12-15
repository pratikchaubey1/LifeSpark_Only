import React from "react";

export default function FreedomBusiness() {
  // Upgrade Income (as per provided chart)
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
    <div className="p-6 bg-white text-black">
      <h1 className="text-2xl font-semibold mb-5">Upgrade Income</h1>

      <div className="overflow-auto rounded-xl border border-gray-300">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 bg-white">
              <th className="p-3 border-r font-semibold text-left">S.N</th>
              <th className="p-3 border-r font-semibold text-left">Level</th>
              <th className="p-3 border-r font-semibold text-left">Income</th>
              <th className="p-3 font-semibold text-left">Upgrade</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.level} className="border-b border-gray-200 hover:bg-gray-100 transition">
                <td className="p-3 border-r">{idx + 1}</td>
                <td className="p-3 border-r font-medium">LEVEL {r.level}</td>
                <td className="p-3 border-r">₹ {r.income.toLocaleString("en-IN")}</td>
                <td className="p-3">₹ {r.upgrade.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
