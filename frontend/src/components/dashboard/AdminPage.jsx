import React, { useEffect, useState } from "react";

import config from "../../config/config";

/**
 * Final AdminPage.jsx (single-file)
 * - White + blue theme
 * - Sidebar navigation
 * - Pages: Dashboard, Members (fetches only when clicked), E-Pin, Income
 * - Income page shows member-wise income + total income & total balance
 * - No external icon packages (inline SVG icons included)
 *
 * Replace your existing AdminPage.jsx with this file.
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

  // ui
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  // KYC: search and edit
  const [kycSearch, setKycSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [expandedKycId, setExpandedKycId] = useState(null);
  const [kycEdits, setKycEdits] = useState({}); // { [kycId]: { panNo, aadhaarNo, ... } }
  const [savingKycId, setSavingKycId] = useState(null);

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
      alert("Settings updated successfully!");
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
            <div>
              <div className="font-semibold">{siteName}</div>
              <div className="text-xs text-slate-500">Admin Panel</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 rounded hover:bg-slate-100"><IconClose /></button>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarButton label="Dashboard" active={currentPage === "dashboard"} icon={<IconHome />} onClick={() => openPage("dashboard")} />
          <SidebarButton label="Members" active={currentPage === "members"} icon={<IconUsers />} onClick={() => openPage("members")} />
          <SidebarButton label="Bank Details" active={currentPage === "bank"} icon={<IconBank />} onClick={() => openPage("bank")} />
          <SidebarButton label="KYC" active={currentPage === "kyc"} icon={<IconFile />} onClick={() => openPage("kyc")} />
          <SidebarButton label="Withdrawals" active={currentPage === "withdrawals"} icon={<IconDollar />} onClick={() => openPage("withdrawals")} />
          <SidebarButton label="E-Pin" active={currentPage === "epin"} icon={<IconKey />} onClick={() => openPage("epin")} />
          <SidebarButton label="Income" active={currentPage === "income"} icon={<IconDollar />} onClick={() => openPage("income")} />
          <SidebarButton
            label="Rewards"
            active={currentPage === "rewards"}
            icon={<IconAward />}
            onClick={() => openPage("rewards")}
          />
          <SidebarButton
            label="Site Content"
            active={currentPage === "site"}
            icon={<IconFile />}
            onClick={() => openPage("site")}
          />
          <SidebarButton
            label="User Activation"
            active={currentPage === "activateUsers"}
            icon={<IconCheckCircle />}
            onClick={() => openPage("activateUsers")}
          />
          <SidebarButton
            label="Site Settings"
            active={currentPage === "settings"}
            icon={<IconSettings />}
            onClick={() => openPage("settings")}
          />
        </nav>

        <div className="mt-6">
          <div className="text-xs text-slate-500 mb-2">E-Pin</div>
          <div className="flex gap-2">
            <button onClick={createEpin} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded">{creatingEpin ? "Creating..." : "Generate"}</button>
            <button onClick={() => fetchEpins(adminToken)} className="flex-1 border px-3 py-2 rounded">Refresh</button>
          </div>
        </div>

        <div className="mt-auto pt-4 text-xs text-slate-500">
          <div>Logged in as <span className="font-mono">admin</span></div>
          <button onClick={handleLogout} className="mt-2 w-full flex items-center gap-2 border px-3 py-2 rounded text-sm">
            <IconLogout /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 bg-white border rounded" onClick={() => setSidebarOpen((s) => !s)}><IconMenu /></button>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          </div>
          <div className="text-sm text-slate-600">{siteName}</div>
        </div>

        <div className="bg-white border rounded-lg p-4">
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
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Members</h2>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search name, ID or code..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
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
                <div className="overflow-auto max-h-[60vh] border rounded">
                  <table className="min-w-[1200px] w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">User ID</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Invite Code</th>
                        <th className="p-3 text-left">Invite People</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">E-Pin</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-right">Balance</th>
                        <th className="p-3 text-right">Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const term = memberSearch.trim().toLowerCase();
                        const visibleUsers = users.filter(u => {
                          if (!term) return true;
                          return (
                            u.name?.toLowerCase().includes(term) ||
                            u.id?.toLowerCase().includes(term) ||
                            u.email?.toLowerCase().includes(term) ||
                            u.inviteCode?.toLowerCase().includes(term)
                          );
                        });

                        return visibleUsers.map((u) => {
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
                                <td className="p-3 text-right">{u.balance ?? 0}</td>
                                <td className="p-3 text-right font-semibold text-green-600">{u.totalIncome ?? 0}</td>
                              </tr>

                              {isExpanded && (
                                <tr className="border-t bg-slate-50/60">
                                  <td colSpan={10} className="p-3">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                      <div className="bg-white border rounded p-3">
                                        <div className="text-sm font-semibold mb-1">Invite People</div>
                                        <div className="text-xs text-slate-600">
                                          Share this invite code with new members (they will enter it in Sponsor Invite Code during registration).
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                          <div className="font-mono text-sm px-2 py-1 border rounded bg-slate-50">
                                            {u.inviteCode}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => copyToClipboard(u.inviteCode)}
                                            className="border px-3 py-1.5 rounded text-xs hover:bg-slate-50"
                                          >
                                            Copy
                                          </button>
                                        </div>
                                      </div>

                                      <div className="bg-white border rounded p-3">
                                        <div className="text-sm font-semibold mb-2">Direct Invitees</div>
                                        <div className="overflow-auto max-h-48">
                                          <table className="min-w-full text-xs">
                                            <thead className="bg-slate-50 sticky top-0">
                                              <tr>
                                                <th className="p-2 text-left">Name</th>
                                                <th className="p-2 text-left">User ID</th>
                                                <th className="p-2 text-left">Invite Code</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {(u.invitees || []).map((m) => (
                                                <tr key={m.id} className="border-t">
                                                  <td className="p-2">{m.name}</td>
                                                  <td className="p-2 font-mono">{m.id}</td>
                                                  <td className="p-2 font-mono text-blue-700">{m.inviteCode}</td>
                                                </tr>
                                              ))}
                                              {(u.invitees || []).length === 0 && (
                                                <tr>
                                                  <td colSpan={3} className="p-3 text-center text-slate-500">
                                                    No invitees yet.
                                                  </td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      })()}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={10} className="p-6 text-center text-slate-500">
                            No members found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                  className="border px-4 py-2 rounded"
                >
                  Refresh
                </button>
              </div>

              {loadingUsers ? (
                <div className="text-sm text-slate-500">Loading members...</div>
              ) : (
                <div className="overflow-auto max-h-[60vh] border rounded">
                  <table className="min-w-[1200px] w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">UPI</th>
                        <th className="p-3 text-left">Account Holder</th>
                        <th className="p-3 text-left">Bank</th>
                        <th className="p-3 text-left">Account No</th>
                        <th className="p-3 text-left">IFSC</th>
                        <th className="p-3 text-left">Branch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
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
                      })}

                      {users.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-500">
                            No members found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                <button onClick={() => fetchKycs(adminToken)} className="border px-4 py-2 rounded">Refresh</button>
              </div>

              {loadingKycs ? (
                <div className="text-sm text-slate-500">Loading KYC records...</div>
              ) : (
                <div className="overflow-auto max-h-[70vh] border rounded">
                  <div className="p-3 bg-slate-50 border-b flex items-center gap-2 min-w-[1200px]">
                    <input
                      value={kycSearch}
                      onChange={(e) => setKycSearch(e.target.value)}
                      placeholder="Search by Invite Code or PAN..."
                      className="border rounded px-3 py-1.5 text-sm w-full max-w-sm"
                    />
                    {kycSearch && (
                      <button onClick={() => setKycSearch("")} className="text-xs text-blue-600 hover:underline">Clear</button>
                    )}
                  </div>
                  <table className="min-w-[1200px] w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Invite Code</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">PAN / Aadhaar</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Updated</th>
                        <th className="p-3 text-left">Documents</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kycs.filter(k => {
                        const search = kycSearch.toLowerCase().trim();
                        if (!search) return true;
                        const ic = (k.user?.inviteCode || "").toLowerCase();
                        const pan = (k.panNo || "").toLowerCase();
                        const name = (k.user?.name || "").toLowerCase();
                        return ic.includes(search) || pan.includes(search) || name.includes(search);
                      }).map((k) => {
                        const kycId = k.id || k._id;
                        const isExpanded = expandedKycId === kycId;
                        const edit = kycEdits[kycId];

                        return (
                          <React.Fragment key={kycId}>
                            <tr className="border-t hover:bg-slate-50">
                              <td className="p-3">
                                <div className="font-medium">{k.user?.name || k.userId}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{k.userId}</div>
                              </td>
                              <td className="p-3 font-mono text-blue-700">{k.user?.inviteCode || "-"}</td>
                              <td className="p-3 text-slate-500">{k.user?.email || "-"}</td>
                              <td className="p-3">
                                <div className="text-xs">
                                  <div><span className="text-slate-400">PAN:</span> {k.panNo || "-"}</div>
                                  <div><span className="text-slate-400">UID:</span> {k.aadhaarNo || "-"}</div>
                                </div>
                              </td>
                              <td className="p-3 text-xs">
                                {k.status === 'approved' ? (
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Approved</span>
                                ) : k.status === 'rejected' ? (
                                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Rejected</span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                                )}
                              </td>
                              <td className="p-3 text-slate-500">{k.updatedAt ? String(k.updatedAt).slice(0, 19).replace("T", " ") : "-"}</td>
                              <td className="p-3">
                                <div className="flex flex-col gap-1">
                                  {k.documents &&
                                    Object.entries(k.documents)
                                      .filter(([, v]) => v && (typeof v === 'string' ? v : v.filePath))
                                      .map(([key, v]) => (
                                        <a
                                          key={key}
                                          href={`${API_BASE}${typeof v === 'string' ? v : v.filePath}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-700 underline text-[11px]"
                                        >
                                          {key}
                                        </a>
                                      ))}
                                  {!k.documents && k.filePath && (
                                    <a
                                      href={`${API_BASE}${k.filePath}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-700 underline text-[11px]"
                                    >
                                      document
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => openKycEditor(k)}
                                  className="text-xs bg-slate-100 hover:bg-slate-200 border rounded px-3 py-1.5 transition-colors"
                                >
                                  {isExpanded ? "Close" : "Edit"}
                                </button>
                              </td>
                            </tr>

                            {isExpanded && edit && (
                              <tr className="border-t bg-slate-50/50">
                                <td colSpan={8} className="p-4">
                                  <div className="bg-white border rounded shadow-sm p-4 max-w-4xl">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="font-semibold text-sm">Update KYC Information</h3>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => setExpandedKycId(null)}
                                          className="text-xs border px-3 py-1.5 rounded"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => saveKycDetails(kycId)}
                                          disabled={savingKycId === kycId}
                                          className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded disabled:opacity-60"
                                        >
                                          {savingKycId === kycId ? "Saving..." : "Save Details"}
                                        </button>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      <div>
                                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">PAN Number</label>
                                        <input
                                          value={edit.panNo}
                                          onChange={(e) => updateKycEdit(kycId, "panNo", e.target.value.toUpperCase())}
                                          className="w-full border rounded px-3 py-2 text-sm"
                                          placeholder="ABCDE1234F"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Aadhaar Number</label>
                                        <input
                                          value={edit.aadhaarNo}
                                          onChange={(e) => updateKycEdit(kycId, "aadhaarNo", e.target.value)}
                                          className="w-full border rounded px-3 py-2 text-sm"
                                          placeholder="12-digit number"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Status</label>
                                        <select
                                          value={edit.status}
                                          onChange={(e) => updateKycEdit(kycId, "status", e.target.value)}
                                          className="w-full border rounded px-3 py-2 text-sm"
                                        >
                                          <option value="pending">Pending</option>
                                          <option value="approved">Approved</option>
                                          <option value="rejected">Rejected</option>
                                        </select>
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Address (as per Aadhaar)</label>
                                        <input
                                          value={edit.aadhaarAddress}
                                          onChange={(e) => updateKycEdit(kycId, "aadhaarAddress", e.target.value)}
                                          className="w-full border rounded px-3 py-2 text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Issued State</label>
                                        <input
                                          value={edit.issuedState}
                                          onChange={(e) => updateKycEdit(kycId, "issuedState", e.target.value)}
                                          className="w-full border rounded px-3 py-2 text-sm"
                                        />
                                      </div>
                                      <div className="md:col-span-3">
                                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Remarks / Rejection Reason</label>
                                        <textarea
                                          value={edit.remarks}
                                          onChange={(e) => updateKycEdit(kycId, "remarks", e.target.value)}
                                          className="w-full border rounded px-3 py-2 text-sm h-16"
                                          placeholder="Notes for the user..."
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {kycs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500">
                            No KYC records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Withdrawals page */}
          {currentPage === "withdrawals" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Withdrawal Requests</h2>
                <div className="text-xs text-slate-500">{withdrawals.length} requests</div>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={() => fetchWithdrawals(adminToken)} className="border px-4 py-2 rounded">Refresh</button>
              </div>

              {loadingWithdrawals ? (
                <div className="text-sm text-slate-500">Loading withdrawals...</div>
              ) : (
                <div className="overflow-auto max-h-[60vh] border rounded">
                  <table className="min-w-[1200px] w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">UPI</th>
                        <th className="p-3 text-left">Bank</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Requested</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w) => {
                        const bank = w.user?.bankDetails;
                        const bankLine = bank?.accountNo
                          ? `${bank.bankName || ""} • ${bank.accountNo}`
                          : "-";
                        const upiLine = w.upiId || w.user?.upiId || "-";
                        const upiNoLine = w.upiNo || w.user?.upiNo || "";
                        const userId = w.user?.id || w.userId;
                        const isPaymentOpen = !!userId && expandedPaymentUserId === userId;
                        const edit = userId ? paymentEdits[userId] : null;

                        return (
                          <React.Fragment key={w._id || w.id || w.withdrawalId}>
                            <tr className="border-t hover:bg-slate-50 text-slate-700">
                              <td className="p-3 font-mono text-[10px] text-slate-500">{w.withdrawalId || "-"}</td>
                              <td className="p-3">
                                <div className="font-medium">{w.user?.name || "-"}</div>
                                <div className="text-xs text-slate-500">{w.user?.email || ""}</div>
                                {w.user?.balance !== undefined ? (
                                  <div className="text-[11px] text-slate-500">
                                    Balance: <span className="font-mono">₹{w.user.balance}</span>
                                  </div>
                                ) : null}
                              </td>
                              <td className="p-3">
                                <div className="font-mono">{upiLine}</div>
                                <div className="text-xs text-slate-500">{upiNoLine}</div>
                              </td>
                              <td className="p-3">
                                <div className="space-y-0.5 text-xs">
                                  <div>
                                    <span className="text-slate-500">Holder:</span>{" "}
                                    {bank?.accountHolder || "-"}
                                  </div>
                                  <div>
                                    <span className="text-slate-500">Bank:</span>{" "}
                                    {bank?.bankName || "-"}
                                  </div>
                                  <div className="font-mono text-[11px]">
                                    <span className="text-slate-500 font-sans">A/c:</span>{" "}
                                    {bank?.accountNo || "-"}
                                  </div>
                                  <div className="font-mono text-[11px]">
                                    <span className="text-slate-500 font-sans">IFSC:</span>{" "}
                                    {bank?.ifsc || "-"}
                                  </div>
                                  <div>
                                    <span className="text-slate-500">Branch:</span>{" "}
                                    {bank?.branchName || "-"}
                                  </div>
                                </div>

                                {w.user?.id ? (
                                  <button
                                    type="button"
                                    onClick={() => openPaymentEditor(w.user)}
                                    className="mt-2 inline-flex items-center gap-2 text-xs border px-2 py-1 rounded hover:bg-white"
                                  >
                                    {isPaymentOpen ? "Close" : "Edit"} Bank/UPI
                                  </button>
                                ) : null}
                              </td>
                              <td className="p-3 text-right font-semibold">{w.amount}</td>
                              <td className="p-3">
                                {w.status === "pending" ? (
                                  <span className="text-amber-700 font-semibold">pending</span>
                                ) : w.status === "approved" ? (
                                  <span className="text-emerald-700 font-semibold">approved</span>
                                ) : (
                                  <span className="text-slate-600">{w.status}</span>
                                )}
                              </td>
                              <td className="p-3">
                                {w.requestedAt
                                  ? String(w.requestedAt)
                                    .slice(0, 19)
                                    .replace("T", " ")
                                  : "-"}
                              </td>
                              <td className="p-3 text-right">
                                {w.status === "pending" ? (
                                  <div className="flex flex-col gap-1.5">
                                    <button
                                      onClick={() => approveWithdrawal(w._id || w.id)}
                                      disabled={approvingWithdrawalId === (w._id || w.id)}
                                      className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs disabled:opacity-60 transition-colors hover:bg-emerald-700 font-medium shadow-sm"
                                    >
                                      {approvingWithdrawalId === (w._id || w.id) ? "Wait.." : "Approve"}
                                    </button>
                                    <button
                                      onClick={() => rejectWithdrawal(w._id || w.id)}
                                      disabled={approvingWithdrawalId === (w._id || w.id)}
                                      className="bg-white border-red-200 border text-red-600 px-3 py-1.5 rounded text-xs disabled:opacity-60 transition-colors hover:bg-red-50 font-medium"
                                    >
                                      {approvingWithdrawalId === (w._id || w.id) ? "Wait.." : "Reject"}
                                    </button>
                                  </div>
                                ) : w.status === "approved" ? (
                                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved</span>
                                ) : (
                                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Rejected</span>
                                )}
                              </td>
                            </tr>

                            {isPaymentOpen && edit && (
                              <tr className="border-t bg-slate-50/60">
                                <td colSpan={8} className="p-4">
                                  <div className="bg-white border rounded p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        <div className="text-sm font-semibold">Payment Details</div>
                                        <div className="text-xs text-slate-500">
                                          Update bank/UPI before processing payment.
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setExpandedPaymentUserId(null)}
                                          className="border px-3 py-1.5 rounded text-xs"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => savePaymentDetails(userId)}
                                          disabled={savingPaymentUserId === userId}
                                          className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs disabled:opacity-60"
                                        >
                                          {savingPaymentUserId === userId ? "Saving..." : "Save"}
                                        </button>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs text-slate-600 mb-1">
                                          UPI ID
                                        </label>
                                        <input
                                          value={edit.upiId || ""}
                                          onChange={(e) => updatePaymentEdit(userId, "upiId", e.target.value)}
                                          className="w-full border rounded px-3 py-2 text-sm"
                                          placeholder="yourid@bank"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-600 mb-1">
                                          UPI Mobile
                                        </label>
                                        <input
                                          value={edit.upiNo || ""}
                                          onChange={(e) => updatePaymentEdit(userId, "upiNo", e.target.value)}
                                          className="w-full border rounded px-3 py-2 text-sm"
                                          placeholder="UPI linked mobile number"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-600 mb-1">
                                          Account Holder
                                        </label>
                                        <input
                                          value={edit.bankDetails?.accountHolder || ""}
                                          onChange={(e) =>
                                            updatePaymentEdit(
                                              userId,
                                              "bankDetails.accountHolder",
                                              e.target.value
                                            )
                                          }
                                          className="w-full border rounded px-3 py-2 text-sm"
                                          placeholder="Account holder name"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-600 mb-1">
                                          Bank Name
                                        </label>
                                        <input
                                          value={edit.bankDetails?.bankName || ""}
                                          onChange={(e) =>
                                            updatePaymentEdit(userId, "bankDetails.bankName", e.target.value)
                                          }
                                          className="w-full border rounded px-3 py-2 text-sm"
                                          placeholder="Bank name"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-600 mb-1">
                                          Account No
                                        </label>
                                        <input
                                          value={edit.bankDetails?.accountNo || ""}
                                          onChange={(e) =>
                                            updatePaymentEdit(userId, "bankDetails.accountNo", e.target.value)
                                          }
                                          className="w-full border rounded px-3 py-2 text-sm"
                                          placeholder="Account number"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-600 mb-1">
                                          IFSC
                                        </label>
                                        <input
                                          value={edit.bankDetails?.ifsc || ""}
                                          onChange={(e) =>
                                            updatePaymentEdit(userId, "bankDetails.ifsc", e.target.value)
                                          }
                                          className="w-full border rounded px-3 py-2 text-sm font-mono"
                                          placeholder="SBIN0123456"
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-xs text-slate-600 mb-1">
                                          Branch Name
                                        </label>
                                        <input
                                          value={edit.bankDetails?.branchName || ""}
                                          onChange={(e) =>
                                            updatePaymentEdit(userId, "bankDetails.branchName", e.target.value)
                                          }
                                          className="w-full border rounded px-3 py-2 text-sm"
                                          placeholder="Branch name"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {withdrawals.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-slate-500">No withdrawal requests.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Rewards page */}
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
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="p-4 text-left font-semibold">User</th>
                        <th className="p-4 text-left font-semibold">Invite Code</th>
                        <th className="p-4 text-left font-semibold">Level Reached</th>
                        <th className="p-4 text-left font-semibold">Completed On</th>
                        <th className="p-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRewards.map((r, idx) => (
                        <tr key={`${r.userId}-${r.level}`} className="border-b hover:bg-slate-50 transition">
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{r.name}</div>
                            <div className="text-xs text-slate-500">{r.email}</div>
                          </td>
                          <td className="p-4 font-mono text-xs">{r.inviteCode}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-bold">
                              LEVEL {r.level}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 text-xs">
                            {r.completedAt ? new Date(r.completedAt).toLocaleString() : "-"}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => processReward(r.userId, r.level)}
                              disabled={processingRewardId === `${r.userId}-${r.level}`}
                              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              {processingRewardId === `${r.userId}-${r.level}` ? "Wait..." : "Mark as Given"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pendingRewards.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-slate-500 font-medium">
                            No pending rewards found. All rewards are up to date!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}


          {/* E-Pin page */}
          {currentPage === "epin" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">E-Pin Management</h2>
                <div className="text-xs text-slate-500">Pool pins available: {epins.length}</div>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={createEpin} className="bg-blue-600 text-white px-4 py-2 rounded">{creatingEpin ? "Creating..." : "Generate E-Pin"}</button>
                <button onClick={() => fetchEpins(adminToken)} className="border px-4 py-2 rounded">Refresh</button>
              </div>

              <div className="border rounded p-3 mb-4 bg-slate-50">
                <div className="text-sm font-semibold mb-2">Transfer E-Pins to Member (max 10)</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    value={epinTransfer.toUserId}
                    onChange={(e) => setEpinTransfer((s) => ({ ...s, toUserId: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="User ID or Invite Code"
                  />
                  <input
                    value={epinTransfer.count}
                    onChange={(e) => setEpinTransfer((s) => ({ ...s, count: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Count (1-10)"
                  />
                  <button
                    onClick={transferEpinsFromPool}
                    disabled={transferringEpins}
                    className="bg-emerald-600 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
                  >
                    {transferringEpins ? "Transferring..." : "Transfer"}
                  </button>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  💡 Tip: You can use the member's <span className="font-semibold">Invite Code</span> (e.g., LS123456), <span className="font-semibold">User ID</span>, or <span className="font-semibold">Email</span> to transfer e-pins.
                </div>

                {lastEpinTransfer && (
                  <div className="mt-3 text-sm">
                    <div className="font-semibold">Transferred {lastEpinTransfer.count} pins to {lastEpinTransfer.toUserName}</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {lastEpinTransfer.codes.map((c) => (
                        <span key={c} className="px-2 py-1 rounded border bg-white font-mono text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {epins.length === 0 ? <div className="text-slate-500 p-3">No available pool pins.</div> : epins.map((e, i) => (<div key={i} className="p-2 border rounded font-mono text-sm truncate">{e}</div>))}
              </div>
            </div>
          )}

          {/* Income page (member-wise + totals) */}
          {currentPage === "income" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Income Overview</h2>
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

                <div className="overflow-auto max-h-[60vh] border rounded">
                  <table className="min-w-[1000px] w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-right">Income</th>
                        <th className="p-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-t hover:bg-slate-50">
                          <td className="p-3">{u.name}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3 text-right font-semibold text-green-600">{u.totalIncome ?? 0}</td>
                          <td className="p-3 text-right">{u.balance ?? 0}</td>
                        </tr>
                      ))}
                      {users.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">No members found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* User Activation page */}
          {currentPage === "activateUsers" && renderActivationPage()}

          {/* Site Settings page */}
          {currentPage === "settings" && (
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

        </div>

        <div className="mt-4 text-sm text-slate-500">Tip: Invite code can be shared and used unlimited times.</div>
      </div>
    </div>
  );
}
