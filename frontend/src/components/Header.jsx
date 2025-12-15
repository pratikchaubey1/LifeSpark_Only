// components/Header.jsx
import React, { useState } from "react";
import DashboardSidebar from "./dashboard/DashboardSidebar.jsx";
import DashBoardPage from "./dashboard/DashBoardPage.jsx";
// import DashboardSidebar from "./DashboardSidebar";

export default function Header({
  activeSection,
  mobileOpen,
  setMobileOpen,
  scrollToId,
  NAV_ITEMS,
  isAuthenticated,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // local state only for sidebar

  return (
    <>
      {/* Member sidebar like worldshopee */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLoginClick={() => {
          setSidebarOpen(false);
          onLoginClick && onLoginClick();
        }}
        onRegisterClick={() => {
          setSidebarOpen(false);
          onRegisterClick && onRegisterClick();
        }}
      >
        {/* Right side content: Dashboard page */}
        <DashBoardPage />
      </DashboardSidebar>

      <header className="fixed inset-x-0 top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20">
          {/* Left: dashboard hamburger + logo */}
          <div className="flex items-center gap-3">
            {/* 3-line button: opens sidebar */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
            >
              <span className="sr-only">Open member menu</span>
              <span className="space-y-1">
                <span className="block h-0.5 w-5 rounded bg-slate-900" />
                <span className="block h-0.5 w-5 rounded bg-slate-900" />
                <span className="block h-0.5 w-5 rounded bg-slate-900" />
              </span>
            </button>

            <div className="font-semibold tracking-tight text-slate-900">
              Life Spark Associates
            </div>
          </div>

          {/* Right: desktop nav + auth buttons + mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToId(item.id)}
                  className={`transition ${
                    activeSection === item.id
                      ? "text-sky-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop auth actions */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={onLogoutClick}
                  className="rounded-full px-4 py-2 text-xs font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50 transition"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={onRegisterClick}
                    className="rounded-full px-4 py-2 text-xs font-semibold border border-sky-300 text-sky-700 hover:bg-sky-50 transition"
                  >
                    Register
                  </button>
                  <button
                    onClick={onLoginClick}
                    className="rounded-full px-4 py-2 text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 transition"
                  >
                    Login
                  </button>
                </>
              )}
            </div>

            {/* Mobile nav toggle */}
            <button
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="sr-only">Toggle navigation</span>
              <div className="space-y-1">
                <span className="block h-0.5 w-5 rounded bg-slate-900" />
                <span className="block h-0.5 w-5 rounded bg-slate-900" />
                <span className="block h-0.5 w-5 rounded bg-slate-900" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur">
            <nav className="mx-auto max-w-6xl px-4 py-3 space-y-1 text-sm">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToId(item.id)}
                  className={`block w-full text-left rounded-md px-2 py-1.5 ${
                    activeSection === item.id
                      ? "bg-sky-50 text-sky-600"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-2 mt-2 border-t border-slate-200 flex items-center gap-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      onLogoutClick && onLogoutClick();
                    }}
                    className="flex-1 rounded-full px-4 py-2 text-xs font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50 transition"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        onRegisterClick && onRegisterClick();
                      }}
                      className="flex-1 rounded-full px-4 py-2 text-xs font-semibold border border-sky-300 text-sky-700 hover:bg-sky-50 transition"
                    >
                      Register
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        onLoginClick && onLoginClick();
                      }}
                      className="flex-1 rounded-full px-4 py-2 text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 transition"
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
