import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import config from "../../config/config";

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
import WelcomeLetter from "./WelcomeLetter";
import CreateIdCard from "./CreateIdCard";

const API_BASE = config.apiUrl;

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
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false); // 🔑 ONLY NEW STATE
  const [openParent, setOpenParent] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false
  );
  const [role, setRole] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

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
            if (res.ok) {
              setRole(data.user?.role || "member");
              setProfileUser(data.user || null);
            }
          } catch {}
        })();
      }

      const onKeyDown = (e) => {
        if (e.key === "Escape") onClose && onClose();
      };
      if (open) window.addEventListener("keydown", onKeyDown);

      document.body.style.overflow = open ? "hidden" : previousOverflow;
      return () => {
        window.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    }

    document.body.style.overflow = open ? "hidden" : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

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
      if (childLabel === "Welcome Letter") return setActivePanel("welcome-letter");
      if (childLabel === "Create ID Card") return setActivePanel("create-id-card");
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

    if (activePanel === "welcome-letter") {
      return (
        <WelcomeLetter
          embedded
          userName={profileUser?.name || "Member"}
          email={profileUser?.email || "user@example.com"}
          inviteCode={profileUser?.inviteCode || "LS-INV-0000"}
          onBack={() => setActivePanel(null)}
          onCreateIdCard={() => setActivePanel("create-id-card")}
          onContinue={() => setActivePanel(null)}
        />
      );
    }

    if (activePanel === "create-id-card") {
      return (
        <CreateIdCard
          embedded
          userName={profileUser?.name || "Member"}
          email={profileUser?.email || "user@example.com"}
          inviteCode={profileUser?.inviteCode || "LS-INV-0000"}
          onBack={() => setActivePanel("welcome-letter")}
          onContinue={() => setActivePanel(null)}
        />
      );
    }

    return children || null;
  };

  const canSeeEpin = isLoggedIn && role === "franchise";
  const visibleItems = canSeeEpin
    ? DASHBOARD_ITEMS
    : DASHBOARD_ITEMS.filter((i) => i.label !== "ePin");

  if (!open) return null;

  return (
    <>
      {/* Backdrop: click to close */}
      <button
        type="button"
        aria-label="Close sidebar"
        className="fixed inset-0 z-30 bg-black/40"
        onClick={() => onClose && onClose()}
      />

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
            <button
              type="button"
              onClick={() => {
                setActivePanel(null);
                onClose && onClose();
                navigate("/");
              }}
              className="text-sm font-semibold uppercase hover:text-slate-200"
              title="Go to Home"
            >
              Home
            </button>
          )}

          <div className="flex items-center gap-2">
            {/* Collapse */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-800 text-xl"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? "›" : "‹"}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={() => onClose && onClose()}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-800 text-lg"
              title="Close sidebar"
            >
              ×
            </button>
          </div>
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
