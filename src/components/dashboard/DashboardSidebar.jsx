import React, { useState, useEffect } from "react";

import ActivateID from "./ActivateID";
import TeamBusiness from "./MyTeamBusiness/TeamBusiness";
import RankRewardBusiness from "./MyTeamBusiness/RankRewardBusiness";
import FreedomBusiness from "./MyTeamBusiness/FreedomBusiness";

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
    children: [{ label: "Generate ePin" }, { label: "ePin Transfer" }, { label: "ePin Report" }],
  },
  { label: "Active ID" },
  {
    label: "My Team Network",
    children: [{ label: "Direct Team" }, { label: "Level-wise Team" }, { label: "Genealogy View" }],
  },
  {
    label: "My Team Business Support",
    children: [{ label: "Team Business" }, { label: "Rank Reward Business" }, { label: "Freedom Business" }],
  },
  {
    label: "Income / Reports",
    children: [{ label: "Income Report" }, { label: "Payout Report" }, { label: "Wallet Ledger" }],
  },
];

export default function DashboardSidebar({ open = true, onClose }) {
  const [openParent, setOpenParent] = useState(null);
  const [activePanel, setActivePanel] = useState(null); // e.g., 'activate-id', 'team-business', etc.

  // Prevent background scrolling when a right panel is open.
  // NOTE: we DO NOT change touchAction here (that was blocking scrolling).
  useEffect(() => {
    const previousOverflow = document.body.style.overflow || "";
    if (activePanel) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activePanel]);

  if (!open) return null;

  const handleParentClick = (label, hasChildren) => {
    if (hasChildren) {
      setOpenParent((prev) => (prev === label ? null : label));
    } else {
      if (label === "Active ID") {
        setActivePanel("activate-id");
      } else {
        console.log("Clicked parent:", label);
      }
    }
  };

  const handleChildClick = (parentLabel, childLabel) => {
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

  return (
    <>
      {/* backdrop - clicking closes sidebar */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* LEFT SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-50 shadow-xl flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          <span className="text-sm font-semibold tracking-wide uppercase">Member Menu</span>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-800 text-xl"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 text-sm">
          {DASHBOARD_ITEMS.map((item) => {
            const isOpen = openParent === item.label;
            const hasChildren = !!item.children?.length;
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => handleParentClick(item.label, hasChildren)}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-800/60 transition"
                >
                  <span>{item.label}</span>
                  {hasChildren && (
                    <span className={`text-xs opacity-70 transform transition-transform ${isOpen ? "rotate-90" : ""}`}>
                      ›
                    </span>
                  )}
                </button>

                {hasChildren && isOpen && (
                  <div className="pl-4 space-y-1">
                    {item.children.map((child) => (
                      <button
                        key={child.label}
                        onClick={() => handleChildClick(item.label, child.label)}
                        className="w-full text-left rounded-md px-3 py-1.5 text-[13px] bg-slate-900/40 hover:bg-slate-800/80 transition"
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
        <div className="border-t border-slate-800 px-4 py-4">
          <button className="w-full rounded-lg border border-red-400/60 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-100 hover:bg-red-500/20 transition">
            Logout
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE PANEL - displayed next to sidebar */}
      <div
        className={`fixed inset-y-0 left-72 right-0 z-50 bg-white shadow-lg transition-transform ${activePanel ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!activePanel}
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          WebkitOverflowScrolling: "touch",
        }} // panel is a column: header + content
      >
        {/* panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold">
            {activePanel === "activate-id"
              ? "Activate ID"
              : activePanel === "team-business"
              ? "Team Business"
              : activePanel === "rank-reward-business"
              ? "Rank Reward Business"
              : activePanel === "freedom-business"
              ? "Freedom Business"
              : ""}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePanel(null)}
              className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>

        {/* panel content (make this the scrolling area) */}
        <div className="p-6 flex-1 overflow-auto">
          {activePanel === "activate-id" && <ActivateID compact={true} />}
          {activePanel === "team-business" && <TeamBusiness />}
          {activePanel === "rank-reward-business" && <RankRewardBusiness />}
          {activePanel === "freedom-business" && <FreedomBusiness />}
        </div>
      </div>
    </>
  );
}
