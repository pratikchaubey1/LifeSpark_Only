import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import config from "../../config/config";
import AdminAutopool from "../admin/AdminAutopool";
import AdminAutopoolTree from "../admin/AdminAutopoolTree";
import DataTable from "../common/DataTable";

/**
 * Final AdminPage.jsx (single-file)
 * - White + blue theme
 * - Sidebar navigation
 * - Pages: Dashboard, Members (fetches only when clicked), E-Pin, Income
 * - Income page shows member-wise income + total income & total balance
  - **Income Overview**: Replace manual mapping and add pagination to the member-wise table. [DONE]
  - **Rewards**: Refactored to use `DataTable`. [DONE]
  - **Withdrawals**: Refactored to use `DataTable` with inline payment editor. [DONE]
  - **KYC**: Refactored to use `DataTable` with inline verification editor. [DONE]
  - **Bank Details**: Refactored to use `DataTable`. [DONE]
  - **Members**: Refactored to use `DataTable`. [DONE]
 */

/* -------------------- Simple inline SVG icons (no external deps) -------------------- */
function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 21V11h14v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCheckCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconKey() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 11a4 4 0 1 0-5.657 3.657L13 17v2h2l1 1h2l1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconDollar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 1v22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 5H9.5a3 3 0 0 0 0 6H14a3 3 0 0 1 0 6H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBank() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10V20M9 10V20M15 10V20M19 10V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3l9 6.5H3L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAward() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRefresh({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSpeaker() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/* -------------------- Reusable small UI components -------------------- */
function SidebarButton({ label, active, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 text-left rounded-md ${active ? "bg-blue-50 text-blue-700 border border-blue-100" : "hover:bg-slate-50 text-slate-700"
        }`}
    >
      <div className="w-5">{icon}</div>
      <div className="flex-1">{label}</div>
    </button>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="p-4 bg-white border rounded shadow-sm">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

/* -------------------- Main component -------------------- */
export default function AdminPage() {
  // Auth & tokens
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken") || null);

  // data
  const [users, setUsers] = useState([]); // user objects expected to have id, name, email, totalIncome, balance, isActivated, inviteCode, activationPin
  const [epins, setEpins] = useState([]);
  const [kycs, setKycs] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [epinHistory, setEpinHistory] = useState([]);
  const [epinStats, setEpinStats] = useState({ totalGenerated: 0, totalUsed: 0, totalTransferred: 0, inPool: 0 });

  // ui
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const path = window.location.pathname.replace(/^\/+/, "");
      if (path.startsWith("admin/")) {
        const sub = path.replace("admin/", "");
        return sub || "dashboard";
      }
      if (path === "admin") return "dashboard";
    } catch (e) { }
    return "dashboard";
  });

  // status
  const [error, setError] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingEpin, setCreatingEpin] = useState(false);
  const [loadingKycs, setLoadingKycs] = useState(false);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [approvingWithdrawalId, setApprovingWithdrawalId] = useState(null);

  const [loadingRewards, setLoadingRewards] = useState(false);
  const [pendingRewards, setPendingRewards] = useState([]);
  const [processingRewardId, setProcessingRewardId] = useState(null);

  const [lookingSponsor, setLookingSponsor] = useState(false);
  const [activatingUserId, setActivatingUserId] = useState(null);

  const [loadingSettings, setLoadingSettings] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    marqueeText: "",
    marqueeEnabled: true,
    popupImageUrl: "",
    popupEnabled: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // admin: create member
  const [creatingMember, setCreatingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    sponsorId: "",
    sponsorName: "",
  });

  // admin: transfer epins
  const [epinTransfer, setEpinTransfer] = useState({ toUserId: "", count: "1" });
  const [transferringEpins, setTransferringEpins] = useState(false);
  const [lastEpinTransfer, setLastEpinTransfer] = useState(null);

  // members: invite people section toggle
  const [expandedInviteUserId, setExpandedInviteUserId] = useState(null);

  // withdrawals: edit payment details (bank/upi) inline
  const [expandedPaymentUserId, setExpandedPaymentUserId] = useState(null);
  const [paymentEdits, setPaymentEdits] = useState({}); // { [userId]: { upiId, upiNo, bankDetails: {...} } }
  const [savingPaymentUserId, setSavingPaymentUserId] = useState(null);

  const [withdrawalFilter, setWithdrawalFilter] = useState("all"); // all, pending, approved, rejected
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [memberPage, setMemberPage] = useState(1);
  const MEMBERS_PER_PAGE = 15;
  const [kycPage, setKycPage] = useState(1);
  const [bankPage, setBankPage] = useState(1);

  // KYC: search and edit
  const [kycSearch, setKycSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [expandedKycId, setExpandedKycId] = useState(null);
  const [kycEdits, setKycEdits] = useState({}); // { [kycId]: { panNo, aadhaarNo, ... } }
  const [savingKycId, setSavingKycId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Member Management
  const [mgmtSearchQuery, setMgmtSearchQuery] = useState("");
  const [mgmtUser, setMgmtUser] = useState(null); // The user being edited
  const [searchingMgmt, setSearchingMgmt] = useState(false);
  const [updatingMgmt, setUpdatingMgmt] = useState(false);
  // Marriage Fund
  const [mfSearch, setMfSearch] = useState("");
  const [mfUser, setMfUser] = useState(null);
  const [mfAmount, setMfAmount] = useState("");
  const [mfMessage, setMfMessage] = useState(null);
  const [mfLoading, setMfLoading] = useState(false);

  // Accident Fund
  const [afSearch, setAfSearch] = useState("");
  const [afUser, setAfUser] = useState(null);
  const [afAmount, setAfAmount] = useState("");
  const [afMessage, setAfMessage] = useState(null);
  const [afLoading, setAfLoading] = useState(false);

  async function handleMfSearch() {
    if (!mfSearch.trim()) return;
    setMfLoading(true);
    setMfUser(null);
    setMfMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/search/${mfSearch.trim()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "User not found");
      setMfUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setMfLoading(false);
    }
  }

  async function handleAddMf() {
    if (!mfUser || !mfAmount) return;
    setMfLoading(true);
    setMfMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/marriage-fund/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ userId: mfUser._id, amount: mfAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add funds");
      setMfUser(data.user);
      setMfMessage({ type: 'success', text: data.message });
      setMfAmount("");
    } catch (err) {
      setError(err.message);
    } finally {
      setMfLoading(false);
    }
  }

  async function handleAfSearch() {
    if (!afSearch.trim()) return;
    setAfLoading(true);
    setAfUser(null);
    setAfMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/search/${afSearch.trim()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "User not found");
      setAfUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setAfLoading(false);
    }
  }

  async function handleAddAf() {
    if (!afUser || !afAmount) return;
    setAfLoading(true);
    setAfMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/accident-fund/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ userId: afUser._id, amount: afAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add funds");
      setAfUser(data.user);
      setAfMessage({ type: 'success', text: data.message });
      setAfAmount("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAfLoading(false);
    }
  }

  const API_BASE = config.apiUrl;

  // site name (optional)
  const [siteName, setSiteName] = useState("My Website");

  useEffect(() => {
    if (adminToken) {
      // fetch epins & site stats eagerly (users are loaded lazily when Members clicked)
      fetchEpins(adminToken);
      fetchStats(adminToken);

      // If we are on a page that needs users, fetch them
      if (currentPage === "members" || currentPage === "bank" || currentPage === "activateUsers") {
        fetchUsers(adminToken);
      }
      if (currentPage === "rewards") {
        fetchPendingRewards(adminToken);
      }
      if (currentPage === "settings") {
        fetchSiteSettings(adminToken);
      }
      if (currentPage === "epin") {
        fetchEpinStats(adminToken);
        fetchEpinHistory(adminToken);
      }
    }
    // handle browser back/forward
    const onPop = () => {
      try {
        const p = window.location.pathname.replace(/^\/+/, "");
        if (p.startsWith("admin/")) {
          const sub = p.replace("admin/", "");
          setCurrentPage(sub || "dashboard");
        } else if (p === "admin") {
          setCurrentPage("dashboard");
        }
      } catch (e) { }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [adminToken, currentPage]);

  // ---------- API actions (adjust endpoints as needed) ----------
  async function handleAdminLogin(e) {
    e?.preventDefault?.();
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("adminToken", data.token);
      setAdminToken(data.token);
      // fetch initial small data
      fetchEpins(data.token);
      fetchStats(data.token);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  async function fetchUsers(token) {
    if (!token) return;
    setLoadingUsers(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        setAdminToken(null);
        setUsers([]);
        setError(data.message || "Unauthorized");
        setLoadingUsers(false);
        return;
      }
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function searchMgmtUser() {
    if (!mgmtSearchQuery.trim()) return;
    setSearchingMgmt(true);
    setMgmtUser(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/search/${encodeURIComponent(mgmtSearchQuery.trim())}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "User not found");
      setMgmtUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearchingMgmt(false);
    }
  }

  async function updateMgmtUser() {
    if (!mgmtUser || !mgmtUser._id) return;
    setUpdatingMgmt(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${mgmtUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(mgmtUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user");
      toast.success("User updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingMgmt(false);
    }
  }

  async function fetchEpins(token) {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/epins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) return; // optional endpoint
      const data = await res.json();
      if (res.ok) {
        setEpins(data.epins || (data.epin ? [data.epin] : []));
      }
    } catch (err) {
      // non-blocking
    }
  }

  async function fetchEpinHistory(token) {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/epins/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEpinHistory(data.history || []);
      }
    } catch (err) { }
  }

  async function fetchEpinStats(token) {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/epins/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEpinStats(data);
      }
    } catch (err) { }
  }

  async function createMember() {
    if (!adminToken) return;
    setCreatingMember(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newMember),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create member");

      // add to current list
      setUsers((prev) => [{ ...data.user }, ...prev]);
      setNewMember({ name: "", email: "", password: "", phone: "", sponsorId: "", sponsorName: "" });
    } catch (err) {
      setError(err.message || "Failed to create member");
    } finally {
      setCreatingMember(false);
    }
  }

  // Auto-fill sponsor name when invite code is entered
  async function lookupSponsor(inviteCode) {
    if (!inviteCode || inviteCode.trim().length < 3) {
      setNewMember((s) => ({ ...s, sponsorName: "" }));
      return;
    }

    setLookingSponsor(true);
    try {
      const res = await fetch(`${API_BASE}/auth/sponsor/${encodeURIComponent(inviteCode.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.sponsor?.name) {
          setNewMember((s) => ({ ...s, sponsorName: data.sponsor.name }));
        }
      } else {
        setNewMember((s) => ({ ...s, sponsorName: "" }));
      }
    } catch (err) {
      // Silent fail - user can still manually enter sponsor name
    } finally {
      setLookingSponsor(false);
    }
  }

  async function transferEpinsFromPool() {
    if (!adminToken) return;
    setTransferringEpins(true);
    setError(null);
    setLastEpinTransfer(null);
    try {
      const countNum = Number(epinTransfer.count);
      const res = await fetch(`${API_BASE}/admin/epins/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ toUserId: epinTransfer.toUserId, count: countNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to transfer epins");

      setLastEpinTransfer(data.transfer);
      // refresh pool pins list (transferred pins should disappear)
      fetchEpins(adminToken);
    } catch (err) {
      setError(err.message || "Failed to transfer epins");
    } finally {
      setTransferringEpins(false);
    }
  }

  async function createEpin() {
    if (!adminToken) {
      setError("Not authenticated");
      return;
    }
    setCreatingEpin(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/epins`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ count: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        const newList = data.epins || (data.epin ? [data.epin] : []);
        setEpins((s) => [...newList, ...s]);
      } else {
        // fallback to client-gen
        const local = generateRandomEpin();
        setEpins((s) => [local, ...s]);
      }
    } catch (err) {
      const local = generateRandomEpin();
      setEpins((s) => [local, ...s]);
    } finally {
      setCreatingEpin(false);
    }
  }

  function generateRandomEpin() {
    const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${part()}-${part()}-${part()}`;
  }

  async function fetchStats(token) {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.siteName) setSiteName(data.siteName);
    } catch (e) { }
  }

  function handleLogout() {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    setUsers([]);
    // optional: navigate to root
    try {
      window.history.pushState({}, "", "/");
    } catch (e) { }
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(String(text));
    } catch (e) {
      // ignore (clipboard might be blocked)
    }
  }

  // ---------- Derived totals for Income page ----------
  const totalIncome = users.reduce((s, u) => s + (Number(u?.totalIncome) || 0), 0);
  const totalBalance = users.reduce((s, u) => s + (Number(u?.balance) || 0), 0);

  // ---------- Navigation helper ----------
  async function updateUserRole(userId, role) {
    if (!adminToken) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update role");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: data.user?.role || role } : u)));
    } catch (err) {
      setError(err.message || "Failed to update role");
    }
  }

  async function fetchKycs(token) {
    if (!token) return;
    setLoadingKycs(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/kyc`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch KYC");
      setKycs(Array.isArray(data.kycs) ? data.kycs : []);
    } catch (err) {
      setError(err.message || "Failed to fetch KYC");
    } finally {
      setLoadingKycs(false);
    }
  }

  async function fetchWithdrawals(token) {
    if (!token) return;
    setLoadingWithdrawals(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch withdrawals");
      setWithdrawals(Array.isArray(data.withdrawals) ? data.withdrawals : []);
    } catch (err) {
      setError(err.message || "Failed to fetch withdrawals");
    } finally {
      setLoadingWithdrawals(false);
    }
  }

  async function approveWithdrawal(withdrawalId) {
    if (!adminToken) return;
    setApprovingWithdrawalId(withdrawalId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/withdrawals/${withdrawalId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to approve withdrawal");

      // update list in-place (also refresh user balance if backend returned it)
      setWithdrawals((prev) =>
        prev.map((w) =>
          (w._id || w.id) === withdrawalId
            ? {
              ...w,
              ...data.withdrawal,
              status: data.withdrawal?.status || "approved",
              user: w.user
                ? {
                  ...w.user,
                  ...(data.user?.balance !== undefined
                    ? { balance: data.user.balance }
                    : {}),
                  ...(data.user?.withdrawal !== undefined
                    ? { withdrawal: data.user.withdrawal }
                    : {}),
                }
                : w.user,
            }
            : w
        )
      );

      // keep members list somewhat fresh (balances change)
      if (users.length > 0) {
        fetchUsers(adminToken);
      }
    } catch (err) {
      setError(err.message || "Failed to approve withdrawal");
    } finally {
      setApprovingWithdrawalId(null);
    }
  }

  async function rejectWithdrawal(withdrawalId) {
    if (!adminToken) return;
    setApprovingWithdrawalId(withdrawalId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/withdrawals/${withdrawalId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject withdrawal");

      setWithdrawals((prev) =>
        prev.map((w) =>
          (w._id || w.id) === withdrawalId
            ? { ...w, ...data.withdrawal, status: "rejected" }
            : w
        )
      );
    } catch (err) {
      setError(err.message || "Failed to reject withdrawal");
    } finally {
      setApprovingWithdrawalId(null);
    }
  }

  async function fetchPendingRewards(token) {
    if (!token) return;
    setLoadingRewards(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/rewards/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch pending rewards");
      setPendingRewards(data.pendingRewards || []);
    } catch (err) {
      setError(err.message || "Failed to fetch pending rewards");
    } finally {
      setLoadingRewards(false);
    }
  }

  async function processReward(userId, level) {
    if (!adminToken) return;
    setProcessingRewardId(`${userId}-${level}`);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/rewards/${userId}/${level}/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to process reward");

      // remove from pending list
      setPendingRewards(prev => prev.filter(r => !(r.userId === userId && r.level === level)));
    } catch (err) {
      setError(err.message || "Failed to process reward");
    } finally {
      setProcessingRewardId(null);
    }
  }

  async function fetchSiteSettings(token) {
    if (!token) return;
    setLoadingSettings(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch settings");
      setSiteSettings(data);
    } catch (err) {
      setError(err.message || "Failed to fetch settings");
    } finally {
      setLoadingSettings(false);
    }
  }

  async function updateSiteSettings() {
    if (!adminToken) return;
    setSavingSettings(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(siteSettings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update settings");
      toast.success("Settings updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  }

  function openPaymentEditor(user) {
    if (!user?.id) return;
    setExpandedPaymentUserId((prev) => (prev === user.id ? null : user.id));

    setPaymentEdits((prev) => {
      // keep existing edits if already started
      if (prev[user.id]) return prev;

      return {
        ...prev,
        [user.id]: {
          upiId: user.upiId || "",
          upiNo: user.upiNo || "",
          bankDetails: {
            accountHolder: user.bankDetails?.accountHolder || "",
            bankName: user.bankDetails?.bankName || "",
            accountNo: user.bankDetails?.accountNo || "",
            ifsc: user.bankDetails?.ifsc || "",
            branchName: user.bankDetails?.branchName || "",
          },
        },
      };
    });
  }

  function updatePaymentEdit(userId, field, value) {
    setPaymentEdits((prev) => {
      const current = prev[userId] || { upiId: "", upiNo: "", bankDetails: {} };

      if (field.startsWith("bankDetails.")) {
        const key = field.replace("bankDetails.", "");
        return {
          ...prev,
          [userId]: {
            ...current,
            bankDetails: {
              ...(current.bankDetails || {}),
              [key]: key === "ifsc" ? String(value || "").toUpperCase() : value,
            },
          },
        };
      }

      return {
        ...prev,
        [userId]: { ...current, [field]: value },
      };
    });
  }

  async function savePaymentDetails(userId) {
    if (!adminToken || !userId) return;
    const payload = paymentEdits[userId];
    if (!payload) return;

    setSavingPaymentUserId(userId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/payment-details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          upiId: payload.upiId,
          upiNo: payload.upiNo,
          bankDetails: payload.bankDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update payment details");

      // update users list (if loaded)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data.user } : u)));

      // update withdrawals list so admin sees latest bank/upi lines
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.user?.id === userId
            ? {
              ...w,
              user: {
                ...(w.user || {}),
                upiId: data.user?.upiId || "",
                upiNo: data.user?.upiNo || "",
                bankDetails: data.user?.bankDetails || null,
              },
            }
            : w
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update payment details");
    } finally {
      setSavingPaymentUserId(null);
    }
  }

  async function activateUser(userId) {
    if (!adminToken || !userId) return;
    setActivatingUserId(userId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/activate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to activate user");

      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActivated: true, ...data.user } : u));
    } catch (err) {
      setError(err.message || "Failed to activate user");
    } finally {
      setActivatingUserId(null);
    }
  }

  function openKycEditor(kyc) {
    if (!kyc?.id && !kyc?._id) return;
    const id = kyc.id || kyc._id;
    setExpandedKycId((prev) => (prev === id ? null : id));

    setKycEdits((prev) => {
      if (prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          panNo: kyc.panNo || "",
          aadhaarNo: kyc.aadhaarNo || "",
          aadhaarAddress: kyc.aadhaarAddress || "",
          issuedState: kyc.issuedState || "",
          status: kyc.status || "pending",
          remarks: kyc.remarks || "",
        },
      };
    });
  }

  function updateKycEdit(kycId, field, value) {
    setKycEdits((prev) => ({
      ...prev,
      [kycId]: {
        ...(prev[kycId] || {}),
        [field]: value,
      },
    }));
  }

  async function saveKycDetails(kycId) {
    if (!adminToken || !kycId) return;
    const payload = kycEdits[kycId];
    if (!payload) return;

    setSavingKycId(kycId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/kyc/${kycId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update KYC");

      // update local state
      setKycs((prev) => prev.map((k) => ((k.id || k._id) === kycId ? data.kyc : k)));
      setExpandedKycId(null);
    } catch (err) {
      setError(err.message || "Failed to update KYC");
    } finally {
      setSavingKycId(null);
    }
  }

  function openPage(page) {
    setCurrentPage(page);
    setMemberPage(1);
    setWithdrawalPage(1);
    try {
      window.history.pushState({}, "", `/admin/${page}`);
    } catch (e) { }
    // lazy-load users when going to members/bank details/activate
    if ((page === "members" || page === "bank" || page === "activateUsers") && users.length === 0 && adminToken) {
      fetchUsers(adminToken);
    }
    if (page === "kyc" && kycs.length === 0 && adminToken) {
      fetchKycs(adminToken);
    }
    if (page === "withdrawals" && withdrawals.length === 0 && adminToken) {
      fetchWithdrawals(adminToken);
    }
  }

  /* -------------------- Render -------------------- */
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border rounded shadow p-6">
          <h1 className="text-2xl font-semibold mb-4 text-slate-800">Admin Login</h1>

          {error && <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded border">{error}</div>}

          <form onSubmit={handleAdminLogin} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Default: <span className="font-mono">admin / admin123</span></div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Sign in</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderActivationPage() {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">User Activation</h2>
        <p className="text-sm text-slate-500 mb-6">Manually activate registered users.</p>

        {loadingUsers && <div className="p-4 text-center">Loading users...</div>}

        {!loadingUsers && (
          <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3 text-slate-500">{u.phone}</td>
                      <td className="px-4 py-3">
                        {u.isActivated ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.isActivated ? (
                          <span className="text-xs text-slate-400 font-medium px-3 py-1">Activated</span>
                        ) : (
                          <button
                            onClick={() => activateUser(u.id)}
                            disabled={activatingUserId === u.id}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-3 py-1 text-xs font-medium transition-colors"
                          >
                            {activatingUserId === u.id ? "Activating..." : "Activate Now"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* Main admin UI */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex relative">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-xl transform transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">A</div>
            <div>
              <div className="font-semibold truncate max-w-[140px]">{siteName}</div>
              <div className="text-xs text-slate-500">Admin Panel</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 rounded hover:bg-slate-100 text-slate-500">
            <IconClose />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4 pt-0">
          <SidebarButton label="Dashboard" active={currentPage === "dashboard"} icon={<IconHome />} onClick={() => { openPage("dashboard"); setSidebarOpen(false); }} />
          <SidebarButton label="Member Details" active={currentPage === "member-mgmt"} icon={<IconUsers />} onClick={() => { openPage("member-mgmt"); setSidebarOpen(false); }} />
          <SidebarButton label="Members" active={currentPage === "members"} icon={<IconUsers />} onClick={() => { openPage("members"); setSidebarOpen(false); }} />
          <SidebarButton label="Bank Details" active={currentPage === "bank"} icon={<IconBank />} onClick={() => { openPage("bank"); setSidebarOpen(false); }} />
          <SidebarButton label="KYC" active={currentPage === "kyc"} icon={<IconFile />} onClick={() => { openPage("kyc"); setSidebarOpen(false); }} />
          <SidebarButton label="Withdrawals" active={currentPage === "withdrawals"} icon={<IconDollar />} onClick={() => { openPage("withdrawals"); setSidebarOpen(false); }} />
          <SidebarButton label="E-Pin" active={currentPage === "epin"} icon={<IconKey />} onClick={() => { openPage("epin"); setSidebarOpen(false); }} />
          <SidebarButton label="Income" active={currentPage === "income"} icon={<IconDollar />} onClick={() => { openPage("income"); setSidebarOpen(false); }} />
          <SidebarButton label="Autopool Requests" active={currentPage === "autopool"} icon={<IconUsers />} onClick={() => { openPage("autopool"); setSidebarOpen(false); }} />
          <SidebarButton label="Autopool Tree" active={currentPage === "autopool-tree"} icon={<IconUsers />} onClick={() => { openPage("autopool-tree"); setSidebarOpen(false); }} />
          <SidebarButton label="Marriage Fund" active={currentPage === "marriageFund"} icon={<IconDollar />} onClick={() => { openPage("marriageFund"); setSidebarOpen(false); }} />
          <SidebarButton label="Accident Fund" active={currentPage === "accidentFund"} icon={<IconDollar />} onClick={() => { openPage("accidentFund"); setSidebarOpen(false); }} />
          <SidebarButton
            label="Rewards"
            active={currentPage === "rewards"}
            icon={<IconAward />}
            onClick={() => { openPage("rewards"); setSidebarOpen(false); }}
          />
          <SidebarButton
            label="Site Content"
            active={currentPage === "site"}
            icon={<IconFile />}
            onClick={() => { openPage("site"); setSidebarOpen(false); }}
          />
          <SidebarButton
            label="User Activation"
            active={currentPage === "activateUsers"}
            icon={<IconCheckCircle />}
            onClick={() => { openPage("activateUsers"); setSidebarOpen(false); }}
          />
          <SidebarButton
            label="Site Settings"
            active={currentPage === "settings"}
            icon={<IconSettings />}
            onClick={() => { openPage("settings"); setSidebarOpen(false); }}
          />
        </nav>

        <div className="p-4 bg-slate-50 border-t">
          <div className="text-xs text-slate-500 mb-2 font-medium">Quick Actions</div>
          <div className="flex gap-2 mb-4">
            <button onClick={createEpin} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 transition">{creatingEpin ? "..." : "New Pin"}</button>
            <button onClick={() => fetchEpins(adminToken)} className="flex-1 border border-slate-300 bg-white px-3 py-2 rounded text-xs font-medium hover:bg-slate-50 text-slate-700 transition">Refresh</button>
          </div>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span>Logged in as <span className="font-mono font-medium text-slate-700">admin</span></span>
              <button onClick={handleLogout} className="text-red-600 hover:underline flex items-center gap-1">
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        {/* Header - Mobile Menu Button */}
        <div className="flex items-center justify-between p-4 border-b bg-white md:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-600" onClick={() => setSidebarOpen(true)}>
              <IconMenu />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">Admin Panel</h1>
          </div>
          {/* Maybe add small avatar or notification icon here */}
        </div>

        <div className={`flex-1 p-4 md:p-8 scroll-smooth`}>
          {/* Desktop Header Title (Hidden on Mobile as we have the top bar) */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <div className="text-sm px-3 py-1 bg-white border rounded-full text-slate-600 shadow-sm">{siteName}</div>
          </div>


          <div className={`bg-white border rounded-lg p-4`}>
            {/* Dashboard page */}
            {currentPage === "dashboard" && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard title="Total Members" value={users.length} />
                  <StatCard title="Active Members" value={users.filter((u) => u.isActivated).length} />
                  <StatCard title="Inactive Members" value={users.filter((u) => !u.isActivated).length} />
                  <StatCard title="E-Pins" value={epins.length} />
                </div>
              </div>
            )}

            {/* Members page - visible only when clicked */}
            {currentPage === "members" && (
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h2 className="text-lg font-semibold">Members</h2>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search name, ID or code..."
                      value={memberSearch}
                      onChange={(e) => { setMemberSearch(e.target.value); setMemberPage(1); }}
                      className="border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={() => fetchUsers(adminToken)}
                      disabled={loadingUsers}
                      className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition active:scale-90"
                      title="Refresh Members"
                    >
                      <IconRefresh className={loadingUsers ? "animate-spin text-blue-600" : "text-slate-500"} />
                    </button>
                    <div className="text-xs text-slate-500">Active: <span className="font-mono">{users.filter(u => u.isActivated).length}</span> — Inactive: <span className="font-mono">{users.filter(u => !u.isActivated).length}</span></div>
                  </div>
                </div>

                <div className="mb-4 border rounded p-3 bg-slate-50">
                  <div className="text-sm font-semibold mb-2">Add New Member (WSE Dedicated)</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      value={newMember.name}
                      onChange={(e) => setNewMember((s) => ({ ...s, name: e.target.value }))}
                      className="border rounded px-3 py-2 text-sm"
                      placeholder="Name"
                    />
                    <input
                      value={newMember.email}
                      onChange={(e) => setNewMember((s) => ({ ...s, email: e.target.value }))}
                      className="border rounded px-3 py-2 text-sm"
                      placeholder="Email"
                    />
                    <input
                      value={newMember.password}
                      onChange={(e) => setNewMember((s) => ({ ...s, password: e.target.value }))}
                      className="border rounded px-3 py-2 text-sm"
                      placeholder="Password"
                      type="text"
                    />
                    <input
                      value={newMember.phone}
                      onChange={(e) => setNewMember((s) => ({ ...s, phone: e.target.value }))}
                      className="border rounded px-3 py-2 text-sm"
                      placeholder="Phone (optional)"
                    />
                    <input
                      value={newMember.sponsorId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewMember((s) => ({ ...s, sponsorId: value }));
                        // Auto-lookup sponsor after user stops typing
                        if (value.trim()) {
                          setTimeout(() => lookupSponsor(value), 500);
                        }
                      }}
                      className="border rounded px-3 py-2 text-sm"
                      placeholder="Sponsor invite code (e.g., ADMIN1254)"
                    />
                    <div className="relative">
                      <input
                        value={newMember.sponsorName}
                        onChange={(e) => setNewMember((s) => ({ ...s, sponsorName: e.target.value }))}
                        className="border rounded px-3 py-2 text-sm w-full"
                        placeholder="Sponsor name (auto-filled)"
                        readOnly={lookingSponsor}
                      />
                      {lookingSponsor && (
                        <div className="absolute right-2 top-2.5 text-xs text-gray-500">Looking up...</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={createMember}
                      disabled={creatingMember}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
                    >
                      {creatingMember ? "Creating..." : "Create Member"}
                    </button>
                  </div>
                </div>

                {loadingUsers ? (
                  <div className="text-sm text-slate-500">Loading members...</div>
                ) : (
                  <div className="flex-1 overflow-x-auto border rounded min-h-0">
                    <DataTable
                      headers={[
                        { label: "Name" },
                        { label: "User ID" },
                        { label: "Email" },
                        { label: "Invite Code" },
                        { label: "Invite People" },
                        { label: "Pins (L/U)" },
                        { label: "Role" },
                        { label: "E-Pin" },
                        { label: "Status" },
                        { label: "Balance", className: "text-right" },
                        { label: "Income", className: "text-right" }
                      ]}
                      data={users.filter(u => {
                        const term = memberSearch.trim().toLowerCase();
                        if (!term) return true;
                        return (
                          u.name?.toLowerCase().includes(term) ||
                          u.id?.toLowerCase().includes(term) ||
                          u.email?.toLowerCase().includes(term) ||
                          u.inviteCode?.toLowerCase().includes(term)
                        );
                      })}
                      itemsPerPage={15}
                      emptyMessage="No members found matching your search."
                      externalPage={memberPage}
                      onPageChange={setMemberPage}
                      renderRow={(u) => {
                        const inviteCount = u.directInviteCount ?? (Array.isArray(u.invitees) ? u.invitees.length : 0);
                        const isExpanded = expandedInviteUserId === u.id;

                        return (
                          <React.Fragment key={u.id}>
                            <tr className="border-t hover:bg-slate-50">
                              <td className="p-3">{u.name}</td>
                              <td className="p-3 font-mono text-xs">{u.id}</td>
                              <td className="p-3">{u.email}</td>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(u.inviteCode)}
                                  className="font-mono text-blue-600 hover:underline"
                                  title="Copy invite code"
                                >
                                  {u.inviteCode}
                                </button>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-600">{inviteCount}</span>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedInviteUserId((prev) => (prev === u.id ? null : u.id))}
                                    className="border px-2 py-1 rounded text-xs hover:bg-white"
                                  >
                                    {isExpanded ? "Hide" : "View"}
                                  </button>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col text-[10px] font-bold">
                                  <span className="text-emerald-600">L: {u.leftWithMe ?? 0}</span>
                                  <span className="text-amber-600">U: {u.usedByMe ?? 0}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <select
                                  value={u.role || "member"}
                                  onChange={(e) => updateUserRole(u.id, e.target.value)}
                                  className="border rounded px-2 py-1 text-xs"
                                >
                                  <option value="member">member</option>
                                  <option value="franchise">franchise</option>
                                </select>
                              </td>
                              <td className="p-3 font-mono">{u.activationPin || "-"}</td>
                              <td className="p-3">
                                {u.isActivated ? (
                                  <span className="text-green-600 font-semibold">Active</span>
                                ) : (
                                  <span className="text-slate-500">Inactive</span>
                                )}
                              </td>
                              <td className="p-3 text-right font-mono">₹{u.balance ?? 0}</td>
                              <td className="p-3 text-right font-semibold text-green-600 font-mono">₹{u.totalIncome ?? 0}</td>
                            </tr>

                            {isExpanded && (
                              <tr className="border-t bg-slate-50/60">
                                <td colSpan={10} className="p-4">
                                  <div className="max-w-2xl bg-white border rounded shadow p-3">
                                    <div className="font-semibold text-sm mb-2">People Invited by {u.name}</div>
                                    {Array.isArray(u.invitees) && u.invitees.length > 0 ? (
                                      <div className="space-y-1">
                                        {u.invitees.map((inv, idx) => (
                                          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                                            <div>
                                              <span className="font-medium">{inv.name}</span>
                                              <span className="ml-2 text-slate-500">({inv.email})</span>
                                            </div>
                                            <div className="font-mono text-[10px] text-slate-400">{inv.id}</div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-slate-500">No invitees found.</div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bank Details page */}
            {currentPage === "bank" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">All Bank Details</h2>
                  <div className="text-xs text-slate-500">{users.length} members</div>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => fetchUsers(adminToken)}
                    disabled={loadingUsers}
                    className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-white hover:bg-slate-50 transition active:scale-95 shadow-sm"
                  >
                    <IconRefresh className={loadingUsers ? "animate-spin text-blue-600" : "text-slate-500"} />
                    <span className="text-sm font-medium text-slate-700">Refresh Bank Lists</span>
                  </button>
                </div>

                {loadingUsers ? (
                  <div className="text-sm text-slate-500">Loading members...</div>
                ) : (
                  <DataTable
                    headers={[
                      { label: "User" },
                      { label: "UPI" },
                      { label: "Account Holder" },
                      { label: "Bank" },
                      { label: "Account No" },
                      { label: "IFSC" },
                      { label: "Branch" }
                    ]}
                    data={users}
                    renderRow={(u) => {
                      const b = u.bankDetails || {};
                      return (
                        <tr key={u.id} className="border-t hover:bg-slate-50">
                          <td className="p-3">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.id}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs">{u.upiId || "-"}</div>
                            <div className="text-xs text-slate-500">{u.upiNo || ""}</div>
                          </td>
                          <td className="p-3 text-xs">{b.accountHolder || "-"}</td>
                          <td className="p-3 text-xs">{b.bankName || "-"}</td>
                          <td className="p-3 font-mono text-xs">{b.accountNo || "-"}</td>
                          <td className="p-3 font-mono text-xs">{b.ifsc || "-"}</td>
                          <td className="p-3 text-xs">{b.branchName || "-"}</td>
                        </tr>
                      );
                    }}
                  />
                )}
              </div>
            )}

            {/* KYC page */}
            {currentPage === "kyc" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">KYC Uploads</h2>
                  <div className="text-xs text-slate-500">{kycs.length} records</div>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => fetchKycs(adminToken)}
                    disabled={loadingKycs}
                    className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-white hover:bg-slate-50 transition active:scale-95 shadow-sm"
                  >
                    <IconRefresh className={loadingKycs ? "animate-spin text-blue-600" : "text-slate-500"} />
                    <span className="text-sm font-medium text-slate-700">Refresh KYC Records</span>
                  </button>
                </div>

                {loadingKycs ? (
                  <div className="text-sm text-slate-500">Loading KYC records...</div>
                ) : (
                  <DataTable
                    headers={[
                      { label: "User" },
                      { label: "Invite Code" },
                      { label: "Email" },
                      { label: "PAN / Aadhaar" },
                      { label: "Status" },
                      { label: "Updated" },
                      { label: "Documents" },
                      { label: "Action", className: "text-right" }
                    ]}
                    data={kycs.filter(k => {
                      const search = kycSearch.toLowerCase().trim();
                      if (!search) return true;
                      const ic = (k.user?.inviteCode || "").toLowerCase();
                      const pan = (k.panNo || "").toLowerCase();
                      const name = (k.user?.name || "").toLowerCase();
                      return ic.includes(search) || pan.includes(search) || name.includes(search);
                    })}
                    itemsPerPage={15}
                    emptyMessage="No KYC records found matching your search."
                    externalPage={kycPage}
                    onPageChange={setKycPage}
                    searchComponent={
                      <div className="flex items-center gap-2">
                        <input
                          value={kycSearch}
                          onChange={(e) => { setKycSearch(e.target.value); setKycPage(1); }}
                          placeholder="Search by Invite Code or PAN..."
                          className="border rounded-lg px-3 py-2 text-sm w-full max-w-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {kycSearch && (
                          <button onClick={() => { setKycSearch(""); setKycPage(1); }} className="text-xs text-blue-600 hover:underline font-medium">Clear</button>
                        )}
                      </div>
                    }
                    renderRow={(k) => {
                      const kycId = k.id || k._id;
                      const isExpanded = expandedKycId === kycId;
                      const edit = kycEdits[kycId];

                      return (
                        <React.Fragment key={kycId}>
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 border-t">
                              <div className="font-semibold text-slate-700">{k.user?.name || k.userId}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{k.userId}</div>
                            </td>
                            <td className="p-4 border-t">
                              <span className="font-mono text-blue-600 bg-blue-50/30 px-2 py-0.5 rounded-md">
                                {k.user?.inviteCode || "-"}
                              </span>
                            </td>
                            <td className="p-4 border-t text-slate-500">{k.user?.email || "-"}</td>
                            <td className="p-4 border-t">
                              <div className="text-xs space-y-1 text-slate-600">
                                <div className="flex items-center gap-2"><span className="text-slate-400 font-medium">PAN:</span> <span className="font-mono">{k.panNo || "-"}</span></div>
                                <div className="flex items-center gap-2"><span className="text-slate-400 font-medium">UID:</span> <span className="font-mono">{k.aadhaarNo || "-"}</span></div>
                              </div>
                            </td>
                            <td className="p-4 border-t">
                              {k.status === 'approved' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Approved
                                </span>
                              ) : k.status === 'rejected' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="p-4 border-t text-slate-400 text-xs">{k.updatedAt ? String(k.updatedAt).slice(0, 10) : "-"}</td>
                            <td className="p-4 border-t">
                              <div className="flex flex-wrap gap-2">
                                {k.documents &&
                                  Object.entries(k.documents)
                                    .filter(([, v]) => v && (typeof v === 'string' ? v : v.filePath))
                                    .map(([key, v]) => (
                                      <a
                                        key={key}
                                        href={`${config.apiUrl}${typeof v === 'string' ? v : v.filePath}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-blue-600 hover:bg-blue-50 text-[10px] font-bold uppercase transition-colors"
                                      >
                                        {key}
                                      </a>
                                    ))}
                              </div>
                            </td>
                            <td className="p-4 border-t text-right">
                              <button
                                onClick={() => openKycEditor(k)}
                                className="inline-flex items-center px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
                              >
                                {isExpanded ? "Close" : "Review"}
                              </button>
                            </td>
                          </tr>

                          {isExpanded && edit && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={8} className="p-6">
                                <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 max-w-4xl mx-auto text-left">
                                  <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-slate-800">KYC Verification Details</h3>
                                    <button
                                      onClick={() => setExpandedKycId(null)}
                                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                      <IconClose />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Verification Status</label>
                                        <select
                                          value={edit.status}
                                          onChange={(e) => updateKycEdit(kycId, "status", e.target.value)}
                                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                          <option value="pending">Mark as Pending</option>
                                          <option value="approved">Approve KYC</option>
                                          <option value="rejected">Reject KYC</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">PAN Number</label>
                                        <input
                                          value={edit.panNo}
                                          onChange={(e) => updateKycEdit(kycId, "panNo", e.target.value.toUpperCase())}
                                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                          placeholder="ABCDE1234F"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Aadhaar Number</label>
                                        <input
                                          value={edit.aadhaarNo}
                                          onChange={(e) => updateKycEdit(kycId, "aadhaarNo", e.target.value)}
                                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                          placeholder="0000 0000 0000"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admin Remarks</label>
                                        <input
                                          value={edit.rejectReason || edit.remarks || ""}
                                          onChange={(e) => updateKycEdit(kycId, "remarks", e.target.value)}
                                          placeholder="Internal notes or rejection reason..."
                                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex items-end pb-1">
                                      <button
                                        onClick={() => saveKycDetails(kycId)}
                                        disabled={savingKycId === kycId}
                                        className="w-full bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                                      >
                                        {savingKycId === kycId ? "Processing..." : "Update Verification"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    }}
                  />
                )}
              </div >
            )}

            {currentPage === "member-mgmt" && (
              <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Member Details Management</h2>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Find Member</label>
                  <div className="flex gap-2 max-w-md">
                    <input
                      value={mgmtSearchQuery}
                      onChange={(e) => setMgmtSearchQuery(e.target.value)}
                      placeholder="Invite Code, Email, or Name..."
                      className="flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      onKeyDown={(e) => e.key === "Enter" && searchMgmtUser()}
                    />
                    <button
                      onClick={searchMgmtUser}
                      disabled={searchingMgmt}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
                    >
                      {searchingMgmt ? "Searching..." : "Search"}
                    </button>
                  </div>
                </div>

                {mgmtUser && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn pb-20">
                    {/* Left Column: Basic & Referral */}
                    <div className="space-y-6">
                      <div className="bg-white border rounded-2xl shadow-sm p-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Basic Information</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                            <input
                              value={mgmtUser.name || ""}
                              onChange={(e) => setMgmtUser({ ...mgmtUser, name: e.target.value })}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                            <input
                              value={mgmtUser.email || ""}
                              onChange={(e) => setMgmtUser({ ...mgmtUser, email: e.target.value })}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                              <input
                                value={mgmtUser.phone || ""}
                                onChange={(e) => setMgmtUser({ ...mgmtUser, phone: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  value={mgmtUser.password || ""}
                                  onChange={(e) => setMgmtUser({ ...mgmtUser, password: e.target.value })}
                                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                >
                                  {showPassword ? (
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878l4.242 4.242" /></svg>
                                  ) : (
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  )}
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm("Reset password to '123456'?")) {
                                    setMgmtUser({ ...mgmtUser, password: '123456' });
                                    setShowPassword(true);
                                  }
                                }}
                                className="mt-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tight"
                              >
                                Reset to 123456
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
                            <textarea
                              value={mgmtUser.address || ""}
                              onChange={(e) => setMgmtUser({ ...mgmtUser, address: e.target.value })}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none h-20"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border rounded-2xl shadow-sm p-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Referral Information</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Invite Code</label>
                              <input
                                value={mgmtUser.inviteCode || ""}
                                onChange={(e) => setMgmtUser({ ...mgmtUser, inviteCode: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Sponsor ID</label>
                              <input
                                value={mgmtUser.sponsorId || ""}
                                onChange={(e) => setMgmtUser({ ...mgmtUser, sponsorId: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Sponsor Name</label>
                            <input
                              value={mgmtUser.sponsorName || ""}
                              onChange={(e) => setMgmtUser({ ...mgmtUser, sponsorName: e.target.value })}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Financial & Bank */}
                    <div className="space-y-6">
                      <div className="bg-white border rounded-2xl shadow-sm p-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Financial Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Current Balance</label>
                            <input
                              type="number"
                              value={mgmtUser.balance || 0}
                              onChange={(e) => setMgmtUser({ ...mgmtUser, balance: e.target.value })}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Total Income</label>
                            <input
                              type="number"
                              value={mgmtUser.totalIncome || 0}
                              onChange={(e) => setMgmtUser({ ...mgmtUser, totalIncome: e.target.value })}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Total Withdrawal</label>
                            <input
                              type="number"
                              value={mgmtUser.withdrawal || 0}
                              onChange={(e) => setMgmtUser({ ...mgmtUser, withdrawal: e.target.value })}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-red-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">User Role</label>
                            <select
                              value={mgmtUser.role || "member"}
                              onChange={(e) => setMgmtUser({ ...mgmtUser, role: e.target.value })}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            >
                              <option value="member">Member</option>
                              <option value="franchise">Franchise</option>
                            </select>
                          </div>
                          <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Pins Left</label>
                              <div className="w-full border rounded-lg px-3 py-2 text-sm bg-emerald-50 font-bold text-emerald-600">
                                {mgmtUser.leftWithMe ?? 0}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Pins Used</label>
                              <div className="w-full border rounded-lg px-3 py-2 text-sm bg-amber-50 font-bold text-amber-600">
                                {mgmtUser.usedByMe ?? 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border rounded-2xl shadow-sm p-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Bank & UPI Details</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">UPI ID</label>
                              <input
                                value={mgmtUser.upiId || ""}
                                onChange={(e) => setMgmtUser({ ...mgmtUser, upiId: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">UPI Mobile</label>
                              <input
                                value={mgmtUser.upiNo || ""}
                                onChange={(e) => setMgmtUser({ ...mgmtUser, upiNo: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                              />
                            </div>
                          </div>
                          <div className="border-t pt-4 mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Account Holder Name</label>
                                <input
                                  value={mgmtUser.bankDetails?.accountHolder || ""}
                                  onChange={(e) => setMgmtUser({ ...mgmtUser, bankDetails: { ...mgmtUser.bankDetails, accountHolder: e.target.value } })}
                                  className="w-full border rounded-lg px-3 py-2 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Bank Name</label>
                                <input
                                  value={mgmtUser.bankDetails?.bankName || ""}
                                  onChange={(e) => setMgmtUser({ ...mgmtUser, bankDetails: { ...mgmtUser.bankDetails, bankName: e.target.value } })}
                                  className="w-full border rounded-lg px-3 py-2 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Account Number</label>
                                <input
                                  value={mgmtUser.bankDetails?.accountNo || ""}
                                  onChange={(e) => setMgmtUser({ ...mgmtUser, bankDetails: { ...mgmtUser.bankDetails, accountNo: e.target.value } })}
                                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">IFSC Code</label>
                                <input
                                  value={mgmtUser.bankDetails?.ifsc || ""}
                                  onChange={(e) => setMgmtUser({ ...mgmtUser, bankDetails: { ...mgmtUser.bankDetails, ifsc: e.target.value } })}
                                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Branch Name</label>
                                <input
                                  value={mgmtUser.bankDetails?.branchName || ""}
                                  onChange={(e) => setMgmtUser({ ...mgmtUser, bankDetails: { ...mgmtUser.bankDetails, branchName: e.target.value } })}
                                  className="w-full border rounded-lg px-3 py-2 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-6">
                        <button
                          onClick={() => setMgmtUser(null)}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold border hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={updateMgmtUser}
                          disabled={updatingMgmt}
                          className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {updatingMgmt ? "Saving Changes..." : "Save All Details"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!mgmtUser && !searchingMgmt && (
                  <div className="p-20 text-center border-2 border-dashed rounded-3xl text-slate-400 bg-white/50">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconUsers />
                    </div>
                    <p className="text-sm">Search for a member by Invite Code, Email, or Name to manage their profile.</p>
                  </div>
                )}
              </div>
            )}

            {currentPage === "withdrawals" && (
              <DataTable
                headers={[
                  { label: "ID" },
                  { label: "User" },
                  { label: "UPI" },
                  { label: "Bank" },
                  { label: "Amount", className: "text-right" },
                  { label: "Status" },
                  { label: "Requested" },
                  { label: "Action", className: "text-right" }
                ]}
                data={(() => {
                  let filtered = [...withdrawals];
                  filtered.sort((a, b) => {
                    const da = new Date(a.createdAt || 0).getTime();
                    const db = new Date(b.createdAt || 0).getTime();
                    return db - da;
                  });
                  if (withdrawalFilter !== "all") {
                    filtered = filtered.filter(w => w.status === withdrawalFilter);
                  }
                  return filtered;
                })()}
                itemsPerPage={10}
                emptyMessage="No withdrawal requests found."
                externalPage={withdrawalPage}
                onPageChange={setWithdrawalPage}
                searchComponent={
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Filter Status:</span>
                      <select
                        value={withdrawalFilter}
                        onChange={(e) => { setWithdrawalFilter(e.target.value); setWithdrawalPage(1); }}
                        className="border rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending Only</option>
                        <option value="approved">Approved Only</option>
                        <option value="rejected">Rejected Only</option>
                      </select>
                    </div>
                    <button
                      onClick={() => fetchWithdrawals(adminToken)}
                      disabled={loadingWithdrawals}
                      className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                      <IconRefresh className={loadingWithdrawals ? "animate-spin text-blue-600" : "text-slate-500"} />
                      Refresh Data
                    </button>
                  </div>
                }
                renderRow={(w) => {
                  const bank = w.user?.bankDetails;
                  const upiLine = w.upiId || w.user?.upiId || "-";
                  const upiNoLine = w.upiNo || w.user?.upiNo || "";
                  const userId = w.user?.id || w.userId;
                  const isPaymentOpen = !!userId && expandedPaymentUserId === userId;
                  const edit = userId ? paymentEdits[userId] : null;

                  return (
                    <React.Fragment key={w._id || w.id || w.withdrawalId}>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono text-[10px] text-slate-400">{w.withdrawalId || "-"}</td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-700">{w.user?.name || "-"}</div>
                          <div className="text-xs text-slate-500">{w.user?.email || ""}</div>
                          {w.user?.balance !== undefined && (
                            <div className="text-[10px] text-slate-400 mt-1">
                              Bal: <span className="font-mono font-bold text-slate-600">₹{w.user.balance}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-mono text-xs text-blue-600">{upiLine}</div>
                          <div className="text-xs text-slate-400">{upiNoLine}</div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1 text-[11px] text-slate-600">
                            <div className="flex justify-between gap-4"><span className="text-slate-400">Holder:</span> <span className="font-medium text-slate-700">{bank?.accountHolder || "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-slate-400">Bank:</span> <span className="font-medium">{bank?.bankName || "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-slate-400">A/c:</span> <span className="font-mono text-slate-700">{bank?.accountNo || "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-slate-400">IFSC:</span> <span className="font-mono">{bank?.ifsc || "-"}</span></div>
                          </div>
                          {w.user?.id && (
                            <button
                              type="button"
                              onClick={() => openPaymentEditor(w.user)}
                              className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                            >
                              {isPaymentOpen ? "Close Editor" : "Edit Details"}
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-base font-bold text-slate-800 font-mono">₹{w.amount}</div>
                          {w.isFirstAfterThreshold && w.upgradeIncome > 0 && (
                            <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-bold uppercase tracking-tight">
                              Upgrade: ₹{w.upgradeIncome}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {w.status === "pending" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">Pending</span>
                          ) : w.status === "approved" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Approved</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">Rejected</span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-slate-400">
                          {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="p-4 text-right">
                          {w.status === "pending" ? (
                            <div className="flex flex-col gap-2 items-end">
                              <button
                                onClick={() => approveWithdrawal(w._id || w.id)}
                                disabled={!!approvingWithdrawalId}
                                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm w-20"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectWithdrawal(w._id || w.id)}
                                disabled={!!approvingWithdrawalId}
                                className="bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition w-20"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold uppercase text-slate-400 italic">
                              {w.status}
                            </span>
                          )}
                        </td>
                      </tr>

                      {isPaymentOpen && edit && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={8} className="p-6">
                            <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-xl shadow-lg p-6 text-left">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-slate-800">Edit Payment Details: {w.user?.name}</h4>
                                <button onClick={() => setExpandedPaymentUserId(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">UPI ID</label>
                                  <input
                                    value={edit.upiId || ""}
                                    onChange={(e) => updatePaymentEdit(userId, "upiId", e.target.value)}
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">UPI Mobile</label>
                                  <input
                                    value={edit.upiNo || ""}
                                    onChange={(e) => updatePaymentEdit(userId, "upiNo", e.target.value)}
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                  />
                                </div>
                                <div className="col-span-2 border-t pt-4 mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Holder</label>
                                    <input
                                      value={edit.bankDetails?.accountHolder || ""}
                                      onChange={(e) => updatePaymentEdit(userId, "bankDetails.accountHolder", e.target.value)}
                                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bank Name</label>
                                    <input
                                      value={edit.bankDetails?.bankName || ""}
                                      onChange={(e) => updatePaymentEdit(userId, "bankDetails.bankName", e.target.value)}
                                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account No</label>
                                    <input
                                      value={edit.bankDetails?.accountNo || ""}
                                      onChange={(e) => updatePaymentEdit(userId, "bankDetails.accountNo", e.target.value)}
                                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IFSC</label>
                                    <input
                                      value={edit.bankDetails?.ifsc || ""}
                                      onChange={(e) => updatePaymentEdit(userId, "bankDetails.ifsc", e.target.value)}
                                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Branch</label>
                                    <input
                                      value={edit.bankDetails?.branchName || ""}
                                      onChange={(e) => updatePaymentEdit(userId, "bankDetails.branchName", e.target.value)}
                                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="mt-6 flex justify-end">
                                <button
                                  onClick={() => savePaymentDetails(userId)}
                                  disabled={savingPaymentUserId === userId}
                                  className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                  {savingPaymentUserId === userId ? "Saving Details..." : "Save Payment Details"}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                }}
              />
            )}

            {currentPage === "rewards" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Reward Completions</h2>
                  <button
                    onClick={() => fetchPendingRewards(adminToken)}
                    className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition active:scale-90"
                  >
                    <IconRefresh className={loadingRewards ? "animate-spin" : ""} />
                  </button>
                </div>

                {loadingRewards ? (
                  <div className="p-10 text-center text-slate-500">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    Loading pending rewards...
                  </div>
                ) : (
                  <DataTable
                    headers={[
                      { label: "User" },
                      { label: "Invite Code" },
                      { label: "Level Reached" },
                      { label: "Completed On" },
                      { label: "Actions", className: "text-right" }
                    ]}
                    data={pendingRewards}
                    itemsPerPage={10}
                    emptyMessage="No pending rewards found. All rewards are up to date!"
                    searchComponent={
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs text-slate-500">Track and manage user level achievement rewards</div>
                        <button
                          onClick={() => fetchPendingRewards(adminToken)}
                          className="p-2 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 rounded-lg transition-all shadow-sm hover:shadow"
                          title="Refresh Rewards"
                        >
                          <IconRefresh className={loadingRewards ? "animate-spin" : ""} />
                        </button>
                      </div>
                    }
                    renderRow={(r) => (
                      <tr key={`${r.userId}-${r.level}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 border-t">
                          <div className="font-bold text-slate-800">{r.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{r.email}</div>
                        </td>
                        <td className="p-4 border-t font-mono text-xs text-blue-600">{r.inviteCode}</td>
                        <td className="p-4 border-t">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider border border-yellow-200 shadow-sm">
                            LEVEL {r.level} Achieved
                          </span>
                        </td>
                        <td className="p-4 border-t text-slate-500 text-xs font-medium">
                          {r.completedAt ? new Date(r.completedAt).toLocaleString() : "-"}
                        </td>
                        <td className="p-4 border-t text-right">
                          <button
                            onClick={() => processReward(r.userId, r.level)}
                            disabled={processingRewardId === `${r.userId}-${r.level}`}
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {processingRewardId === `${r.userId}-${r.level}` ? "Verifying..." : "Mark as Given"}
                          </button>
                        </td>
                      </tr>
                    )}
                  />
                )}
              </div>
            )}


            {/* Marriage Fund Page */}
            {
              currentPage === "marriageFund" && (
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Marriage Fund Management</h2>

                  <div className="bg-white p-6 border rounded-2xl shadow-sm mb-6 max-w-2xl">
                    <div className="text-sm font-semibold mb-3">Search User</div>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Enter Invite Code, Email or Name..."
                        value={mfSearch}
                        onChange={(e) => setMfSearch(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleMfSearch()}
                      />
                      <button
                        onClick={handleMfSearch}
                        disabled={mfLoading}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 disabled:opacity-50"
                      >
                        {mfLoading ? "Searching..." : "Search"}
                      </button>
                    </div>

                    {mfUser && (
                      <div className="mt-6 border-t pt-6 animate-in slide-in-from-top-2">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <div className="text-lg font-bold text-slate-900">{mfUser.name}</div>
                            <div className="text-sm text-slate-500">{mfUser.email}</div>
                            <div className="text-xs text-slate-400 mt-1 font-mono">Code: {mfUser.inviteCode}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Current Fund</div>
                            <div className="text-2xl font-bold text-emerald-600">₹{Number(mfUser.marriageFund || 0).toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="text-sm font-semibold mb-2">Add Funds</div>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                              <input
                                type="number"
                                placeholder="Amount"
                                value={mfAmount}
                                onChange={(e) => setMfAmount(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg pl-8 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <button
                              onClick={handleAddMf}
                              disabled={mfLoading || !mfAmount}
                              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                            >
                              {mfLoading ? "Adding..." : "Add Fund"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {mfMessage && (
                      <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${mfMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {mfMessage.text}
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            {/* Accident Fund Page */}
            {
              currentPage === "accidentFund" && (
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Accident Fund Management</h2>

                  <div className="bg-white p-6 border rounded-2xl shadow-sm mb-6 max-w-2xl">
                    <div className="text-sm font-semibold mb-3">Search User</div>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Enter Invite Code, Email or Name..."
                        value={afSearch}
                        onChange={(e) => setAfSearch(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAfSearch()}
                      />
                      <button
                        onClick={handleAfSearch}
                        disabled={afLoading}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 disabled:opacity-50"
                      >
                        {afLoading ? "Searching..." : "Search"}
                      </button>
                    </div>

                    {afUser && (
                      <div className="mt-6 border-t pt-6 animate-in slide-in-from-top-2">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <div className="text-lg font-bold text-slate-900">{afUser.name}</div>
                            <div className="text-sm text-slate-500">{afUser.email}</div>
                            <div className="text-xs text-slate-400 mt-1 font-mono">Code: {afUser.inviteCode}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Current Fund</div>
                            <div className="text-2xl font-bold text-emerald-600">₹{Number(afUser.accidentFund || 0).toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="text-sm font-semibold mb-2">Add Funds</div>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                              <input
                                type="number"
                                placeholder="Amount"
                                value={afAmount}
                                onChange={(e) => setAfAmount(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg pl-8 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <button
                              onClick={handleAddAf}
                              disabled={afLoading || !afAmount}
                              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                            >
                              {afLoading ? "Adding..." : "Add Fund"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {afMessage && (
                      <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${afMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {afMessage.text}
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            {/* E-Pin page */}
            {
              currentPage === "epin" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800">E-Pin Management</h2>
                    <button
                      onClick={() => { fetchEpins(adminToken); fetchEpinStats(adminToken); fetchEpinHistory(adminToken); }}
                      className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition active:scale-90"
                      title="Refresh All E-Pin Data"
                    >
                      <IconRefresh className={(creatingEpin || transferringEpins) ? "animate-spin" : ""} />
                    </button>
                  </div>

                  {/* E-Pin Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border p-4 rounded-xl shadow-sm">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Total Generated</div>
                      <div className="text-2xl font-bold text-slate-800">{epinStats.totalGenerated}</div>
                    </div>
                    <div className="bg-white border p-4 rounded-xl shadow-sm border-l-4 border-l-blue-500">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Total Transferred</div>
                      <div className="text-2xl font-bold text-blue-600">{epinStats.totalTransferred}</div>
                    </div>
                    <div className="bg-white border p-4 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Pins in Pool</div>
                      <div className="text-2xl font-bold text-emerald-600">{epinStats.inPool}</div>
                    </div>
                    <div className="bg-white border p-4 rounded-xl shadow-sm border-l-4 border-l-amber-500">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Global Used</div>
                      <div className="text-2xl font-bold text-amber-600">{epinStats.totalUsed}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <button onClick={createEpin} disabled={creatingEpin} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95 disabled:opacity-50">
                      {creatingEpin ? "Generating..." : "Generate +1 E-Pin"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Transfer Section */}
                    <div className="lg:col-span-1 border rounded-2xl p-5 bg-slate-50 border-slate-200 h-fit">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                        <IconKey /> Transfer E-Pins
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target User</label>
                          <input
                            value={epinTransfer.toUserId}
                            onChange={(e) => setEpinTransfer((s) => ({ ...s, toUserId: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="User ID, Invite Code or Email"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity (Max 10)</label>
                          <input
                            type="number"
                            value={epinTransfer.count}
                            onChange={(e) => setEpinTransfer((s) => ({ ...s, count: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Count (1-10)"
                            min="1"
                            max="10"
                          />
                        </div>
                        <button
                          onClick={async () => { await transferEpinsFromPool(); fetchEpinStats(adminToken); fetchEpinHistory(adminToken); }}
                          disabled={transferringEpins || !epinTransfer.toUserId}
                          className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg disabled:opacity-50 active:scale-[0.98]"
                        >
                          {transferringEpins ? "Processing..." : "Transfer Now"}
                        </button>
                        <p className="text-[10px] text-slate-400 italic">Pins will be moved from admin pool to target member.</p>
                      </div>

                      {lastEpinTransfer && (
                        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl animate-fadeIn">
                          <div className="font-bold text-emerald-800 text-xs flex items-center gap-1">
                            <IconCheckCircle /> Success!
                          </div>
                          <div className="text-[11px] text-emerald-700 mt-1">
                            Transferred {lastEpinTransfer.count} pins to <span className="font-bold">{lastEpinTransfer.toUserName}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {lastEpinTransfer.codes.map((c) => (
                              <span key={c} className="px-1.5 py-0.5 rounded bg-white border border-emerald-200 font-mono text-[9px] text-emerald-600">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Transfer History */}
                    <div className="lg:col-span-2 border rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
                      <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700">Recent Transfer History</h3>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{epinHistory.length} Transfers</div>
                      </div>
                      <div className="flex-1 overflow-auto">
                        <DataTable
                          headers={[
                            { label: "Date" },
                            { label: "Receiver" },
                            { label: "Count", className: "text-center" },
                            { label: "Codes" }
                          ]}
                          data={epinHistory}
                          itemsPerPage={8}
                          emptyMessage="No transfer history found."
                          renderRow={(row) => (
                            <tr key={row._id || row.transferId} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                                {new Date(row.transferredAt).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <div className="text-xs font-bold text-slate-800">{row.toUserName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{row.toUserId}</div>
                              </td>
                              <td className="p-3 text-center">
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                                  {row.count}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {row.codes.slice(0, 2).map((c, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-slate-50 border rounded text-[9px] font-mono text-slate-500">{c}</span>
                                  ))}
                                  {row.codes.length > 2 && <span className="text-[9px] text-slate-400 font-bold self-center">+{row.codes.length - 2} more</span>}
                                </div>
                              </td>
                            </tr>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Available Pool Display (Simplified) */}
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Available E-Pin Codes in Admin Pool</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {epins.length === 0 ? (
                        <div className="col-span-full p-8 text-center border-2 border-dashed rounded-2xl text-slate-400">
                          No available pool pins. Use "Generate" to add more.
                        </div>
                      ) : epins.map((e, i) => (
                        <div key={i} className="p-2 border rounded-lg bg-white font-mono text-[11px] text-center text-slate-600 truncate border-slate-100 shadow-sm hover:shadow transition-shadow">
                          {e}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

            {/* Income page (member-wise + totals) */}
            {
              currentPage === "income" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-semibold">Income Overview</h2>
                      <button
                        onClick={() => fetchUsers(adminToken)}
                        disabled={loadingUsers}
                        className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition active:scale-90"
                        title="Refresh Income Data"
                      >
                        <IconRefresh className={loadingUsers ? "animate-spin text-blue-600" : "text-slate-500"} />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500">Member-wise and totals</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 border rounded bg-white">
                      <div className="text-xs text-slate-500">Total Income (all members)</div>
                      <div className="text-2xl font-semibold mt-1">{totalIncome}</div>
                    </div>
                    <div className="p-4 border rounded bg-white">
                      <div className="text-xs text-slate-500">Total Balance (all members)</div>
                      <div className="text-2xl font-semibold mt-1">{totalBalance}</div>
                    </div>
                  </div>

                  <div className="bg-white border rounded p-4">
                    <h3 className="text-lg font-semibold mb-3">Member-wise Income</h3>

                    <DataTable
                      headers={[
                        { label: "Name" },
                        { label: "Email" },
                        { label: "Income", className: "text-right" },
                        { label: "Balance", className: "text-right" }
                      ]}
                      data={users}
                      itemsPerPage={15}
                      emptyMessage="No members found."
                      renderRow={(u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-semibold text-slate-700">{u.name}</td>
                          <td className="p-4 text-slate-500">{u.email}</td>
                          <td className="p-4 text-right font-bold text-green-600 font-mono">₹{u.totalIncome ?? 0}</td>
                          <td className="p-4 text-right font-medium text-slate-700 font-mono">₹{u.balance ?? 0}</td>
                        </tr>
                      )}
                    />
                  </div>
                </div>
              )
            }

            {/* User Activation page */}
            {currentPage === "activateUsers" && renderActivationPage()}


            {/* Site Settings page */}
            {
              currentPage === "settings" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Site Settings</h2>
                    <button
                      onClick={() => fetchSiteSettings(adminToken)}
                      className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Refresh Settings"
                    >
                      <IconRefresh className={loadingSettings ? "animate-spin" : ""} />
                    </button>
                  </div>

                  {loadingSettings ? (
                    <div className="flex items-center justify-center p-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Marquee Section */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <IconSpeaker />
                          </div>
                          <h3 className="font-semibold text-slate-800">Announcement Bar (Marquee)</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-700">Enable Announcement Bar</span>
                            <button
                              onClick={() => setSiteSettings(s => ({ ...s, marqueeEnabled: !s.marqueeEnabled }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${siteSettings.marqueeEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteSettings.marqueeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Announcement Text</label>
                            <textarea
                              value={siteSettings.marqueeText}
                              onChange={(e) => setSiteSettings(s => ({ ...s, marqueeText: e.target.value }))}
                              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                              placeholder="Enter moving text here..."
                              rows={2}
                            />
                            <p className="mt-1 text-[11px] text-slate-400">This text will scroll from right to left on the user dashboard.</p>
                          </div>
                        </div>
                      </div>

                      {/* Popup Section */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <IconFile />
                          </div>
                          <h3 className="font-semibold text-slate-800">Login/Registration Popup</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-700">Enable Popup Modal</span>
                            <button
                              onClick={() => setSiteSettings(s => ({ ...s, popupEnabled: !s.popupEnabled }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${siteSettings.popupEnabled ? 'bg-purple-600' : 'bg-slate-300'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteSettings.popupEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Popup Image URL</label>
                            <input
                              type="text"
                              value={siteSettings.popupImageUrl}
                              onChange={(e) => setSiteSettings(s => ({ ...s, popupImageUrl: e.target.value }))}
                              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                              placeholder="https://example.com/banner.jpg"
                            />
                            <p className="mt-1 text-[11px] text-slate-400">Provide an image URL to show in the popup. Best used for important notices or offers.</p>
                          </div>

                          {siteSettings.popupImageUrl && (
                            <div className="mt-2 p-2 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Preview:</p>
                              <img
                                src={siteSettings.popupImageUrl}
                                alt="Popup Preview"
                                className="max-h-40 mx-auto rounded shadow-sm"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/300x150?text=Invalid+Image+URL"; }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          onClick={updateSiteSettings}
                          disabled={savingSettings}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                          {savingSettings ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                              Saving Settings...
                            </>
                          ) : (
                            "Save All Changes"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Autopool Page */}
            {currentPage === "autopool" && <AdminAutopool />}

            {/* Autopool Tree Page */}
            {currentPage === "autopool-tree" && <AdminAutopoolTree />}

          </div>
        </div>
      </div>
    </div>
  );
}
