import React, { useEffect, useState } from "react";

import TransferToUser from "./e-pin/TransferToUser";

const API_BASE = "http://localhost:5000";

// =================== LEFT MENU ITEMS ===================
const SIDE_MENU = [
  { id: "dashboard", label: "Dashboard" },
  { id: "activeId", label: "Active ID" },
  { id: "epin", label: "E-Pin" },
  { id: "teamNetwork", label: "Team Network" },
  { id: "incomeReport", label: "Income Report" },
  { id: "support", label: "Support" },
  { id: "profile", label: "My Profile" },
  { id: "settings", label: "Settings" },
];

// =================== DASHBOARD CARDS DATA ===================
const statsTop = [
  { label: "Total Income", value: "0 INR", color: "bg-blue-500" },
  { label: "Withdrawal", value: "0 INR", color: "bg-amber-400" },
  { label: "Balance", value: "0 INR", color: "bg-red-500" },
  { label: "Freadom(Pool) Income", value: "0 INR", color: "bg-emerald-500" },
  { label: "Daily Bonus Income", value: "0 INR", color: "bg-emerald-500" },
  { label: "Rank Reward Income", value: "0 INR", color: "bg-emerald-500" },
];

const statsBottom = [
  { label: "Repurchase Income", value: "0 INR" },
  { label: "Today Active", value: "0" },
  { label: "Today InActive", value: "0" },
  { label: "Today Total Id", value: "0" },
  { label: "Total User", value: "0" },
  { label: "Total Active User", value: "0" },
  { label: "Total InActive User", value: "0" },
  { label: "Total Direct", value: "0" },
  { label: "Total Direct Active", value: "0" },
  { label: "Total Direct InActive", value: "0" },
];

// =================== REUSABLE CARD FOR TABS ===================
const MPCard = ({ title, children }) => (
  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-200/70 p-4 md:p-5 mb-4">
    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
      {title}
    </h3>
    <div className="text-xs md:text-sm text-slate-600">{children}</div>
  </div>
);

// =================== RIGHT-SIDE TABS (BLUR AREA CONTENT) ===================

const MP_Dashboard = () => (
  <div>
    <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
      Dashboard Overview
    </h2>
    <div className="grid gap-4 md:grid-cols-3">
      <MPCard title="Total Team">
        <p>120 Members</p>
      </MPCard>
      <MPCard title="Active IDs">
        <p>32 IDs</p>
      </MPCard>
      <MPCard title="Today&apos;s Income">
        <p>₹ 1,250</p>
      </MPCard>
    </div>
  </div>
);

const MP_ActiveId = () => (
  <div>
    <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
      Active ID
    </h2>
    <MPCard title="Your Active IDs">
      <p>Yahan table aayega: ID, Package, DOJ, Expiry, Status.</p>
    </MPCard>
  </div>
);

const MP_Epin = () => (
  <div>
    <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
      E-Pin Management
    </h2>

    {/* Transfer screen shows your User ID + Invite Code at the top */}
    <TransferToUser />
  </div>
);

const MP_TeamNetwork = () => (
  <div>
    <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
      Team Network
    </h2>
    <MPCard title="Downline Overview">
      <p>Left / right team, level-wise members, active vs inactive, BV etc.</p>
    </MPCard>
  </div>
);

const MP_IncomeReport = () => (
  <div>
    <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
      Income Report
    </h2>
    <MPCard title="Payout Summary">
      <p>Direct income, level income, ROI, rewards, withdrawals, sab yahan.</p>
    </MPCard>
  </div>
);

const MP_Support = () => (
  <div>
    <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
      Support
    </h2>
    <MPCard title="Raise a Ticket">
      <p>Subject, Category, Description, Attachment ke saath ticket form.</p>
    </MPCard>
  </div>
);

const MP_Profile = () => (
  <div>
    <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
      My Profile
    </h2>
    <MPCard title="Personal Details">
      <p>Name, mobile, email, address, bank/UPI, KYC status etc.</p>
    </MPCard>
  </div>
);

const MP_Settings = () => (
  <div>
    <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
      Settings
    </h2>
    <MPCard title="Security & Preferences">
      <p>Password change, 2FA, login alerts, notifications settings.</p>
    </MPCard>
  </div>
);

// =================== CENTER DASHBOARD (COLOURED CARDS PART) ===================
const DashBoardPage = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
    {/* Top blue bar */}
    <div className="bg-sky-600 text-center text-white text-xs md:text-sm py-2">
      सपनों की दुनिया को वास्तविकता में बदलने जा रहा।
    </div>

    {/* Activation text */}
    <div className="text-center text-red-600 text-xs md:text-sm mt-2">
      Click here to activate your account!
    </div>

    <div className="px-4 pb-6 pt-4 md:px-6 md:pb-8">
      {/* Congratulation card */}
      <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
        <div className="bg-red-500 text-white font-semibold text-center py-2 text-sm">
          Congratulation!
        </div>
        <div className="bg-sky-500 text-white text-center py-6">
          <div className="text-lg md:text-xl font-semibold">Karan Yadav</div>
          <div className="mt-1 text-xs md:text-sm">WSE414890</div>
          <div className="mt-1 text-xs md:text-sm">Post</div>
          <div className="mt-4 text-[10px] md:text-xs">
            Joining Date: 30/11/2025
          </div>
          <div className="text-[10px] md:text-xs">Sponsor ID : WSE597116</div>
        </div>
      </div>

      {/* Top stats grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsTop.map((item) => (
          <div
            key={item.label}
            className={`${item.color} text-white rounded shadow p-4 flex flex-col justify-center`}
          >
            <div className="text-xs opacity-90">{item.label}</div>
            <div className="mt-2 text-lg font-semibold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Bottom stats grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsBottom.map((item) => (
          <div
            key={item.label}
            className="bg-sky-500 text-white rounded shadow p-4 flex flex-col justify-center"
          >
            <div className="text-xs opacity-90">{item.label}</div>
            <div className="mt-2 text-lg font-semibold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// =================== MAIN LAYOUT (MENU LEFT + DASHBOARD CENTER + BLUR RIGHT) ===================

const MemberLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setRole(data.user?.role || "member");
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const canSeeEpin = role === "franchise";
  const menuItems = canSeeEpin ? SIDE_MENU : SIDE_MENU.filter((i) => i.id !== "epin");

  useEffect(() => {
    if (!canSeeEpin && activeTab === "epin") setActiveTab("dashboard");
  }, [canSeeEpin, activeTab]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-stretch">
      {/* LEFT SIDE MENU (image jaisa dark panel) */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col">
        <div className="px-4 py-4 text-lg font-semibold border-b border-slate-700">
          MEMBER MENU
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
          <p className="text-xs text-slate-400 mb-2">Profile</p>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-200 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button className="m-3 mt-0 mb-4 rounded-md bg-rose-600 hover:bg-rose-500 text-sm font-semibold py-2">
          Logout
        </button>
      </aside>

      {/* CENTER + RIGHT (background blur jaisa) */}
      <main className="flex-1 relative overflow-hidden">
        {/* blur background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-emerald-50" />
        <div className="absolute inset-0 backdrop-blur-sm opacity-70" />

        {/* foreground content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
          {/* Center: coloured dashboard (DashBoardPage) */}
          <div className="flex-1">
            <DashBoardPage />
          </div>

          {/* Right: active section content change on menu click */}
          <div className="w-full lg:w-[40%]">
            {activeTab === "dashboard" && <MP_Dashboard />}
            {activeTab === "activeId" && <MP_ActiveId />}
            {canSeeEpin && activeTab === "epin" && <MP_Epin />}
            {activeTab === "teamNetwork" && <MP_TeamNetwork />}
            {activeTab === "incomeReport" && <MP_IncomeReport />}
            {activeTab === "support" && <MP_Support />}
            {activeTab === "profile" && <MP_Profile />}
            {activeTab === "settings" && <MP_Settings />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemberLayout;
