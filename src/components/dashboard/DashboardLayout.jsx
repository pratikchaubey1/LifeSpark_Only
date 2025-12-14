// DashboardLayout.jsx
import React, { useState } from "react";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "activeId", label: "Active ID" },
  { id: "epin", label: "E-Pin" },
  { id: "teamNetwork", label: "Team Network" },
  { id: "incomeReport", label: "Income Report" },
  { id: "support", label: "Support" },
  { id: "profile", label: "My Profile" },
  { id: "settings", label: "Settings" },
];

export default function DashboardLayout() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false); // 🔑 mobile control

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50 relative">
      {/* ===== MOBILE OVERLAY ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          fixed md:static z-40
          inset-y-0 left-0
          w-72
          bg-slate-900/70 border-r border-slate-800/80 backdrop-blur-xl
          flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-800/80">
          <h1 className="text-lg font-semibold tracking-tight">
            World Shopee Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome, Member
          </p>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {MENU_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActive(item.id);
                    setSidebarOpen(false); // 🔑 auto close on mobile
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition
                    ${
                      active === item.id
                        ? "bg-sky-500/90 text-white shadow-sm shadow-sky-500/40"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                >
                  <span>{item.label}</span>
                  {active === item.id && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="px-4 py-3 border-t border-slate-800/80 text-xs text-slate-400">
          <p>
            Logged in as:{" "}
            <span className="text-slate-200">Your ID</span>
          </p>
          <button className="mt-2 w-full text-left text-red-400 hover:text-red-300 text-xs">
            Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-0">
        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            ☰
          </button>
          <h2 className="text-sm font-semibold">Dashboard</h2>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {active === "dashboard" && <DashboardSection />}
          {active === "activeId" && <ActiveIdSection />}
          {active === "epin" && <EpinSection />}
          {active === "teamNetwork" && <TeamNetworkSection />}
          {active === "incomeReport" && <IncomeReportSection />}
          {active === "support" && <SupportSection />}
          {active === "profile" && <ProfileSection />}
          {active === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

/* ========= CONTENT SECTIONS ========= */

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 md:p-5 shadow-lg shadow-black/30">
      <h2 className="text-base md:text-lg font-semibold mb-3">
        {title}
      </h2>
      <div className="text-sm text-slate-300">{children}</div>
    </div>
  );
}

function DashboardSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-2">
        Dashboard Overview
      </h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Total Team">
          <p>120 Members</p>
        </Card>
        <Card title="Active IDs">
          <p>32 IDs</p>
        </Card>
        <Card title="Wallet Balance">
          <p>₹ 8,540</p>
        </Card>
      </div>
    </div>
  );
}

function ActiveIdSection() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl md:text-2xl font-semibold">Active ID</h1>
      <Card title="Your Active IDs">
        <p>Show list/table of active IDs here.</p>
      </Card>
    </div>
  );
}

function EpinSection() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl md:text-2xl font-semibold">E-Pin Management</h1>
      <Card title="Available E-Pins">
        <p>Show E-Pin list, status, generate / transfer buttons here.</p>
      </Card>
    </div>
  );
}

function TeamNetworkSection() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl md:text-2xl font-semibold">Team Network</h1>
      <Card title="Downline Overview">
        <p>Binary tree / level wise team details can come here.</p>
      </Card>
    </div>
  );
}

function IncomeReportSection() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl md:text-2xl font-semibold">Income Report</h1>
      <Card title="Payout Summary">
        <p>Direct income, level income, rewards, etc.</p>
      </Card>
    </div>
  );
}

function SupportSection() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl md:text-2xl font-semibold">Support</h1>
      <Card title="Raise a Ticket">
        <p>Make a form here with subject, message, attachment etc.</p>
      </Card>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl md:text-2xl font-semibold">My Profile</h1>
      <Card title="Personal Details">
        <p>Name, email, phone, bank details, etc.</p>
      </Card>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl md:text-2xl font-semibold">Settings</h1>
      <Card title="Security & Preferences">
        <p>Password change, 2FA, notification settings etc.</p>
      </Card>
    </div>
  );
}
