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
  const [openParent, setOpenParent] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false
  );
  const [role, setRole] = useState(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow || "";

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

    document.body.style.overflow = open ? "hidden" : prevOverflow;

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    onClose?.();
    window.location.reload();
  };

  const handleParentClick = (label, hasChildren) => {
    if (hasChildren) {
      setOpenParent((p) => (p === label ? null : label));
    } else {
      if (label === "Active ID") setActivePanel("activate-id");
      if (label === "Withdraw") setActivePanel("withdraw");
    }
  };

  const handleChildClick = (parent, child) => {
    if (parent === "Profile") {
      if (child === "Edit Profile") return setActivePanel("edit-profile");
      if (child === "KYC Upload") return setActivePanel("kyc-upload");
      if (child === "Edit Bank Details")
        return setActivePanel("edit-bank-details");
    }

    if (parent === "ePin") {
      if (child === "Generate ePin") return setActivePanel("epin-generate");
      if (child === "ePin Transfer") return setActivePanel("epin-transfer");
      if (child === "ePin Report") return setActivePanel("epin-report");
    }

    if (parent === "My Team Business Support") {
      if (child === "Team Business") return setActivePanel("team-business");
      if (child === "Rank Reward Business")
        return setActivePanel("rank-reward-business");
      if (child === "Freedom Business")
        return setActivePanel("freedom-business");
    }

    if (parent === "Income / Reports") {
      if (child === "Income Report") return setActivePanel("income-report");
      if (child === "Payout Report") return setActivePanel("payout-report");
      if (child === "Wallet Ledger") return setActivePanel("wallet-ledger");
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
      {/* MOBILE OVERLAY */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72
          bg-slate-900 text-slate-50
          shadow-2xl flex flex-col
          transform transition-transform duration-300
          md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          <span className="text-sm font-semibold uppercase">Member Menu</span>
          <button
            onClick={onClose}
            className="md:hidden h-8 w-8 text-xl hover:bg-slate-800 rounded-full"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 text-sm">
          {visibleItems.map((item) => {
            const openItem = openParent === item.label;
            return (
              <div key={item.label}>
                <button
                  onClick={() =>
                    handleParentClick(item.label, !!item.children)
                  }
                  className="w-full flex justify-between px-3 py-2 rounded-lg hover:bg-slate-800/60"
                >
                  {item.label}
                  {item.children && (
                    <span className={openItem ? "rotate-90" : ""}>›</span>
                  )}
                </button>

                {item.children && openItem && (
                  <div className="pl-4 space-y-1">
                    {item.children.map((c) => (
                      <button
                        key={c.label}
                        onClick={() =>
                          handleChildClick(item.label, c.label)
                        }
                        className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-800/80"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-4 py-4">
          {isLoggedIn ? (
            <button
              className="w-full bg-red-500 py-2 rounded-lg"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="flex-1 bg-indigo-500 py-2 rounded-lg"
                onClick={onRegisterClick}
              >
                Register
              </button>
              <button
                className="flex-1 border py-2 rounded-lg"
                onClick={onLoginClick}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <section className="fixed inset-y-0 right-0 z-30 w-full md:left-72 bg-slate-950 text-slate-50 overflow-y-auto p-4 md:p-6">
        {renderRightPanelContent()}
      </section>
    </>
  );
}
