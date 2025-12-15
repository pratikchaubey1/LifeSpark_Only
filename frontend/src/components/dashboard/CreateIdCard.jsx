import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiPrinter, FiArrowRight } from "react-icons/fi";

const API_BASE = "http://localhost:5000";

const MotionDiv = motion.div;

function makeMemberId(inviteCode) {
  const cleaned = String(inviteCode || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  // Keep it short but stable based on invite code
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
        const res = await fetch(`${API_BASE}/api/profile`, {
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
  const issuedOn = useMemo(() => new Date().toLocaleDateString(), []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={
        embedded
          ? "w-full flex justify-center py-6"
          : "min-h-screen bg-slate-950 flex items-center justify-center px-4"
      }
    >
      {/* print helpers */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      {/* background glow */}
      {!embedded && (
        <div className="absolute inset-0 -z-10 no-print">
          <div className="absolute -top-32 -left-32 h-80 w-80 bg-indigo-500/40 blur-3xl rounded-full" />
          <div className="absolute -bottom-32 -right-32 h-80 w-80 bg-violet-500/40 blur-3xl rounded-full" />
        </div>
      )}

      <MotionDiv
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="max-w-3xl w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8"
      >
        <div className="flex items-start justify-between gap-4 no-print">
          <div>
            <p className="text-xs text-slate-400">Life Spark</p>
            <h1 className="text-2xl font-semibold text-white">Create ID Card</h1>
            <p className="text-sm text-slate-400 mt-1">
              Print or “Save as PDF” from your browser.
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="shrink-0 rounded-xl px-3 py-2 text-sm bg-slate-950 border border-slate-800 text-slate-200 hover:bg-slate-900 transition inline-flex items-center gap-2"
            >
              <FiArrowLeft />
              Back
            </button>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center">
          {/* ID CARD */}
          <div className="print-area w-full max-w-md rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-semibold text-white leading-tight">
                Life<br />Spark
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Member ID</p>
                <p className="text-sm font-semibold text-slate-100 tracking-wider">
                  {memberId}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[11px] text-slate-400">Name</p>
              <p className="text-lg font-semibold text-white">{effectiveName}</p>
            </div>

            <div className="mt-3">
              <p className="text-[11px] text-slate-400">Email</p>
              <p className="text-sm text-slate-200 break-all">{effectiveEmail}</p>
            </div>

            <div className="mt-3">
              <p className="text-[11px] text-slate-400">Invite Code</p>
              <p className="text-sm font-medium text-indigo-300">{effectiveInviteCode}</p>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">Issued: {issuedOn}</p>
              <p className="text-[11px] text-slate-500">Valid: Lifetime</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-3 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full rounded-xl py-2.5 text-sm font-medium bg-slate-950 border border-slate-800 text-slate-100 flex items-center justify-center gap-2 hover:bg-slate-900 transition"
          >
            <FiPrinter />
            Print / Save PDF
          </button>

          <button
            onClick={onContinue}
            className="w-full rounded-xl py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-500 text-white flex items-center justify-center gap-2 hover:brightness-110 transition"
          >
            Go to Dashboard
            <FiArrowRight />
          </button>
        </div>
      </MotionDiv>
    </div>
  );
}
