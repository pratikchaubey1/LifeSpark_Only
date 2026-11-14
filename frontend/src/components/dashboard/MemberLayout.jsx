import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { FiShield, FiLock, FiAlertCircle } from "react-icons/fi";
import config from "../../config/config";

import DashboardSidebar from "./DashboardSidebar";
import Autopool from "./Autopool";

import DashBoardPage from "./MemberDashboardPage";
import EditProfile from "./EditProfile";
import ImageUpload from "./Imageuploader";
import EditBankDetail from "./Editbankdetail";
import EditPassword from "./EditPassword";
import WelcomeLetter from "./WelcomeLetter";
import MemberIDCard from "./MemberIDCard";

import ActivateID from "./ActivateID";

import Withdraw from "./Withdraw";
import RepurchaseWallet from "./RepurchaseWallet";
import DannFund from "./DannFund";
import MarriageFund from "./MarriageFund";
import AccidentFund from "./AccidentFund";

import TransferPin from "./e-pin/TransferPin";
import TransferToUser from "./e-pin/TransferToUser";
import UsedPin from "./e-pin/UsedPin";

import TeamBusiness from "./MyTeamBusiness/TeamBusiness";
import RankRewardBusiness from "./MyTeamBusiness/RankRewardBusiness";
import FreedomBusiness from "./MyTeamBusiness/FreedomBusiness";
import LevelIncome from "./MyTeamBusiness/LevelIncome";

import TotalActiveUser from "./MyTeamNetwork/TotalActiveUser";
import TotalDirectUser from "./MyTeamNetwork/TotalDirectUser";
import TotalInactiveUser from "./MyTeamNetwork/TotalInActiveUser";
import TotalTeam from "./MyTeamNetwork/TotalTeam";

import FranchiseBankUpdate from "./FranchiseBankUpdate";


import IncomeReport from "./IncomeReport";

export default function MemberLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [hideButtons, setHideButtons] = useState(false);
  const [childLoading, setChildLoading] = useState(false);

  // First-time Bank Details Form State
  const [initialBank, setInitialBank] = useState({
    accountHolder: "",
    bankName: "",
    branchName: "",
    accountNo: "",
    confirmAccountNo: "",
    ifsc: ""
  });
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [bankError, setBankError] = useState("");

  const navigate = useNavigate(); // ✅ Fix for redirect

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) {
      fetchProfile(token);
    }
  }, []);

  async function fetchProfile(token) {
    try {
      const res = await fetch(`${config.apiUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user?.name && !initialBank.accountHolder) {
          setInitialBank((prev) => ({ ...prev, accountHolder: data.user.name }));
        }
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  }

  const handleInitialBankChange = (e) => {
    const { name, value } = e.target;
    const formatted = name === "ifsc" ? value.toUpperCase() : value;
    setInitialBank((prev) => ({ ...prev, [name]: formatted }));
    if (bankError) setBankError("");
  };

  const handleInitialBankSubmit = async (e) => {
    e.preventDefault();
    setBankError("");

    if (!initialBank.accountHolder.trim()) return setBankError("Account holder name is required.");
    if (!initialBank.bankName.trim()) return setBankError("Bank name is required.");
    if (!initialBank.branchName.trim()) return setBankError("Branch name is required.");
    if (!initialBank.accountNo.trim()) return setBankError("Account number is required.");
    if (!/^\d{8,18}$/.test(initialBank.accountNo.trim())) return setBankError("Enter valid account number (8–18 digits).");
    if (initialBank.accountNo.trim() !== initialBank.confirmAccountNo.trim()) return setBankError("Account numbers do not match.");
    if (!initialBank.ifsc.trim()) return setBankError("IFSC code is required.");
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(initialBank.ifsc.trim().toUpperCase())) return setBankError("Enter valid IFSC (e.g. SBIN0123456).");

    const token = localStorage.getItem("token");
    if (!token) return setBankError("Please login again.");

    try {
      setBankSubmitting(true);
      const res = await fetch(`${config.apiUrl}/profile/initial-bank-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          accountHolder: initialBank.accountHolder.trim(),
          bankName: initialBank.bankName.trim(),
          accountNo: initialBank.accountNo.trim(),
          ifsc: initialBank.ifsc.trim().toUpperCase(),
          branchName: initialBank.branchName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return setBankError(data.message || "Failed to save bank details.");
      }

      setUser(data.user);
    } catch {
      setBankError("Network error. Please try again.");
    } finally {
      setBankSubmitting(false);
    }
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      setHideButtons(window.scrollY > lastScrollY);
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Security Helper: Check if user is expired (60-day rule)
  const isExpired = () => {
    if (!user) return false;
    // Admin and franchise roles should not be blocked by the 60-day rule
    if (user.role === 'admin' || user.role === 'franchise') return false;
    if (user.upgradeStatus === 'approved') return false;
    if (!user.firstReferralDate) return false;

    const msSinceFirst = Date.now() - new Date(user.firstReferralDate).getTime();
    const daysSinceFirst = msSinceFirst / (1000 * 60 * 60 * 24);
    return daysSinceFirst >= 60;
  };

  // Redirect expired users to main dashboard to show the 60-day popup
  useEffect(() => {
    if (isExpired()) {
      const path = window.location.pathname;
      if (path !== "/dashboard" && path !== "/dashboard/") {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
        user={user}
      />

      {/* Dashboard + Logout Buttons */}
      <div
        className={`fixed top-3 right-4 z-50 flex gap-2 transition-all duration-300 
        ${hideButtons || sidebarOpen
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
          }`}
      >
        {isLoggedIn && user && !childLoading && !isExpired() && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700"
          >
            Dashboard
          </button>
        )}

        {isLoggedIn && user && !childLoading && !sidebarOpen && (
          <button
            onClick={() => {
              onLogout();       // remove token
              navigate("/login"); // redirect safely
            }}
            className=""
          >

          </button>
        )}
      </div>

      {/* ROUTES */}
      <div className="p-3 pt-16">
        <Routes>
          <Route path="/" element={<DashBoardPage setLoading={setChildLoading} />} />

          {/* Pages with Menu Button */}
          <Route
            path="edit-profile"
            element={<EditProfile onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="kyc-upload"
            element={<ImageUpload onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="edit-bank-details"
            element={<EditBankDetail onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="edit-password"
            element={<EditPassword onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="welcome-letter"
            element={<WelcomeLetter onMenuOpen={() => setSidebarOpen(true)} />}
          />

          <Route
            path="activate-id"
            element={<ActivateID onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="id-card"
            element={<MemberIDCard onMenuOpen={() => setSidebarOpen(true)} />}
          />

          <Route
            path="epin-generate"
            element={<TransferPin onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="epin-transfer"
            element={<TransferToUser onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="epin-report"
            element={<UsedPin onMenuOpen={() => setSidebarOpen(true)} />}
          />

          <Route
            path="direct-team"
            element={<TeamBusiness onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="level-team"
            element={<RankRewardBusiness onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="genealogy"
            element={<FreedomBusiness onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="level-income"
            element={<LevelIncome sidebarOpen={sidebarOpen} onMenuOpen={() => setSidebarOpen(true)} />}
          />

          <Route
            path="total-team"
            element={<TotalTeam onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="total-Active"
            element={<TotalActiveUser onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="total-Direct"
            element={<TotalDirectUser onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="total-Inactive"
            element={<TotalInactiveUser onMenuOpen={() => setSidebarOpen(true)} />}
          />

          <Route
            path="income-report"
            element={<IncomeReport onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="withdraw"
            element={<Withdraw onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="repurchase-wallet"
            element={<RepurchaseWallet onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="dann-fund"
            element={<DannFund onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="marriage-fund"
            element={<MarriageFund onMenuOpen={() => setSidebarOpen(true)} />}
          />
          <Route
            path="accident-fund"
            element={<AccidentFund onMenuOpen={() => setSidebarOpen(true)} />}
          />

          <Route
            path="autopool"
            element={<Autopool sidebarOpen={sidebarOpen} onMenuOpen={() => setSidebarOpen(true)} />}
          />

          {/* Franchise Routes */}
          <Route
            path="franchise-bank-update"
            element={<FranchiseBankUpdate onMenuOpen={() => setSidebarOpen(true)} />}
          />
        </Routes>
      </div>

      {/* FIRST-TIME LOGIN BANK DETAILS POPUP MODAL */}
      {user && user.role !== "admin" && (!user.bankDetails?.accountNo || !user.bankDetails.accountNo.trim()) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
                <FiShield size={28} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Complete Your Bank Details
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Welcome to LifeSpark! Please enter your official bank details below. Payouts and withdrawals will be sent to this account. Once submitted, details are locked for security.
              </p>
            </div>

            {bankError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <FiAlertCircle className="shrink-0" size={16} />
                <span>{bankError}</span>
              </div>
            )}

            <form onSubmit={handleInitialBankSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountHolder"
                  value={initialBank.accountHolder}
                  onChange={handleInitialBankChange}
                  placeholder="Enter name as on passbook"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={initialBank.bankName}
                    onChange={handleInitialBankChange}
                    placeholder="e.g. State Bank of India"
                    className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={initialBank.branchName}
                    onChange={handleInitialBankChange}
                    placeholder="e.g. City Main Branch"
                    className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNo"
                  value={initialBank.accountNo}
                  onChange={handleInitialBankChange}
                  placeholder="Enter bank account number"
                  className="w-full p-3 font-mono rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  name="confirmAccountNo"
                  value={initialBank.confirmAccountNo}
                  onChange={handleInitialBankChange}
                  placeholder="Re-enter bank account number"
                  className="w-full p-3 font-mono rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifsc"
                  value={initialBank.ifsc}
                  onChange={handleInitialBankChange}
                  placeholder="e.g. SBIN0123456"
                  className="w-full p-3 font-mono uppercase rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={bankSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 active:scale-[0.99] transition disabled:opacity-50"
                >
                  {bankSubmitting ? "Saving Bank Details..." : "Submit & Proceed to Dashboard"}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                <FiLock size={12} /> Bank details cannot be skipped or edited after submission
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
