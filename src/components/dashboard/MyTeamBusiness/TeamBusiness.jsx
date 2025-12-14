import React from "react";

export default function TeamBusiness() {
  const incomes = [400, 100, 50, 50, 50, 50, 10, 10, 10, 10];

  return (
    <div className="p-6 bg-white text-black h-full">
      <h1 className="text-2xl font-semibold mb-4">
        Team Business Income
      </h1>

      <div className="overflow-auto rounded-xl border border-gray-300">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 bg-white">
              <th className="p-3 border-r font-semibold text-left">Level</th>
              <th className="p-3 border-r font-semibold text-left">Income</th>
              <th className="p-3 border-r font-semibold text-left">Team</th>
              <th className="p-3 border-r font-semibold text-left">Business</th>
              <th className="p-3 font-semibold text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {[1,2,3,4,5,6,7,8,9,10].map((level, index) => (
              <tr
                key={level}
                className="border-b border-gray-200 hover:bg-gray-100 transition"
              >
                <td className="p-3 border-r font-medium">
                  Level {level}
                </td>

                <td className="p-3 border-r font-medium">
                  ₹ {incomes[index]}
                </td>

                <td className="p-3 border-r">0</td>
                <td className="p-3 border-r">0</td>

                <td className="p-3 text-center">
                  <button
                    className="px-4 py-1.5 border border-black rounded-full text-xs font-medium hover:bg-black hover:text-white transition"
                    onClick={() => alert(`View details for level ${level}`)}
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
