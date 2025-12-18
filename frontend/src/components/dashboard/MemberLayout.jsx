import React, { useState, useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashBoardPage from "./DashBoardPage";

export default function MemberLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hideButtons, setHideButtons] = useState(false); // 👈 NEW (Scroll hide)

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // 👇 Scroll logic — hide buttons when scrolling down
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // scrolling down
        setHideButtons(true);
      } else {
        // scrolling up
        setHideButtons(false);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />

      {/* ---- TOP RIGHT BUTTONS ---- */}
      <div
        className={`fixed top-3 right-4 z-50 flex gap-2 transition-all duration-300 
          ${hideButtons || sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
      >
        {/* Dashboard Button */}
        {isLoggedIn && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700"
          >
            Dashboard
          </button>
        )}

        {/* Logout Button */}
        {isLoggedIn && !sidebarOpen && (
          <button
            onClick={onLogout}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>

      {/* MAIN DASHBOARD PAGE */}
      <div className="p-3 pt-16">
        <DashBoardPage />
      </div>
    </div>
  );
}
