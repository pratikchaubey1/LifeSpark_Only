import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiPrinter,
  FiArrowRight,
  FiCheckCircle,
  FiUser,
  FiMail,
  FiCalendar,
  FiShield
} from "react-icons/fi";
import config from "../../config/config";

const API_BASE = config.apiUrl;
const MotionDiv = motion.div;

function makeMemberId(inviteCode) {
  const cleaned = String(inviteCode || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return cleaned ? cleaned.slice(-8) : "LS000000";
}

export default function CreateIdCard({
  userName = "Member",
  email = "user@example.com",
  inviteCode = "LS-INV-0000",
  embedded = false,
  onBack,
  onContinue,
}) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user) setProfile(data.user);
      } catch {
        // ignore
      }
    })();
  }, []);

  const effectiveName = profile?.name || userName;
  const effectiveEmail = profile?.email || email;
  const effectiveInviteCode = profile?.inviteCode || inviteCode;
  const memberId = useMemo(
    () => makeMemberId(profile?.id || effectiveInviteCode),
    [profile?.id, effectiveInviteCode]
  );
  const issuedOn = useMemo(() => new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }), []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen ${embedded ? "" : "bg-slate-900"} px-4 py-8 flex items-center justify-center`}>
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center justify-between no-print mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiShield className="text-blue-500" /> LifeSpark Associate ID
            </h1>
            <p className="text-xs text-slate-400 mt-1">Official Digital Identity Card</p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="shrink-0 rounded-xl px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition inline-flex items-center gap-2"
            >
              <FiArrowLeft />
              Back
            </button>
          )}
        </div>

        {/* ID CARD */}
        <div className="flex justify-center my-4">
          <div
            style={{ width: "360px", height: "560px", boxSizing: "border-box" }}
            className="print-area relative rounded-[28px] overflow-hidden border border-slate-300 bg-white shadow-2xl flex flex-col justify-between select-none text-slate-800"
          >
            {/* Lanyard punch slot simulation */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-2.5 rounded-full bg-slate-200/80 border border-slate-300/80 z-20 shadow-inner"></div>

            {/* HEADER */}
            <div
              style={{
                background: "linear-gradient(135deg, #0a192f 0%, #112240 50%, #1d3557 100%)",
              }}
              className="relative pt-6 pb-4 px-5 text-white shrink-0"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-amber-300/50">
                    <img
                      src="/one.png"
                      alt="LifeSpark"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/3256/3256121.png";
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-white font-black text-sm tracking-wide uppercase leading-tight font-sans">
                      LifeSpark
                    </div>
                    <div className="text-amber-400 text-[8px] font-bold tracking-[0.2em] uppercase">
                      Global Associates
                    </div>
                  </div>
                </div>

                {/* Smart Chip */}
                <div className="w-9 h-6 rounded bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 border border-amber-500/60 shadow-sm flex flex-col justify-between p-1 shrink-0">
                  <div className="h-[2px] w-full bg-amber-600/40 rounded-full"></div>
                  <div className="h-[2px] w-full bg-amber-600/40 rounded-full"></div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[9px] font-bold tracking-wider uppercase text-blue-100">
                <span>Official Identity Card</span>
                <span className="text-amber-400 font-mono">ISO 9001:2015</span>
              </div>
            </div>

            {/* BODY */}
            <div className="px-5 py-3 flex-1 flex flex-col justify-between bg-white">
              {/* Photo & Name */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <div className="w-22 h-22 rounded-2xl p-[3px] bg-gradient-to-br from-amber-400 via-blue-600 to-indigo-700 shadow-md">
                    <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-blue-700">
                      <FiUser size={32} />
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                        Associate
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow border-2 border-white">
                    <FiCheckCircle size={12} />
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase line-clamp-1">
                  {effectiveName}
                </h3>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 mt-0.5">
                  Independent Business Associate
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono font-bold">
                  <span className="text-[9px] text-blue-500 font-sans uppercase">ID:</span>
                  <span>{effectiveInviteCode}</span>
                </div>
              </div>

              {/* Details List */}
              <div className="my-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold uppercase text-[9px] flex items-center gap-1.5">
                    <FiMail size={11} className="text-blue-600" /> Email
                  </span>
                  <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                    {effectiveEmail}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold uppercase text-[9px] flex items-center gap-1.5">
                    <FiCalendar size={11} className="text-blue-600" /> Issued
                  </span>
                  <span className="font-semibold text-slate-700">
                    {issuedOn}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold uppercase text-[9px] flex items-center gap-1.5">
                    <FiShield size={11} className="text-blue-600" /> Validity
                  </span>
                  <span className="font-bold text-emerald-600">
                    Lifetime Active
                  </span>
                </div>
              </div>

              {/* Authentication */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div className="text-left">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Verified Member
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif italic text-blue-900 text-xs font-bold leading-none pr-1">
                    LifeSpark
                  </div>
                  <div className="w-16 border-b border-slate-300 my-0.5 ml-auto"></div>
                  <div className="text-[7.5px] font-extrabold uppercase tracking-wider text-slate-400">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-center text-[8px] font-mono tracking-widest uppercase shrink-0 border-t border-slate-800">
              LIFESPARK GLOBAL ASSOCIATES • OFFICIAL MEMBER CARD
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 grid sm:grid-cols-2 gap-3 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full rounded-xl py-3 text-sm font-bold bg-white text-slate-800 border border-slate-300 shadow hover:bg-slate-100 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <FiPrinter />
            Print / Save PDF
          </button>

          <button
            onClick={onContinue}
            className="w-full rounded-xl py-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:brightness-110 transition active:scale-95"
          >
            Go to Dashboard
            <FiArrowRight />
          </button>
        </div>
      </MotionDiv>
    </div>
  );
}
