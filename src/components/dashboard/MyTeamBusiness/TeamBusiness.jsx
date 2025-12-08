import React from "react";

export default function TeamBusiness() {
  const incomes = [400, 100, 50, 50, 50, 50, 10, 10, 10, 10];
  return (
    <div className="p-2 h-full">
      <h1 className="text-2xl font-bold mb-2">Team Business Income</h1>

      <div className="overflow-auto rounded-xl shadow-lg border">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-blue-500 text-white border-b-2 border-gray-300">
            <tr>
              <th className="p-3 border">Level</th>
              <th className="p-3 border">Income</th>
              <th className="p-3 border">Team</th>
              <th className="p-3 border">Business</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {[1,2,3,4,5,6,7,8,9,10].map((level, index) => (
              <tr key={level} className="border-b border-gray-300 hover:bg-gray-50 ">
                <td className="p-3 font-semibold border">{level}</td>
                <td className="p-3 border">{incomes[index]}</td>
                <td className="p-3 border">0</td>
                <td className="p-3 border">0</td>
                <td className="p-3 text-blue-600 cursor-pointer hover:underline">View</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
