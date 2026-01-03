import React, { useState } from "react";
import { Link } from "react-router-dom";
import config from "../../config/config";

const API_BASE = config.apiUrl;

const DASHBOARD_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  {
    label: "Profile",
    children: [
      { label: "Edit Profile", path: "/dashboard/edit-profile" },
      { label: "KYC Upload", path: "/dashboard/kyc-upload" },
      { label: "Edit Password", path: "/dashboard/edit-password" },
      { label: "Edit Bank Details", path: "/dashboard/edit-bank-details" },
    ],
  },

  {
    label: "ePin",
    children: [
      { label: "Generate ePin", path: "/dashboard/epin-generate" },
      { label: "ePin Transfer", path: "/dashboard/epin-transfer" },
      { label: "ePin Report", path: "/dashboard/epin-report" },
      { label: "Activate Member", path: "/dashboard/activate-id" },
    ],
  },

  {
    label: "My Team Network",
    children: [
      { label: "Total Active", path: "/dashboard/total-Active" },
      { label: "Total Direct", path: "/dashboard/total-Direct" },
      { label: "Total Inactive", path: "/dashboard/total-Inactive" },
    ],
  },

  {
    label: "Income Report ",
    children: [
      { label: "Auto Pool", path: "/dashboard/direct-team" },
      {
        label: "Rank Reward Business",
        path: "/dashboard/level-team",
      },
      // { label: "Freedom Business", path: "/dashboard/genealogy" },
      { label: "Level Income", path: "/dashboard/level-income" },
    ],
  },

  // {
  //   label: "Income / Reports",
  //   children: [
  //     { label: "Income Report", path: "/dashboard/income-report" },
  //     // { label: "Payout Report", path: "/dashboard/payout-report" },
  //     // { label: "Wallet Ledger", path: "/dashboard/wallet-ledger" },
  //   ],
  // },

  { label: "Withdraw", path: "/dashboard/withdraw" },
];

export default function DashboardSidebar({ open = true, onClose, onLogout, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [openParent, setOpenParent] = useState(null);

  if (!open) return null;

  const allItems = [...DASHBOARD_ITEMS];

  // Add Franchise items if the user is a franchise
  if (user?.role === "franchise") {
    allItems.push({
      label: "Franchise Panel",
      children: [
        { label: "Franchise Team", path: "/dashboard/franchise-team" },
      ],
    });
  }

  return (
    <>
      <button
        className="fixed inset-0 z-30 bg-black/40"
        onClick={() => onClose && onClose()}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col
        ${collapsed ? "w-[50px]" : "w-[80vw] md:w-72"}
        bg-slate-900 text-white transition-all duration-300`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          {!collapsed && <span className="font-semibold uppercase">Menu</span>}

          <button
            onClick={() => onClose && onClose()}
            className="h-8 w-8 rounded-full hover:bg-slate-800 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* MAIN MENU LIST */}
        {!collapsed && (
          <nav className="p-3 space-y-2 text-sm overflow-y-auto flex-1">
            {allItems.map((item) => {
              const hasChildren = !!item.children;
              const isOpen = openParent === item.label;

              return (
                <div key={item.label}>
                  {item.path ? (
                    <Link
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className="block px-3 py-2 rounded-md hover:bg-slate-800"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => setOpenParent(isOpen ? null : item.label)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 flex justify-between"
                    >
                      {item.label}
                      {hasChildren && <span>{isOpen ? "▲" : "▼"}</span>}
                    </button>
                  )}

                  {hasChildren && isOpen && (
                    <div className="ml-3 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.path}
                          onClick={() => onClose && onClose()}
                          className="block px-3 py-1.5 rounded hover:bg-slate-800/80"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        {/* ⭐ BOTTOM FIXED HOME BUTTON ⭐ */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-800 space-y-2">
            <Link
              to="/"
              onClick={() => onClose && onClose()}
              className="w-full block text-center bg-slate-800 hover:bg-slate-700 py-2 rounded-lg font-medium text-white transition"
            >
              Home
            </Link>
            <button
              onClick={() => {
                onLogout && onLogout();
                onClose && onClose();
              }}
              className="w-full block text-center bg-rose-600 hover:bg-rose-700 py-2 rounded-lg font-medium text-white transition"
            >
              Logout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
