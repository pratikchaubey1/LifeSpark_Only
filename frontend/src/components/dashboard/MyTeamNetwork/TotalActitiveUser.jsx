import React from "react";

const TotalInactiveUser = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-6 md:p-10 border border-slate-200">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Direct Inactive Users
          </h1>
        </div>

        {/* EMPTY STATE CARD */}
        <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">

          {/* Illustration */}
          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486802.png"
            alt="No Data"
            className="w-32 h-32 opacity-80 mb-4"
          />

          {/* Title */}
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            No Inactive Records Found
          </h2>

          {/* Description */}
          <p className="text-red-600 text-sm md:text-base max-w-md">
            Currently all your direct members are active.  
            Once a member becomes inactive, their details will appear here.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TotalInactiveUser;
