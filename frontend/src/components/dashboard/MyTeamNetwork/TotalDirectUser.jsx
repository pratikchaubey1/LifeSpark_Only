import React, { useEffect, useState } from "react";
import config from "../../../config/config";

const TotalDirectUser = ({ onMenuOpen, sidebarOpen }) => {
  const [directUsers, setDirectUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${config.apiUrl}/dashboard/direct-team`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setDirectUsers(data);
        }
      } catch (error) {
        console.error("Failed to fetch direct team", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] p-5 md:p-10">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">

        {/* MENU BUTTON */}
        <button
          onClick={() => onMenuOpen?.()}
          className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 transition"
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

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            My Direct Team
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Your directly referred users list
          </p>
        </div>
      </div>

      {/* CARD WRAPPER */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 md:p-6">

        {/* TABLE HEADER */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 px-2 py-3 bg-slate-100 text-slate-600 rounded-lg font-medium text-sm md:text-base">
          <span>Name</span>
          <span>User ID</span>
          <span>Status</span>
          <span className="hidden md:block">Joining Date</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-10 text-center text-slate-500">Loading team...</div>
        )}

        {/* If No Records */}
        {!loading && directUsers.length === 0 && (
          <div className="w-full py-14 flex flex-col items-center justify-center text-gray-500">
            <img
              className="h-28 opacity-70 mb-4"
              src="https://cdn-icons-png.flaticon.com/512/4076/4076504.png"
              alt="no data"
            />
            <p className="text-lg md:text-xl font-medium">No Records Found...</p>
            <p className="text-sm text-gray-400 mt-1">
              You don't have any direct team members yet.
            </p>
          </div>
        )}

        {/* Records */}
        {!loading && directUsers.length > 0 &&
          directUsers.map((user, index) => (
            <div
              key={index}
              className="grid grid-cols-3 md:grid-cols-4 gap-4 px-3 py-4 border-b last:border-none hover:bg-slate-50 transition"
            >
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">{user.name}</span>
                <span className="text-xs text-slate-400 md:hidden">{user.joined}</span>
              </div>
              <span className="text-slate-600 text-sm font-mono truncate" title={user.userId}>{user.inviteCode}</span>

              <span
                className={`px-3 py-1 text-xs rounded-full w-fit h-fit ${user.status === "Active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {user.status}
              </span>

              <span className="hidden md:block text-slate-500 text-sm">
                {user.joined}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TotalDirectUser;
