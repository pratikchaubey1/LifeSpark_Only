import React, { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashBoardPage from "./DashBoardPage";

export default function MemberLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-slate-950 text-white">

      {/* LEFT SIDEBAR */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* RIGHT MAIN DASHBOARD PAGE */}
      <div className="flex-1 bg-white text-black overflow-y-auto">
        <DashBoardPage />
      </div>

      {/* TOP BUTTONS */}
      <div className="fixed top-3 right-4 z-50 flex gap-2">
        

        <button
          onClick={onLogout}
          className="px-3 py-1 rounded bg-red-600 text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
