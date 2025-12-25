import React from "react";

const TotalInactiveUser = ({ onMenuOpen, sidebarOpen }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-8 flex justify-center">

      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-6 md:p-10 border border-slate-200">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-3">

          {/* LEFT → Menu + Title */}
          <div className="flex items-center gap-3">

            {/* MENU BUTTON */}
            <button
              onClick={() => onMenuOpen?.()}
              className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 transition mr-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Direct Inactive Users
            </h1>
          </div>
        </div>

        {/* EMPTY STATE CARD */}
        <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">

          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486802.png"
            alt="No Data"
            className="w-32 h-32 opacity-80 mb-4"
          />

          <h2 className="text-xl font-semibold text-red-700 mb-2">
            No Inactive Records Found
          </h2>

          <p className="text-red-600 text-sm md:text-base max-w-md">
            Currently all your direct members are active.<br />
            Once a member becomes inactive, their details will appear here.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TotalInactiveUser;
