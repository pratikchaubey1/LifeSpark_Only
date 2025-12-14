import React, { useState, useEffect } from "react";

import ActivateID from "./ActivateID";
import TeamBusiness from "./MyTeamBusiness/TeamBusiness";
import RankRewardBusiness from "./MyTeamBusiness/RankRewardBusiness";
import FreedomBusiness from "./MyTeamBusiness/FreedomBusiness";
import EditProfile from "./EditProfile";
import EditBankDetail from "./Editbankdetail";
import ImageUpload from "./Imageuploader";
import IncomeReport from "./IncomeReport";
import Withdraw from "./Withdraw";
import TransferPin from "./e-pin/TransferPin";
import TransferToUser from "./e-pin/TransferToUser";
import UsedPin from "./e-pin/UsedPin";

const API_BASE = "http://localhost:5000";

const DASHBOARD_ITEMS = [
  {
    label: "Profile",
    children: [
      { label: "Edit Profile" },
      { label: "KYC Upload" },
      { label: "Edit Password" },
      { label: "Edit Bank Details" },
      { label: "Welcome Letter" },
      { label: "Create ID Card" },
    ],
  },
  {
    label: "ePin",
    children: [
      { label: "Generate ePin" },
      { label: "ePin Transfer" },
      { label: "ePin Report" },
    ],
  },
  { label: "Active ID" },
  {
    label: "My Team Network",
    children: [
      { label: "Direct Team" },
      { label: "Level-wise Team" },
      { label: "Genealogy View" },
    ],
  },
  {
    label: "My Team Business Support",
    children: [
      { label: "Team Business" },
      { label: "Rank Reward Business" },
      { label: "Freedom Business" },
    ],
  },
  {
    label: "Income / Reports",
    children: [
      { label: "Income Report" },
      { label: "Payout Report" },
      { label: "Wallet Ledger" },
    ],
  },
  { label: "Withdraw" },
];

export default function DashboardSidebar({
  open = true,
  onClose,
  children,
  onLoginClick,
  onRegisterClick,
}) {
  const [collapsed, setCollapsed] = useState(false); // 🔑 ONLY NEW STATE
  const [openParent, setOpenParent] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false
  );
  const [role, setRole] = useState(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow || "";

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);

      if (open && token) {
        (async () => {
          try {
            const res = await fetch(`${API_BASE}/api/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setRole(data.user?.role || "member");
          } catch {}
        })();
      }
    }

    document.body.style.overflow = open ? "hidden" : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleParentClick = (label, hasChildren) => {
    if (collapsed) return;
    if (hasChildren) {
      setOpenParent((prev) => (prev === label ? null : label));
    } else {
      if (label === "Active ID") setActivePanel("activate-id");
      else if (label === "Withdraw") setActivePanel("withdraw");
    }
  };

  const handleChildClick = (parentLabel, childLabel) => {
    if (parentLabel === "Profile") {
      if (childLabel === "Edit Profile") return setActivePanel("edit-profile");
      if (childLabel === "KYC Upload") return setActivePanel("kyc-upload");
      if (childLabel === "Edit Bank Details")
        return setActivePanel("edit-bank-details");
    }

    if (parentLabel === "ePin") {
      if (childLabel === "Generate ePin") return setActivePanel("epin-generate");
      if (childLabel === "ePin Transfer") return setActivePanel("epin-transfer");
      if (childLabel === "ePin Report") return setActivePanel("epin-report");
    }

    if (parentLabel === "My Team Business Support") {
      if (childLabel === "Team Business") return setActivePanel("team-business");
      if (childLabel === "Rank Reward Business")
        return setActivePanel("rank-reward-business");
      if (childLabel === "Freedom Business")
        return setActivePanel("freedom-business");
    }

    if (parentLabel === "Income / Reports") {
      if (childLabel === "Income Report") return setActivePanel("income-report");
    }
  };

  const renderRightPanelContent = () => {
    if (activePanel === "activate-id") return <ActivateID compact />;
    if (activePanel === "edit-profile") return <EditProfile />;
    if (activePanel === "kyc-upload") return <ImageUpload />;
    if (activePanel === "edit-bank-details") return <EditBankDetail />;
    if (activePanel === "withdraw") return <Withdraw />;
    if (activePanel === "epin-generate") return <TransferPin />;
    if (activePanel === "epin-transfer") return <TransferToUser />;
    if (activePanel === "epin-report") return <UsedPin />;
    if (activePanel === "team-business") return <TeamBusiness />;
    if (activePanel === "rank-reward-business")
      return <RankRewardBusiness />;
    if (activePanel === "freedom-business") return <FreedomBusiness />;
    if (activePanel === "income-report") return <IncomeReport />;

    return children || null;
  };

  const canSeeEpin = isLoggedIn && role === "franchise";
  const visibleItems = canSeeEpin
    ? DASHBOARD_ITEMS
    : DASHBOARD_ITEMS.filter((i) => i.label !== "ePin");

  if (!open) return null;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          ${collapsed ? "w-[4vw] min-w-[48px]" : "w-[80vw] md:w-72"}
          bg-slate-900 text-slate-50
          shadow-2xl flex flex-col
          transition-all duration-300
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          {!collapsed && (
            <span className="text-sm font-semibold uppercase">Member Menu</span>
          )}

          {/* ARROW BUTTON (REPLACES ❌) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-800 text-xl"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* NAV */}
        {!collapsed && (
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 text-sm">
            {visibleItems.map((item) => {
              const isOpen = openParent === item.label;
              return (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      handleParentClick(item.label, !!item.children)
                    }
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-800/60"
                  >
                    <span>{item.label}</span>
                    {item.children && (
                      <span className={isOpen ? "rotate-90" : ""}>›</span>
                    )}
                  </button>

                  {item.children && isOpen && (
                    <div className="pl-4 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.label}
                          onClick={() =>
                            handleChildClick(item.label, child.label)
                          }
                          className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-800/80"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}
      </aside>

      {/* Right panel */}
      <section
        className={`
          fixed inset-y-0 right-0 z-40
          ${collapsed ? "left-[4vw] min-left-[48px]" : "left-[80vw] md:left-72"}
          bg-slate-950/95 text-slate-50
          border-l border-slate-800
          overflow-y-auto p-4 md:p-6
          transition-all duration-300
        `}
      >
        {renderRightPanelContent()}
      </section>
    </>
  );
}
