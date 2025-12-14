import React, { useEffect, useState } from "react";

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

/* -------------------- Reusable small UI components -------------------- */
function SidebarButton({ label, active, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 text-left rounded-md ${
        active ? "bg-blue-50 text-blue-700 border border-blue-100" : "hover:bg-slate-50 text-slate-700"
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
      if (path.startsWith("admin/")) return path.replace("admin/", "");
    } catch (e) {}
    return "dashboard";
  });

  // status
  const [error, setError] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingEpin, setCreatingEpin] = useState(false);
  const [loadingKycs, setLoadingKycs] = useState(false);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [approvingWithdrawalId, setApprovingWithdrawalId] = useState(null);

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

  const API_BASE = "http://localhost:5000";

  // site name (optional)
  const [siteName, setSiteName] = useState("My Website");

  useEffect(() => {
    if (adminToken) {
      // fetch epins & site stats eagerly (users are loaded lazily when Members clicked)
      fetchEpins(adminToken);
      fetchStats(adminToken);
    }
    // handle browser back/forward
    const onPop = () => {
      try {
        const p = window.location.pathname.replace(/^\/+/, "");
        if (p.startsWith("admin/")) setCurrentPage(p.replace("admin/", ""));
      } catch (e) {}
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
    } catch (e) {}
  }

  function handleLogout() {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    setUsers([]);
    // optional: navigate to root
    try {
      window.history.pushState({}, "", "/");
    } catch (e) {}
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

      // update list in-place
      setWithdrawals((prev) => prev.map((w) => (w.id === withdrawalId ? { ...w, ...data.withdrawal, status: data.withdrawal?.status || "approved" } : w)));

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

  function openPage(page) {
    setCurrentPage(page);
    try {
      window.history.pushState({}, "", `/admin/${page}`);
    } catch (e) {}
    // lazy-load users when going to members
    if (page === "members" && users.length === 0 && adminToken) {
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
          <SidebarButton label="KYC" active={currentPage === "kyc"} icon={<IconFile />} onClick={() => openPage("kyc")} />
          <SidebarButton label="Withdrawals" active={currentPage === "withdrawals"} icon={<IconDollar />} onClick={() => openPage("withdrawals")} />
          <SidebarButton label="E-Pin" active={currentPage === "epin"} icon={<IconKey />} onClick={() => openPage("epin")} />
          <SidebarButton label="Income" active={currentPage === "income"} icon={<IconDollar />} onClick={() => openPage("income")} />
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
                    onChange={(e) => setNewMember((s) => ({ ...s, sponsorId: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Sponsor invite code (optional)"
                  />
                  <input
                    value={newMember.sponsorName}
                    onChange={(e) => setNewMember((s) => ({ ...s, sponsorName: e.target.value }))}
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Sponsor name (optional)"
                  />
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
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Invite Code</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">E-Pin</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-right">Balance</th>
                        <th className="p-3 text-right">Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-t hover:bg-slate-50">
                          <td className="p-3">{u.name}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3 font-mono text-blue-600">{u.inviteCode}</td>
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
                          <td className="p-3">{u.isActivated ? <span className="text-green-600 font-semibold">Active</span> : <span className="text-slate-500">Inactive</span>}</td>
                          <td className="p-3 text-right">{u.balance ?? 0}</td>
                          <td className="p-3 text-right font-semibold text-green-600">{u.totalIncome ?? 0}</td>
                        </tr>
                      ))}
                      {users.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-slate-500">No members found.</td></tr>}
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
                        return (
                          <tr key={w.id} className="border-t hover:bg-slate-50">
                            <td className="p-3 font-mono">{w.id}</td>
                            <td className="p-3">
                              <div className="font-medium">{w.user?.name || "-"}</div>
                              <div className="text-xs text-slate-500">{w.user?.email || ""}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-mono">{upiLine}</div>
                              <div className="text-xs text-slate-500">{upiNoLine}</div>
                            </td>
                            <td className="p-3">
                              <div className="text-xs">{bankLine || "-"}</div>
                              {bank?.ifsc ? <div className="text-[11px] text-slate-500 font-mono">{bank.ifsc}</div> : null}
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
                            <td className="p-3">{w.requestedAt ? String(w.requestedAt).slice(0, 19).replace("T", " ") : "-"}</td>
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
                    placeholder="Member User ID"
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

        </div>

        <div className="mt-4 text-sm text-slate-500">Tip: Invite code can be shared and used unlimited times.</div>
      </div>
    </div>
  );
}
