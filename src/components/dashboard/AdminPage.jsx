import React, { useEffect, useState } from "react";

export default function AdminPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [adminToken, setAdminToken] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const existing = localStorage.getItem("adminToken");
    if (existing) {
      setAdminToken(existing);
      fetchUsers(existing);
    }
  }, []);

  async function handleAdminLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Admin login failed");
      }
      localStorage.setItem("adminToken", data.token);
      setAdminToken(data.token);
      fetchUsers(data.token);
    } catch (err) {
      setError(err.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers(token) {
    setLoadingUsers(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      // If the token is invalid/expired, force logout and send admin back to login form
      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        setAdminToken(null);
        setUsers([]);
        setError(data.message || "Session expired, please log in again as admin.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to load users");
      }
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    setUsers([]);
  }

  if (!adminToken) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-slate-50 shadow-xl">
          <h1 className="text-xl font-semibold mb-4 text-center">Admin Login</h1>
          {error && (
            <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <div>
              <label className="block text-xs mb-1 text-slate-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 text-sm font-medium py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Default: username <span className="font-mono">admin</span>, password
              <span className="font-mono"> admin123</span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Admin Panel - Users & Invites</h1>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {loadingUsers ? (
          <p className="text-sm">Loading users...</p>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/70">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Invite Code</th>
                  <th className="px-3 py-2 text-left">Sponsor ID</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                  <th className="px-3 py-2 text-right">Total Income</th>
                  <th className="px-3 py-2 text-right">Withdrawal</th>
                  <th className="px-3 py-2 text-center">Direct Invites</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-800 hover:bg-slate-800/60">
                    <td className="px-3 py-2 whitespace-nowrap">{u.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{u.email}</td>
                    <td className="px-3 py-2 whitespace-nowrap font-mono text-amber-300">
                      {u.inviteCode}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap font-mono text-sky-300">
                      {u.sponsorId || "-"}
                    </td>
                    <td className="px-3 py-2 text-right">{u.balance ?? 0}</td>
                    <td className="px-3 py-2 text-right">{u.totalIncome ?? 0}</td>
                    <td className="px-3 py-2 text-right">{u.withdrawal ?? 0}</td>
                    <td className="px-3 py-2 text-center">
                      {u.directInviteCount}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-4 text-center text-slate-400"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-[11px] text-slate-500">
          For each user you can see: who invited them (Sponsor ID), their own
          unique invite code, balance and income totals, and how many direct
          people they have invited.
        </p>
      </div>
    </div>
  );
}
