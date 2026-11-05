import React, { useEffect, useState } from "react";
import config from "../../config/config";
import toast from "react-hot-toast";

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
    label: "Autopool Income",
    key: "autopoolIncome",
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
  {
    label: "Level Income",
    key: "levelIncome",
    color: "bg-gradient-to-r from-indigo-400 to-blue-500",
  },
  {
    label: "Marriage Fund",
    key: "marriageFund",
    color: "bg-gradient-to-r from-pink-500 to-rose-500",
  },
  {
    label: "Accident Fund",
    key: "accidentFund",
    color: "bg-gradient-to-r from-orange-600 to-red-600",
  },
];

const bottomStatConfig = [
  {
    label: "Repurchase Wallet",
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

function DashBoardPage({ setLoading: setParentLoading }) {
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState(null);
  const [settings, setSettings] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [rankInfo, setRankInfo] = useState(null);
  const [showRankChart, setShowRankChart] = useState(false);

  // 60-Day Upgrade System
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [upgradeRequesting, setUpgradeRequesting] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState('none'); // none, pending, expired

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        if (setParentLoading) setParentLoading(true);
        // Fetch dashboard data and settings in parallel
        const [dashRes, settingsRes] = await Promise.all([
          fetch(`${config.apiUrl}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${config.apiUrl}/settings`)
        ]);

        if (dashRes.ok) {
          const data = await dashRes.json();
          setUser(data.user);
          setCards(data.cards || {});
          setRankInfo(data.rankInfo || null);
          setUpgradeRequired(false); // 60-day upgrade popup disabled
          setDaysRemaining(data.daysRemaining);
          setUpgradeStatus(data.user?.upgradeStatus || 'none');
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);

          // Show popup if enabled and not already seen
          if (settingsData.popupEnabled && settingsData.popupImageUrl) {
            const hasSeenPopup = sessionStorage.getItem("announcement_popup_seen");
            if (!hasSeenPopup) {
              // Removed the 1.2s delay to make it feel instant
              setShowPopup(true);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
        if (setParentLoading) setParentLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (setParentLoading) setParentLoading(false);
    };
  }, [setParentLoading]);

  const handleRequestUpgrade = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setUpgradeRequesting(true);
    try {
      const res = await fetch(`${config.apiUrl}/dashboard/request-upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Upgrade request submitted!");
        setUpgradeStatus('pending');
      } else {
        toast.error(data.message || "Failed to submit upgrade request.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setUpgradeRequesting(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("announcement_popup_seen", "true");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white relative">

      {/* 60-Day Upgrade Popup (REMOVED: IDs have lifetime validity) */}
      {/* 60-day upgrade system and popup have been disabled per user request */}
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

      {/* Activation status badge + Admin Custom Tag */}
      <div className="flex justify-center items-center gap-2 mt-3 flex-wrap">
        {user?.isActivated ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
            ✅ Status: Active
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200 shadow-sm">
            ⚠️ Status: Inactive
          </span>
        )}

        {user?.customTag && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-sm border border-amber-300/60">
            <span>🏷️</span>
            <span>{user.customTag}</span>
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
                    toast.success("Referral Link Copied!");
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
              <div className="mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 flex items-center gap-1">
                👑 Rank: {user?.rank || "Member"}
              </div>

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

        {/* Rank & Achievement Block */}
        <div className="mt-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/50 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-indigo-900/40">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 border border-amber-300/40">
                  👑
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                    Official Member Rank
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white mt-0.5 flex items-center gap-2">
                    <span>{user?.rank || "Member"}</span>
                    {rankInfo?.achievedLevel > 0 && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Level {rankInfo.achievedLevel} Qualified
                      </span>
                    )}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRankChart(!showRankChart)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600/60 hover:bg-indigo-600 border border-indigo-400/30 text-indigo-100 transition flex items-center gap-2 shadow-sm"
                >
                  <span>📊</span>
                  <span>{showRankChart ? "Hide Rank Chart" : "View Rank Chart"}</span>
                </button>
              </div>
            </div>

            {/* Next Rank Progress */}
            {rankInfo?.nextTier ? (
              <div className="mt-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 mb-2">
                  <span className="text-indigo-200">
                    Next Rank: <strong className="text-amber-300 font-bold">{rankInfo.nextTier.rank}</strong> (Level {rankInfo.nextTier.level})
                  </span>
                  <span className="text-indigo-300 font-mono">
                    {rankInfo.nextTier.currentCount.toLocaleString()} / {rankInfo.nextTier.target.toLocaleString()} Team ({rankInfo.nextTier.progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: Math.min(100, Math.max(3, rankInfo.nextTier.progressPercent)) + '%' }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {rankInfo.nextTier.currentCount >= rankInfo.nextTier.target
                    ? "Target completed! Rank upgrade unlocked."
                    : 'Complete ' + (rankInfo.nextTier.target - rankInfo.nextTier.currentCount).toLocaleString() + ' more downline team members at Level ' + rankInfo.nextTier.level + ' to unlock ' + rankInfo.nextTier.rank + '.'}
                </p>
              </div>
            ) : (
              <div className="mt-4 text-xs text-amber-300 font-medium">
                🌟 Outstanding! You have achieved the highest rank: {user?.rank || "Crown Royal Ambassador"}.
              </div>
            )}

            {/* Expandable 10-Level Rank Table from User's Chart */}
            {showRankChart && (
              <div className="mt-6 pt-5 border-t border-indigo-900/40">
                <h3 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                  <span>📜</span>
                  <span>10-Level Rank & Team Chart</span>
                </h3>
                <div className="overflow-x-auto rounded-xl border border-indigo-900/50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-indigo-950/80 text-amber-300 font-bold uppercase tracking-wider border-b border-indigo-900/50">
                      <tr>
                        <th className="p-3">S.N.</th>
                        <th className="p-3">Level</th>
                        <th className="p-3 text-right">Team Target</th>
                        <th className="p-3">Rank Name</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-950/50 bg-slate-900/70">
                      {(rankInfo?.tiers || [
                        { level: 1, rank: "Associate", target: 10 },
                        { level: 2, rank: "Executive Associate", target: 100 },
                        { level: 3, rank: "Team Leader", target: 1000 },
                        { level: 4, rank: "Senior Leader", target: 10000 },
                        { level: 5, rank: "Bronze Manager", target: 100000 },
                        { level: 6, rank: "Silver Manager", target: 1000000 },
                        { level: 7, rank: "Gold Director", target: 10000000 },
                        { level: 8, rank: "Platinum Director", target: 100000000 },
                        { level: 9, rank: "Diamond Ambassador", target: 1000000000 },
                        { level: 10, rank: "Crown Royal Ambassador", target: 100000000000 },
                      ]).map((t) => {
                        const count = rankInfo?.levelCounts?.[t.level] ?? 0;
                        const isAchieved = count >= t.target;
                        const isCurrent = user?.rank === t.rank;
                        return (
                          <tr
                            key={t.level}
                            className={'hover:bg-indigo-950/40 transition ' + (
                              isCurrent
                                ? "bg-amber-500/15 font-bold text-amber-200"
                                : isAchieved
                                ? "text-emerald-300"
                                : "text-slate-300"
                            )}
                          >
                            <td className="p-3 font-mono">{t.level}</td>
                            <td className="p-3 font-semibold">LEVEL {t.level}</td>
                            <td className="p-3 text-right font-mono font-semibold">
                              {t.target.toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className="flex items-center gap-1.5">
                                {isCurrent ? "👑 " : isAchieved ? "✅ " : "🔒 "}
                                {t.rank}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {isCurrent ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                                  Current
                                </span>
                              ) : isAchieved ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Achieved
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {count.toLocaleString()} / {t.target.toLocaleString()}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
