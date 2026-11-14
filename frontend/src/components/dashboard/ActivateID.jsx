import React, { useState, useEffect } from "react";
import {
  FiZap,
  FiKey,
  FiCheckCircle,
  FiUsers,
  FiDollarSign,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowRight,
  FiShield
} from "react-icons/fi";
import config from "../../config/config";

const API_BASE = config.apiUrl;

export default function ActivateID({ compact = false, onMenuOpen }) {
  const [activeTab, setActiveTab] = useState("generate"); // "generate" or "manual"

  // User Profile
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Common Form States
  const [targetId, setTargetId] = useState(""); // Member ID or Invite Code
  const [targetName, setTargetName] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [inactiveMembers, setInactiveMembers] = useState([]);

  // Manual E-Pin Activation
  const [epin, setEpin] = useState("");
  const [pkg, setPkg] = useState("Basic");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualMsg, setManualMsg] = useState("");

  // Instant Generate & Activate
  const [genLoading, setGenLoading] = useState(false);
  const [genOnlyLoading, setGenOnlyLoading] = useState(false);
  const [genMsg, setGenMsg] = useState("");
  const [lastGenPin, setLastGenPin] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");

  // Self-Generated Pins History
  const [myPins, setMyPins] = useState([]);
  const [pinsLoading, setPinsLoading] = useState(false);

  // Fetch user profile and inactive team
  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setProfileLoading(true);
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
      }
    } catch (e) {
      console.error("Fetch profile error", e);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchDirect = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/dashboard/direct-team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInactiveMembers(data.filter((u) => u.status !== "Active"));
      }
    } catch {}
  };

  const fetchMyGeneratedPins = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setPinsLoading(true);
      const res = await fetch(`${API_BASE}/epins/my-generated`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyPins(data.epins || []);
      }
    } catch {} finally {
      setPinsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchDirect();
    fetchMyGeneratedPins();
  }, []);

  // Debounced lookup for member name
  useEffect(() => {
    const code = targetId.trim();
    if (!code) {
      setTargetName("");
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setLookupLoading(true);
        const res = await fetch(`${API_BASE}/auth/member-lookup/${code}`);
        const data = await res.json();
        if (res.ok && data.member) {
          if (data.member.isActivated) {
            setTargetName(`${data.member.name} (Already Active)`);
          } else {
            setTargetName(data.member.name);
          }
        } else {
          setTargetName("Member not found");
        }
      } catch {
        setTargetName("");
      } finally {
        setLookupLoading(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [targetId]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(""), 2500);
  };

  // 1. Generate E-Pin from Balance Only (Adds to user's wallet)
  const handleGenerateOnly = async () => {
    setGenMsg("");
    const token = localStorage.getItem("token");
    if (!token) return setGenMsg("Please login to generate E-Pin.");

    if (!userProfile?.isActivated) {
      return setGenMsg("Your account must be activated to generate E-Pins.");
    }
    if ((userProfile?.balance || 0) < 1650) {
      return setGenMsg("Insufficient wallet balance. ₹1,650 required per E-Pin (₹1,500 + 10% fee).");
    }

    try {
      setGenOnlyLoading(true);
      const res = await fetch(`${API_BASE}/epins/generate-from-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ count: 1 })
      });
      const data = await res.json();

      if (!res.ok) {
        return setGenMsg(data.message || "Failed to generate E-Pin.");
      }

      const newCode = data.codes?.[0] || data.epins?.[0]?.code;
      setLastGenPin(newCode);
      setEpin(newCode);
      setGenMsg(`E-Pin generated successfully: ${newCode} (₹1,650 deducted [₹1,500 + 10% fee])`);

      // Refresh data
      fetchUserData();
      fetchMyGeneratedPins();
    } catch {
      setGenMsg("Something went wrong while generating E-Pin.");
    } finally {
      setGenOnlyLoading(false);
    }
  };

  // 2. Generate E-Pin & Activate Member in 1-Click
  const handleGenerateAndActivate = async (e) => {
    e?.preventDefault();
    setGenMsg("");
    const token = localStorage.getItem("token");
    if (!token) return setGenMsg("Please login to activate.");

    if (!userProfile?.isActivated) {
      return setGenMsg("Your account must be activated to generate E-Pins.");
    }
    if ((userProfile?.balance || 0) < 1650) {
      return setGenMsg("Insufficient wallet balance. ₹1,650 required for activation (₹1,500 + 10% fee).");
    }

    try {
      setGenLoading(true);
      const res = await fetch(`${API_BASE}/epins/generate-and-activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: targetId.trim() || undefined,
          packageId: "Basic"
        })
      });
      const data = await res.json();

      if (!res.ok) {
        return setGenMsg(data.message || "Failed to generate & activate.");
      }

      setGenMsg(`Success! ${data.message} (E-Pin: ${data.epin})`);
      setLastGenPin(data.epin);
      setTargetId("");
      setTargetName("");

      // Refresh data
      fetchUserData();
      fetchDirect();
      fetchMyGeneratedPins();
    } catch {
      setGenMsg("Something went wrong while processing activation.");
    } finally {
      setGenLoading(false);
    }
  };

  // 3. Manual Activation using an E-Pin code
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualMsg("");

    if (!pkg) return setManualMsg("Please select a package.");
    if (!epin.trim()) return setManualMsg("Please enter E-Pin.");

    const token = localStorage.getItem("token");
    if (!token) return setManualMsg("Please login again to activate your ID.");

    try {
      setManualLoading(true);
      const res = await fetch(`${API_BASE}/dashboard/activate-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          epin: epin.trim(),
          packageId: pkg,
          targetUserId: targetId.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return setManualMsg(data.message || "Activation failed. Please check your E-Pin.");
      }

      setManualMsg(`Activated Successfully! Package: ${pkg}, E-Pin: ${epin}`);
      setEpin("");
      setTargetId("");
      setTargetName("");

      fetchUserData();
      fetchDirect();
      fetchMyGeneratedPins();
    } catch {
      setManualMsg("Something went wrong while activating. Please try again.");
    } finally {
      setManualLoading(false);
    }
  };

  const containerPadding = compact
    ? "px-3 py-4"
    : "px-3 sm:px-6 py-6 sm:py-8";

  const packages = [
    { id: "Basic", label: "Basic", price: "₹1,500", desc: "Standard 1500 package" },
    { id: "Standard", label: "Standard", price: "₹2,199", desc: "Better rewards" },
    { id: "Premium", label: "Premium", price: "₹3,199", desc: "Maximum benefits" }
  ];

  const userBalance = userProfile?.balance || 0;
  const isUserActive = Boolean(userProfile?.isActivated);
  const PIN_COST = 1650; // ₹1,500 base + 10% fee (₹150)
  const canGenerate = isUserActive && userBalance >= PIN_COST;

  return (
    <div className={`w-full min-h-screen bg-slate-100 flex items-start justify-center ${containerPadding}`}>
      <div className="w-full max-w-2xl space-y-6">

        {/* TOP BAR — Menu + Title */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onMenuOpen?.()}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 transition text-slate-700"
              title="Open Navigation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                Activate Member
              </h1>
              <p className="text-xs text-slate-500">
                Generate E-Pins from wallet balance or activate using an existing pin
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              fetchUserData();
              fetchDirect();
              fetchMyGeneratedPins();
            }}
            className="p-2 text-slate-400 hover:text-indigo-600 transition"
            title="Refresh Details"
          >
            <FiRefreshCw className={profileLoading ? "animate-spin" : ""} size={18} />
          </button>
        </div>

        {/* WALLET & STATUS OVERVIEW BANNER */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-200 font-semibold mb-1">
                Your Available Balance
              </p>
              <div className="text-2xl sm:text-3xl font-extrabold flex items-baseline gap-1">
                ₹{userBalance.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-indigo-100/80 mt-1 flex items-center gap-1">
                Cost: <span className="font-semibold text-white">₹1,500 + 10% fee = ₹1,650</span> per E-Pin • Counts towards limit
              </p>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-200 font-semibold mb-1">
                  Account Status
                </p>
                {isUserActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                    <FiCheckCircle size={14} /> ACTIVE ACCOUNT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-200 border border-rose-400/30">
                    <FiAlertCircle size={14} /> INACTIVE ACCOUNT
                  </span>
                )}
              </div>

              <div className="mt-2 text-xs text-indigo-200">
                {isUserActive ? (
                  canGenerate ? (
                    <span className="text-emerald-300 font-medium">
                      ✓ Eligible to generate {Math.floor(userBalance / PIN_COST)} E-Pin(s)
                    </span>
                  ) : (
                    <span className="text-amber-300 font-medium">
                      ⚠️ Needs ₹{(PIN_COST - userBalance).toLocaleString("en-IN")} more to generate
                    </span>
                  )
                ) : (
                  <span className="text-rose-200 font-medium">
                    ⚠️ Activate your account to enable generation
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab("generate")}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === "generate"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FiZap className={activeTab === "generate" ? "text-indigo-600" : "text-slate-400"} />
            Generate from Balance (₹1,650)
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === "manual"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FiKey className={activeTab === "manual" ? "text-indigo-600" : "text-slate-400"} />
            Activate with Existing E-Pin
          </button>
        </div>

        {/* INACTIVE MEMBERS DROPDOWN HELPER */}
        {inactiveMembers.length > 0 && (
          <div className="bg-orange-50 p-3.5 rounded-2xl border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                <FiUsers className="text-orange-600" />
                Quick Select Inactive Direct Member ({inactiveMembers.length})
              </label>
              <span className="text-[10px] text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-medium">
                Click to Auto-fill
              </span>
            </div>
            <select
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-orange-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            >
              <option value="">-- Select Member to Activate --</option>
              {inactiveMembers.map((m) => (
                <option key={m.userId || m.inviteCode} value={m.inviteCode}>
                  {m.name} ({m.inviteCode})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* TAB 1: GENERATE FROM BALANCE & ACTIVATE */}
        {activeTab === "generate" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FiZap className="text-amber-500" />
                  Self-Generate E-Pin & Activate
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cost is ₹1,650 per pin (₹1,500 base + 10% fee) deducted directly from your wallet balance.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                ₹1,650 / Pin
              </span>
            </div>

            {/* Inactive Notice */}
            {!isUserActive && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
                <FiAlertCircle className="shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-bold">Account Activation Required</p>
                  <p className="mt-0.5">
                    Your account must be activated first before you can generate E-Pins from balance. Please use an existing E-Pin in the other tab or contact your sponsor.
                  </p>
                </div>
              </div>
            )}

            {/* Insufficient Balance Notice */}
            {isUserActive && userBalance < PIN_COST && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                <FiDollarSign className="shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-bold">Insufficient Balance</p>
                  <p className="mt-0.5">
                    You have ₹{userBalance.toLocaleString("en-IN")}. You need at least ₹1,650 (₹1,500 + 10% fee) to generate an E-Pin.
                  </p>
                </div>
              </div>
            )}

            {/* Target Member Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Member ID / Invite Code to Activate <span className="text-slate-400 font-normal">(Leave blank to activate yourself)</span>
              </label>
              <div className="relative">
                <FiUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => {
                    setTargetId(e.target.value);
                    setGenMsg("");
                  }}
                  placeholder="e.g. LS123456 (or leave empty for self-activation)"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
                {lookupLoading && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {targetName && (
                <div className="mt-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 ${
                      targetName.includes("Already Active") || targetName === "Member not found"
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-indigo-50 border-indigo-200 text-indigo-700"
                    }`}
                  >
                    <FiShield size={12} />
                    Target: {targetName}
                  </span>
                </div>
              )}
            </div>

            {/* Status Message */}
            {genMsg && (
              <div
                className={`text-xs sm:text-sm font-medium rounded-xl p-3.5 border ${
                  genMsg.startsWith("Success") || genMsg.startsWith("E-Pin generated")
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {genMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGenerateAndActivate}
                disabled={!canGenerate || genLoading || genOnlyLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3.5 rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] transition shadow-md shadow-indigo-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {genLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Generating & Activating Member...
                  </>
                ) : (
                  <>
                    <FiZap />
                    Generate E-Pin & Activate Member Immediately (₹1,650)
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[11px] font-semibold uppercase text-slate-400">OR</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <button
                type="button"
                onClick={handleGenerateOnly}
                disabled={!canGenerate || genLoading || genOnlyLoading}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-200 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {genOnlyLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Generating E-Pin...
                  </>
                ) : (
                  <>
                    <FiKey className="text-indigo-600" />
                    Generate E-Pin to Wallet Only (₹1,650)
                  </>
                )}
              </button>
            </div>

            {/* Last Generated Pin Banner */}
            {lastGenPin && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-indigo-700">Latest Generated E-Pin</p>
                  <p className="font-mono text-sm sm:text-base font-bold text-slate-900 mt-0.5">{lastGenPin}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(lastGenPin)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
                >
                  {copiedCode === lastGenPin ? (
                    <>
                      <FiCheck size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy size={14} /> Copy
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANUAL ACTIVATION USING EXISTING E-PIN */}
        {activeTab === "manual" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiKey className="text-indigo-600" />
                Activate with Existing E-Pin
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Use an E-Pin already in your wallet or transferred by admin/sponsor.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-5">
              {/* Package Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Select Activation Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {packages.map((item) => {
                    const isActive = pkg === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setPkg(item.id);
                          setManualMsg("");
                        }}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                          isActive
                            ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="font-bold text-xs sm:text-sm flex items-center justify-between w-full">
                          {item.label}
                          {isActive && <FiCheckCircle className="text-indigo-600" size={15} />}
                        </span>
                        <span className="text-xs font-semibold text-indigo-600 mt-0.5">
                          {item.price}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Member */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Member ID / Invite Code <span className="text-slate-400 font-normal">(Leave blank to activate yourself)</span>
                </label>
                <div className="relative">
                  <FiUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={targetId}
                    onChange={(e) => {
                      setTargetId(e.target.value);
                      setManualMsg("");
                    }}
                    placeholder="Leave empty to activate yourself"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  {lookupLoading && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {targetName && (
                  <p className={`text-xs mt-1.5 font-medium px-2 py-1 rounded bg-slate-100 border inline-block ${
                    targetName === "Member not found" || targetName.includes("Already Active") ? "text-rose-600" : "text-indigo-600"
                  }`}>
                    Member: {targetName}
                  </p>
                )}
              </div>

              {/* E-Pin Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  E-Pin Code
                </label>
                <div className="relative">
                  <FiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={epin}
                    onChange={(e) => {
                      setEpin(e.target.value);
                      setManualMsg("");
                    }}
                    placeholder="Enter E-Pin code"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Status Message */}
              {manualMsg && (
                <div
                  className={`text-xs sm:text-sm font-medium rounded-xl p-3 border ${
                    manualMsg.startsWith("Activated")
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {manualMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={manualLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-indigo-100 active:scale-[0.99] transition disabled:opacity-50"
              >
                {manualLoading ? "Activating Member..." : "Activate Now"}
              </button>
            </form>
          </div>
        )}

        {/* RECENT SELF-GENERATED PINS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <FiKey className="text-indigo-600" />
                My Self-Generated E-Pins
              </h3>
              <p className="text-xs text-slate-500">
                E-Pins you generated using your wallet balance (₹1,500 + 10% fee = ₹1,650)
              </p>
            </div>
            <button
              onClick={fetchMyGeneratedPins}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <FiRefreshCw className={pinsLoading ? "animate-spin" : ""} size={12} />
              Refresh
            </button>
          </div>

          {pinsLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading your E-Pins...</div>
          ) : myPins.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FiKey className="mx-auto text-slate-300 mb-1.5" size={24} />
              <p className="text-xs text-slate-500">No self-generated E-Pins yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Generate pins from your balance above to see them here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">E-Pin Code</th>
                    <th className="py-2.5 px-3">Cost</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Activated Member</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myPins.map((p) => {
                    const isUsed = Boolean(p.used);
                    return (
                      <tr key={p._id || p.code} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-purple-900 block">{p.code}</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-100 text-purple-700 border border-purple-200 mt-0.5">
                            ⭐ SELF-GENERATED
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          ₹{p.cost || 1650}
                        </td>
                        <td className="py-3 px-3">
                          {isUsed ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              USED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              AVAILABLE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {p.activatedUser ? (
                            <div>
                              <span className="font-semibold text-slate-900">{p.activatedUser.name}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                ({p.activatedUser.inviteCode})
                              </span>
                            </div>
                          ) : isUsed ? (
                            <span className="text-slate-400">Activated</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) : "—"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(p.code)}
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition"
                          >
                            {copiedCode === p.code ? (
                              <>
                                <FiCheck size={12} className="text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <FiCopy size={12} />
                                Copy
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
