import React from "react";

export default function RankRewardBusiness() {
  // Reward Income (as per provided chart)
  const rows = [
    { level: 1, team: 10, reward: "Silver coin" },
    { level: 2, team: 100, reward: "Mobile" },
    { level: 3, team: 500, reward: "Tab" },
    { level: 4, team: 1000, reward: "Laptop" },
    { level: 5, team: 10000, reward: "Bike" },
    { level: 6, team: 25000, reward: "2 Lakh" },
    { level: 7, team: 60000, reward: "ALTO" },
    { level: 8, team: 150000, reward: "SWIFT" },
    { level: 9, team: 350000, reward: "SCORPIO" },
    { level: 10, team: 1000000, reward: "BUNGALOW" },
  ];

  return (
    <div className="p-6 bg-white text-black">
      <h1 className="text-2xl font-semibold mb-5">Reward Income</h1>

      <div className="overflow-auto rounded-xl border border-gray-300">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 bg-white">
              <th className="p-3 border-r font-semibold text-left">S.N</th>
              <th className="p-3 border-r font-semibold text-left">Level</th>
              <th className="p-3 border-r font-semibold text-left">Team</th>
              <th className="p-3 font-semibold text-left">Reward</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.level} className="border-b border-gray-200 hover:bg-gray-100 transition">
                <td className="p-3 border-r">{idx + 1}</td>
                <td className="p-3 border-r font-medium">LEVEL {r.level}</td>
                <td className="p-3 border-r">{r.team.toLocaleString("en-IN")}</td>
                <td className="p-3">{r.reward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
