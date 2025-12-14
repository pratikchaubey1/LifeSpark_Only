import React, { useState, useEffect } from "react";

import ActivateID from "./ActivateID";
import TeamBusiness from "./MyTeamBusiness/TeamBusiness";
import RankRewardBusiness from "./MyTeamBusiness/RankRewardBusiness";
import FreedomBusiness from "./MyTeamBusiness/FreedomBusiness";
import EditProfile from "./EditProfile";
import EditBankDetail from "./Editbankdetail";
import ImageUpload from "./Imageuploader";
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
    const previousOverflow = document.body.style.overflow || "";

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);

      // load member role so we can show/hide ePin section
      if (open && token) {
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
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
      setActivePanel(null);
      setOpenParent(null);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setIsLoggedIn(false);
    if (onClose) onClose();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleParentClick = (label, hasChildren) => {
    if (hasChildren) {
      setOpenParent((prev) => (prev === label ? null : label));
    } else {
      if (label === "Active ID") {
        setActivePanel("activate-id");
      } else if (label === "Withdraw") {
        setActivePanel("withdraw");
      } else {
        console.log("Clicked parent:", label);
      }
    }
  };

  const handleChildClick = (parentLabel, childLabel) => {
    if (parentLabel === "Profile") {
      if (childLabel === "Edit Profile") {
        setActivePanel("edit-profile");
        return;
      }
      if (childLabel === "KYC Upload") {
        setActivePanel("kyc-upload");
        return;
      }
      if (childLabel === "Edit Bank Details") {
        setActivePanel("edit-bank-details");
        return;
      }
    }

    if (parentLabel === "ePin") {
      if (childLabel === "Generate ePin") {
        setActivePanel("epin-generate");
        return;
      }
      if (childLabel === "ePin Transfer") {
        setActivePanel("epin-transfer");
        return;
      }
      if (childLabel === "ePin Report") {
        setActivePanel("epin-report");
        return;
      }
    }

    if (parentLabel === "My Team Business Support") {
      if (childLabel === "Team Business") {
        setActivePanel("team-business");
        return;
      }
      if (childLabel === "Rank Reward Business") {
        setActivePanel("rank-reward-business");
        return;
      }
      if (childLabel === "Freedom Business") {
        setActivePanel("freedom-business");
        return;
      }
    }

    console.log(`Clicked: ${parentLabel} → ${childLabel}`);
    setActivePanel(null);
  };

  const renderRightPanelContent = () => {
    if (activePanel === "activate-id") {
      return <ActivateID compact />;
    }

    if (activePanel === "edit-profile") {
      return <EditProfile />;
    }
    if (activePanel === "kyc-upload") {
      return <ImageUpload />;
    }
    if (activePanel === "edit-bank-details") {
      return <EditBankDetail />;
    }
    if (activePanel === "withdraw") {
      return <Withdraw />;
    }

    if (activePanel === "epin-generate") {
      // NOTE: currently a placeholder UI; wire to real e-pin generation/assignment API when available
      return <TransferPin />;
    }
    if (activePanel === "epin-transfer") {
      return <TransferToUser />;
    }
    if (activePanel === "epin-report") {
      return <UsedPin />;
    }

    if (activePanel === "team-business") {
      return <TeamBusiness />;
    }
    if (activePanel === "rank-reward-business") {
      return <RankRewardBusiness />;
    }
    if (activePanel === "freedom-business") {
      return <FreedomBusiness />;
    }

    return children || null;
  };

  const canSeeEpin = isLoggedIn && role === "franchise";
  const visibleItems = canSeeEpin
    ? DASHBOARD_ITEMS
    : DASHBOARD_ITEMS.filter((i) => i.label !== "ePin");

  // If user was on ePin section and role becomes non-franchise, kick them out
  useEffect(() => {
    if (!canSeeEpin && openParent === "ePin") setOpenParent(null);
  }, [canSeeEpin, openParent]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:bg-slate-900/30"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className="
          fixed inset-y-0 left-0 z-50 
          w-full max-w-xs sm:max-w-sm md:w-72 
          bg-slate-900 text-slate-50 shadow-2xl flex flex-col
        "
      >
        {/* Top */}
        <div className="flex items-center justify-between px-4 h-14 md:h-16 border-b border-slate-800">
          <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">
            Member Menu
          </span>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-800 text-xl"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 md:py-4 space-y-1 text-xs sm:text-sm">
          {visibleItems.map((item) => {
            const isOpen = openParent === item.label;
            const hasChildren = !!item.children?.length;
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => handleParentClick(item.label, hasChildren)}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-800/60 transition"
                >
                  <span className="truncate">{item.label}</span>
                  {hasChildren && (
                    <span
                      className={`text-xs opacity-70 transform transition-transform ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    >
                      ›
                    </span>
                  )}
                </button>

                {hasChildren && isOpen && (
                  <div className="pl-3 md:pl-4 space-y-1">
                    {item.children.map((child) => (
                      <button
                        key={child.label}
                        onClick={() =>
                          handleChildClick(item.label, child.label)
                        }
                        className="w-full text-left rounded-md px-3 py-1.5 text-[11px] sm:text-[13px] bg-slate-900/40 hover:bg-slate-800/80 transition"
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

        {/* footer */}
        <div className="border-t border-slate-800 px-4 py-3 md:py-4">
          <div className="flex gap-2">
            {isLoggedIn ? (
              <button
                className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-red-600 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:opacity-95 transition"
                  onClick={
                    onRegisterClick ||
                    (() => {
                      console.log("Register clicked");
                    })
                  }
                >
                  Register
                </button>

                <button
                  className="flex-1 rounded-lg border border-slate-500/70 bg-slate-900/60 px-3 py-2 text-xs sm:text-sm font-medium text-slate-100 hover:bg-slate-800 transition"
                  onClick={
                    onLoginClick ||
                    (() => {
                      console.log("Login clicked");
                    })
                  }
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Right-side slider content area */}
      <section
        className="
          fixed z-40 
          bg-slate-950/95 text-slate-50 border-l border-slate-800 
          overflow-y-auto 
          top-14 md:top-0 
          left-0 right-0 
          md:left-72 
          bottom-0 
          p-3 sm:p-4 md:p-6
        "
      >
        {renderRightPanelContent()}
      </section>
    </>
  );
}
