import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import DashboardSidebar from "./DashboardSidebar";

import DashBoardPage from "./DashBoardPage";
import EditProfile from "./EditProfile";
import ImageUpload from "./Imageuploader";
import EditBankDetail from "./Editbankdetail";
import EditPassword from "./EditPassword";
import WelcomeLetter from "./WelcomeLetter";

import ActivateID from "./ActivateID";

import Withdraw from "./Withdraw";

import TransferPin from "./e-pin/TransferPin";
import TransferToUser from "./e-pin/TransferToUser";
import UsedPin from "./e-pin/UsedPin";

import TeamBusiness from "./MyTeamBusiness/TeamBusiness";
import RankRewardBusiness from "./MyTeamBusiness/RankRewardBusiness";
import FreedomBusiness from "./MyTeamBusiness/FreedomBusiness";

import TotalActiveUser from "./MyTeamNetwork/TotalActiveUser";
import TotalDirectUser from "./MyTeamNetwork/TotalDirectUser";
import TotalInactiveUser from "./MyTeamNetwork/TotalInactiveUser";

import IncomeReport from "./IncomeReport";

export default function MemberLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hideButtons, setHideButtons] = useState(false);

  const navigate = useNavigate(); // ✅ Fix for redirect

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      setHideButtons(window.scrollY > lastScrollY);
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Dashboard + Logout Buttons */}
      <div
        className={`fixed top-3 right-4 z-50 flex gap-2 transition-all duration-300 
        ${hideButtons || sidebarOpen
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
          }`}
      >
        {isLoggedIn && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700"
          >
            Dashboard
          </button>
        )}

        {isLoggedIn && !sidebarOpen && (
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
          <Route path="/" element={<DashBoardPage />} />

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
        </Routes>
      </div>
    </div>
  );
}
