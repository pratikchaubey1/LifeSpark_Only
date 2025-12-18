import React, { useEffect, useState } from "react";

import config from "../../config/config";

/* ---------- COLOR CONFIG ---------- */

const topStatConfig = [
  {
    label: "Total Income",
    key: "totalIncome",
    color: "bg-gradient-to-r from-blue-500 to-indigo-600",
  },
  {
    label: "Withdrawal",
    key: "withdrawal",
    color: "bg-gradient-to-r from-amber-400 to-orange-500",
  },
  {
    label: "Balance",
    key: "balance",
    color: "bg-gradient-to-r from-red-500 to-rose-600",
  },
  {
    label: "Freadom(Pool) Income",
    key: "freedomIncome",
    color: "bg-gradient-to-r from-emerald-500 to-teal-600",
  },
  {
    label: "Daily Bonus Income",
    key: "dailyBonusIncome",
    color: "bg-gradient-to-r from-green-500 to-lime-600",
  },
  {
    label: "Rank Reward Income",
    key: "rankRewardIncome",
    color: "bg-gradient-to-r from-purple-500 to-fuchsia-600",
  },
];

const bottomStatConfig = [
  {
    label: "Repurchase Income",
    key: "repurchaseIncome",
    color: "bg-gradient-to-r from-cyan-500 to-sky-600",
  },
  {
    label: "Today Active",
    key: "todayActive",
    color: "bg-gradient-to-r from-green-500 to-emerald-600",
  },
  {
    label: "Today InActive",
    key: "todayInactive",
    color: "bg-gradient-to-r from-red-400 to-red-600",
  },
  {
    label: "Today Total Id",
    key: "todayTotalId",
    color: "bg-gradient-to-r from-indigo-500 to-violet-600",
  },
  {
    label: "Total User",
    key: "totalUser",
    color: "bg-gradient-to-r from-slate-500 to-slate-700",
  },
  {
    label: "Total Active User",
    key: "totalActiveUser",
    color: "bg-gradient-to-r from-emerald-500 to-green-700",
  },
  {
    label: "Total InActive User",
    key: "totalInactiveUser",
    color: "bg-gradient-to-r from-rose-500 to-pink-600",
  },
  {
    label: "Total Direct",
    key: "totalDirect",
    color: "bg-gradient-to-r from-blue-400 to-blue-600",
  },
  {
    label: "Total Direct Active",
    key: "totalDirectActive",
    color: "bg-gradient-to-r from-teal-500 to-cyan-600",
  },
  {
    label: "Total Direct InActive",
    key: "totalDirectInactive",
    color: "bg-gradient-to-r from-orange-400 to-orange-600",
  },
];

/* ---------- COMPONENT ---------- */

function DashBoardPage() {
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${config.apiUrl}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const data = await res.json();
        setUser(data.user);
        setCards(data.cards || {});
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    })();
  }, []);

  return (
    <div className="min-h-full bg-white">
      {/* Top info bar */}
      <div className="bg-sky-600 text-center text-white text-sm py-2">
        सपनों की दुनिया को वास्तविकता में बदलने जा रहा।
      </div>

      {/* Activation notice */}
      <div className="text-center text-red-600 text-sm mt-2 cursor-pointer">
        Click here to activate your account!
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="bg-red-500 text-white font-semibold text-center py-2">
            Congratulation!
          </div>
          <div className="bg-sky-500 text-white text-center py-6">
            <div className="text-xl font-semibold">
              {user ? user.name : "Member Name"}
            </div>
            <div className="mt-1 text-sm">{user?.id || "User ID"}</div>
            <div className="mt-1 text-sm">Post</div>
            <div className="mt-4 text-xs">
              Joining Date:{" "}
              {user?.createdAt
                ? user.createdAt.slice(0, 10)
                : "--/--/----"}
            </div>
            <div className="text-xs">
              Sponsor ID : {user?.sponsorId || "-"}
            </div>
            {user?.inviteCode && (
              <div className="mt-1 text-xs">
                Your Invite Code:{" "}
                <span className="font-semibold">{user.inviteCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topStatConfig.map((item) => (
            <div
              key={item.label}
              className={`${item.color} text-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-[1.02] transition`}
            >
              <div className="text-xs opacity-90">{item.label}</div>
              <div className="mt-2 text-lg font-semibold">
                {cards ? `${cards[item.key] || 0} INR` : "0 INR"}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bottomStatConfig.map((item) => (
            <div
              key={item.label}
              className={`${item.color} text-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-[1.02] transition`}
            >
              <div className="text-xs opacity-90">{item.label}</div>
              <div className="mt-2 text-lg font-semibold">
                {cards ? cards[item.key] || 0 : 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashBoardPage;
