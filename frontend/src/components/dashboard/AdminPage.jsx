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
  const [projects, setProjects] = useState([]);
  const [siteTeamMembers, setSiteTeamMembers] = useState([]);
  const [siteTestimonials, setSiteTestimonials] = useState([]);

  // ui
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const path = window.location.pathname.replace(/^\/+/, "");
      if (path.startsWith("admin/")) return path.replace("admin/", "");
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
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [loadingSiteTeamMembers, setLoadingSiteTeamMembers] = useState(false);
  const [creatingSiteTeamMember, setCreatingSiteTeamMember] = useState(false);
  const [loadingSiteTestimonials, setLoadingSiteTestimonials] = useState(false);
  const [creatingSiteTestimonial, setCreatingSiteTestimonial] = useState(false);

  const [lookingSponsor, setLookingSponsor] = useState(false);
  const [activatingUserId, setActivatingUserId] = useState(null);

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

  // admin: create project
  const [newProject, setNewProject] = useState({
    title: "",
    desc: "",
    imageUrl: "",
    href: "",
  });

  const [newSiteTeamMember, setNewSiteTeamMember] = useState({
    name: "",
    role: "",
    imageUrl: "",
  });

  const [newSiteTestimonial, setNewSiteTestimonial] = useState({
    text: "",
    name: "",
    role: "",
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
    }
    // handle browser back/forward
    const onPop = () => {
      try {
        const p = window.location.pathname.replace(/^\/+/, "");
        if (p.startsWith("admin/")) setCurrentPage(p.replace("admin/", ""));
      } catch (e) { }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [adminToken]);

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

  async function fetchProjects(token) {
    if (!token) return;
    setLoadingProjects(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch projects");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (err) {
      setError(err.message || "Failed to fetch projects");
    } finally {
      setLoadingProjects(false);
    }
  }

  async function createProject() {
    if (!adminToken) return;
    if (!newProject.title || !newProject.desc) {
      setError("Project title and description are required");
      return;
    }

    setCreatingProject(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newProject),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create project");

      if (data.project) {
        setProjects((prev) => [data.project, ...prev]);
      } else {
        fetchProjects(adminToken);
      }

      setNewProject({ title: "", desc: "", imageUrl: "", href: "" });
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  }

  async function fetchSiteTeamMembers(token) {
    if (!token) return;
    setLoadingSiteTeamMembers(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/site/team-members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch team members");
      setSiteTeamMembers(Array.isArray(data.teamMembers) ? data.teamMembers : []);
    } catch (err) {
      setError(err.message || "Failed to fetch team members");
    } finally {
      setLoadingSiteTeamMembers(false);
    }
  }

  async function createSiteTeamMember() {
    if (!adminToken) return;
    if (!newSiteTeamMember.name || !newSiteTeamMember.role) {
      setError("Team member name and role are required");
      return;
    }

    setCreatingSiteTeamMember(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/site/team-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newSiteTeamMember),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create team member");
      if (data.member) {
        setSiteTeamMembers((prev) => [data.member, ...prev]);
      } else {
        fetchSiteTeamMembers(adminToken);
      }
      setNewSiteTeamMember({ name: "", role: "", imageUrl: "" });
    } catch (err) {
      setError(err.message || "Failed to create team member");
    } finally {
      setCreatingSiteTeamMember(false);
    }
  }

  async function fetchSiteTestimonials(token) {
    if (!token) return;
    setLoadingSiteTestimonials(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/site/testimonials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch testimonials");
      setSiteTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []);
    } catch (err) {
      setError(err.message || "Failed to fetch testimonials");
    } finally {
      setLoadingSiteTestimonials(false);
    }
  }

  async function createSiteTestimonial() {
    if (!adminToken) return;
    if (!newSiteTestimonial.text || !newSiteTestimonial.name || !newSiteTestimonial.role) {
      setError("Testimonial text, name and role are required");
      return;
    }

    setCreatingSiteTestimonial(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/site/testimonials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newSiteTestimonial),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create testimonial");
      if (data.testimonial) {
        setSiteTestimonials((prev) => [data.testimonial, ...prev]);
      } else {
        fetchSiteTestimonials(adminToken);
      }
      setNewSiteTestimonial({ text: "", name: "", role: "" });
    } catch (err) {
      setError(err.message || "Failed to create testimonial");
    } finally {
      setCreatingSiteTestimonial(false);
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
          w.id === withdrawalId
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
    if (page === "projects" && projects.length === 0 && adminToken) {
      fetchProjects(adminToken);
    }
    if (page === "siteTeam" && siteTeamMembers.length === 0 && adminToken) {
      fetchSiteTeamMembers(adminToken);
    }
    if (page === "testimonials" && siteTestimonials.length === 0 && adminToken) {
      fetchSiteTestimonials(adminToken);
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
          <div className="bg-white rounded-lg shadowoverflow-hidden border border-slate-200">
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
                  {(() => {
                    const adminUser = users.find(u => u.role === "admin" || u.name === "admin" || u.email === "admin@gmail.com");
                    const adminCode = adminUser?.inviteCode;

                    const visibleUsers = users.filter(u => {
                      if (u.id === adminUser?.id) return true;
                      if (!u.sponsorId) return true;
                      if (adminCode && u.sponsorId && u.sponsorId.trim() === adminCode.trim()) return true;
                      return false;
                    });

                    return visibleUsers.map((u) => (
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
                    ));
                  })()}
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
          <SidebarButton label="Projects" active={currentPage === "projects"} icon={<IconFile />} onClick={() => openPage("projects")} />
          <SidebarButton label="Site Team" active={currentPage === "siteTeam"} icon={<IconUsers />} onClick={() => openPage("siteTeam")} />
          <SidebarButton label="Testimonials" active={currentPage === "testimonials"} icon={<IconFile />} onClick={() => openPage("testimonials")} />
          <SidebarButton label="E-Pin" active={currentPage === "epin"} icon={<IconKey />} onClick={() => openPage("epin")} />
          <SidebarButton label="Income" active={currentPage === "income"} icon={<IconDollar />} onClick={() => openPage("income")} />
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
                <div className="text-xs text-slate-500">Active: <span className="font-mono">{users.filter(u => u.isActivated).length}</span> — Inactive: <span className="font-mono">{users.filter(u => !u.isActivated).length}</span></div>
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
                <div className="overflow-auto max-h-[50vh] border rounded">
                  <table className="min-w-full text-sm">
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
                        // Filter users to show only Admin and Admin's direct referrals
                        // We assume the "admin" user is the one with role='admin' or name='admin'
                        // Adjust criteria if necessary.
                        const adminUser = users.find(u => u.role === "admin" || u.name === "admin" || u.email === "admin@gmail.com");
                        const adminCode = adminUser?.inviteCode;

                        const visibleUsers = users.filter(u => {
                          // Always show admin
                          if (u.id === adminUser?.id) return true;
                          // Show if no sponsor (root)
                          if (!u.sponsorId) return true;
                          // Show if sponsored by admin (handle whitespace)
                          if (adminCode && u.sponsorId && u.sponsorId.trim() === adminCode.trim()) return true;

                          return false;
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
                  <table className="min-w-full text-sm">
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
                <div className="overflow-auto max-h-[60vh] border rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Updated</th>
                        <th className="p-3 text-left">Documents</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kycs.map((k) => (
                        <tr key={k.id || k.userId} className="border-t hover:bg-slate-50">
                          <td className="p-3">{k.user?.name || k.userId}</td>
                          <td className="p-3">{k.user?.email || "-"}</td>
                          <td className="p-3">{k.user?.role || "member"}</td>
                          <td className="p-3">{k.updatedAt ? String(k.updatedAt).slice(0, 19).replace("T", " ") : "-"}</td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              {k.documents &&
                                Object.entries(k.documents)
                                  .filter(([, v]) => v && v.filePath)
                                  .map(([key, v]) => (
                                    <a
                                      key={key}
                                      href={`${API_BASE}${v.filePath}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-700 underline"
                                    >
                                      {key}
                                    </a>
                                  ))}
                              {!k.documents && k.filePath && (
                                <a
                                  href={`${API_BASE}${k.filePath}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-700 underline"
                                >
                                  document
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
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
                  <table className="min-w-full text-sm">
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
                          <React.Fragment key={w.id}>
                            <tr className="border-t hover:bg-slate-50">
                              <td className="p-3 font-mono">{w.id}</td>
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
                                  <button
                                    onClick={() => approveWithdrawal(w.id)}
                                    disabled={approvingWithdrawalId === w.id}
                                    className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs disabled:opacity-60"
                                  >
                                    {approvingWithdrawalId === w.id ? "Approving..." : "Approve"}
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-500">-</span>
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

          {/* Site Team page */}
          {currentPage === "siteTeam" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Site Team Members</h2>
                <button onClick={() => fetchSiteTeamMembers(adminToken)} className="border px-4 py-2 rounded">
                  Refresh
                </button>
              </div>

              <div className="mb-4 border rounded p-3 bg-slate-50">
                <div className="text-sm font-semibold mb-2">Add Team Member</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    value={newSiteTeamMember.name}
                    onChange={(e) => setNewSiteTeamMember((s) => ({ ...s, name: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Name"
                  />
                  <input
                    value={newSiteTeamMember.role}
                    onChange={(e) => setNewSiteTeamMember((s) => ({ ...s, role: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Role / Description"
                  />
                  <input
                    value={newSiteTeamMember.imageUrl}
                    onChange={(e) => setNewSiteTeamMember((s) => ({ ...s, imageUrl: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm md:col-span-2"
                    placeholder="Image URL (optional)"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={createSiteTeamMember}
                    disabled={creatingSiteTeamMember}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
                  >
                    {creatingSiteTeamMember ? "Creating..." : "Add Member"}
                  </button>
                </div>
              </div>

              {loadingSiteTeamMembers ? (
                <div className="text-sm text-slate-500">Loading team members...</div>
              ) : (
                <div className="overflow-auto max-h-[60vh] border rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Image</th>
                        <th className="p-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siteTeamMembers.map((m) => (
                        <tr key={m.id} className="border-t hover:bg-slate-50">
                          <td className="p-3 font-medium">{m.name}</td>
                          <td className="p-3 text-xs text-slate-700">{m.role}</td>
                          <td className="p-3 text-xs">
                            {m.imageUrl ? (
                              <a href={m.imageUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                                open
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-xs text-slate-500">
                            {m.createdAt ? String(m.createdAt).slice(0, 19).replace("T", " ") : "-"}
                          </td>
                        </tr>
                      ))}
                      {siteTeamMembers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">
                            No team members found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Testimonials page */}
          {currentPage === "testimonials" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Testimonials</h2>
                <button onClick={() => fetchSiteTestimonials(adminToken)} className="border px-4 py-2 rounded">
                  Refresh
                </button>
              </div>

              <div className="mb-4 border rounded p-3 bg-slate-50">
                <div className="text-sm font-semibold mb-2">Add Testimonial</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    value={newSiteTestimonial.name}
                    onChange={(e) => setNewSiteTestimonial((s) => ({ ...s, name: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Name"
                  />
                  <input
                    value={newSiteTestimonial.role}
                    onChange={(e) => setNewSiteTestimonial((s) => ({ ...s, role: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Role (e.g. Distributor)"
                  />
                  <textarea
                    value={newSiteTestimonial.text}
                    onChange={(e) => setNewSiteTestimonial((s) => ({ ...s, text: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm md:col-span-2"
                    placeholder="Testimonial text"
                    rows={3}
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={createSiteTestimonial}
                    disabled={creatingSiteTestimonial}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
                  >
                    {creatingSiteTestimonial ? "Creating..." : "Add Testimonial"}
                  </button>
                </div>
              </div>

              {loadingSiteTestimonials ? (
                <div className="text-sm text-slate-500">Loading testimonials...</div>
              ) : (
                <div className="overflow-auto max-h-[60vh] border rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Text</th>
                        <th className="p-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siteTestimonials.map((t) => (
                        <tr key={t.id} className="border-t hover:bg-slate-50">
                          <td className="p-3 font-medium">{t.name}</td>
                          <td className="p-3 text-xs text-slate-700">{t.role}</td>
                          <td className="p-3 text-xs text-slate-700">{t.text}</td>
                          <td className="p-3 text-xs text-slate-500">
                            {t.createdAt ? String(t.createdAt).slice(0, 19).replace("T", " ") : "-"}
                          </td>
                        </tr>
                      ))}
                      {siteTestimonials.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">
                            No testimonials found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Projects page */}
          {currentPage === "projects" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Projects</h2>
                <div className="flex gap-2">
                  <button onClick={() => fetchProjects(adminToken)} className="border px-4 py-2 rounded">
                    Refresh
                  </button>
                </div>
              </div>

              <div className="mb-4 border rounded p-3 bg-slate-50">
                <div className="text-sm font-semibold mb-2">Add New Project</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    value={newProject.title}
                    onChange={(e) => setNewProject((s) => ({ ...s, title: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Title"
                  />
                  <input
                    value={newProject.href}
                    onChange={(e) => setNewProject((s) => ({ ...s, href: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Link (optional)"
                  />
                  <input
                    value={newProject.imageUrl}
                    onChange={(e) => setNewProject((s) => ({ ...s, imageUrl: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm md:col-span-2"
                    placeholder="Image URL (optional)"
                  />
                  <textarea
                    value={newProject.desc}
                    onChange={(e) => setNewProject((s) => ({ ...s, desc: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm md:col-span-2"
                    placeholder="Description"
                    rows={3}
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={createProject}
                    disabled={creatingProject}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
                  >
                    {creatingProject ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </div>

              {loadingProjects ? (
                <div className="text-sm text-slate-500">Loading projects...</div>
              ) : (
                <div className="overflow-auto max-h-[60vh] border rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">Title</th>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-left">Link</th>
                        <th className="p-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p) => (
                        <tr key={p.id} className="border-t hover:bg-slate-50">
                          <td className="p-3 font-medium">{p.title}</td>
                          <td className="p-3 text-xs text-slate-700">{p.desc}</td>
                          <td className="p-3">
                            {p.href ? (
                              <a href={p.href} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                                open
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-xs text-slate-500">
                            {p.createdAt ? String(p.createdAt).slice(0, 19).replace("T", " ") : "-"}
                          </td>
                        </tr>
                      ))}
                      {projects.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">
                            No projects found.
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

                <div className="overflow-auto max-h-[50vh] border rounded">
                  <table className="min-w-full text-sm">
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

        </div>

        <div className="mt-4 text-sm text-slate-500">Tip: Invite code can be shared and used unlimited times.</div>
      </div>
    </div>
  );
}
