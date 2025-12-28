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
  const [settings, setSettings] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        // Fetch dashboard data
        const res = await fetch(`${config.apiUrl}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setCards(data.cards || {});
        }

        // Fetch site settings
        const settingsRes = await fetch(`${config.apiUrl}/settings`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);

          // Show popup if enabled and not already dismissed in this session
          if (settingsData.popupEnabled && settingsData.popupImageUrl) {
            const hasSeenPopup = sessionStorage.getItem("announcement_popup_seen");
            if (!hasSeenPopup) {
              setTimeout(() => setShowPopup(true), 1200);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    })();
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("announcement_popup_seen", "true");
  };

  return (
    <div className="min-h-full bg-white relative">
      {/* Top info bar (Marquee) */}
      {settings?.marqueeEnabled && (
        <div className="bg-sky-600 border-b border-sky-500 overflow-hidden py-2 shadow-sm sticky top-0 z-40">
          <marquee
            behavior="scroll"
            direction="left"
            scrollamount="6"
            className="text-white text-sm font-semibold"
          >
            {settings.marqueeText || "सपनों की दुनिया को वास्तविकता में बदलने जा रहा।"}
          </marquee>
        </div>
      )}

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-10 md:pt-20 px-4 bg-black/80 backdrop-blur-[4px] transition-all">
          <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden scale-100 transition-all duration-500">
            {/* Close button inside a prominent circle */}
            <button
              onClick={closePopup}
              className="absolute top-5 right-5 z-[10001] p-3 bg-white/90 hover:bg-white text-slate-900 rounded-full shadow-xl transition-all hover:rotate-90 active:scale-90"
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Visual Content Section */}
            <div className="p-2 pt-14 pb-4">
              <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                <img
                  src={settings.popupImageUrl}
                  alt="Special Announcement"
                  className="max-w-full h-auto max-h-[65vh] object-contain shadow-inner"
                  onError={() => setShowPopup(false)}
                />
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="px-8 pb-8 pt-2 text-center">
              <button
                onClick={closePopup}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-blue-300 transform active:translate-y-1"
              >
                GOT IT!
              </button>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-1.5 w-8 bg-blue-600 rounded-full"></span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Life Spark Updates</span>
                <span className="h-1.5 w-8 bg-blue-600 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activation status badge */}
      <div className="flex justify-center mt-3">
        {user?.isActivated ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            ✅ Status: Active
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            ⚠️ Status: Inactive
          </span>
        )}
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Profile + Referral Section */}
        {/* Profile + Referral Section */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT — Referral Link */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            {/* Header */}
            <div className="bg-red-500 text-white font-semibold text-center py-2">
              Referral Link
            </div>

            {/* Body */}
            <div className="bg-sky-500 text-white flex flex-col justify-center items-center p-6 h-[260px]">
              <div className="text-sm mb-4 opacity-90">Your Referral Link</div>

              <div className="flex w-4/5 max-w-md">
                <input
                  type="text"
                  readOnly
                  value={
                    user?.inviteCode
                      ? `${window.location.origin}/register/${user.inviteCode}`
                      : "No referral link"
                  }
                  className="flex-1 rounded-l-lg p-2 text-sm bg-white text-black border-none outline-none"
                />
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/register/${user?.inviteCode}`;
                    navigator.clipboard.writeText(link);
                    alert("Referral Link Copied!");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — Member Profile */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            {/* Header */}
            <div className="bg-red-500 text-white font-semibold text-center py-2">
              Congratulation!
            </div>

            {/* Body */}
            <div className="bg-sky-500 text-white flex flex-col justify-center items-center p-6 h-[260px]">
              <div className="text-xl font-semibold">
                {user ? user.name : "Member Name"}
              </div>

              <div className="mt-1 text-sm">{user?.id || "User ID"}</div>
              <div className="text-sm">Post</div>

              <div className="mt-4 text-xs">
                Joining Date:{" "}
                {user?.createdAt ? user.createdAt.slice(0, 10) : "--/--/----"}
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
