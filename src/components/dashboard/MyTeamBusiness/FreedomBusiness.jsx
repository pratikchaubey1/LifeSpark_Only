// src/components/FreedomBusiness.jsx
import React from "react";

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
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Freedom Business Income</h2>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-2 py-2 border-r w-16">Level</th>
              <th className="px-2 py-2 border-r w-24">Income</th>
              <th className="px-2 py-2 border-r w-20">Team</th>
              <th className="px-2 py-2 border-r w-24">Business</th>
              <th className="px-2 py-2 w-16">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.level} className="text-gray-700">
                <td className="px-2 py-2 border-r">{r.level}</td>
                <td className="px-2 py-2 border-r">{r.income}</td>
                <td className="px-2 py-2 border-r">0</td>
                <td className="px-2 py-2 border-r">0</td>

                <td className="px-2 py-2">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => alert(`View details for level ${r.level}`)}
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
