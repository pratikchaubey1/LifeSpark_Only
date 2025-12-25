import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCreditCard } from "react-icons/fi";
import config from "../../config/config";

const API_BASE = config.apiUrl;

function makeMemberId(inviteCode) {
  const cleaned = String(inviteCode || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return cleaned ? cleaned.slice(-8) : "LS000000";
}

export default function WelcomeLetter({
  userName = "Member",
  email = "user@example.com",
  inviteCode = "LS-INV-0000",
  embedded = false,
  onBack,
  onCreateIdCard,
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
      } catch {}
    })();
  }, []);

  const effectiveName = profile?.name || userName;
  const effectiveEmail = profile?.email || email;
  const effectiveInviteCode = profile?.inviteCode || inviteCode;
  const memberId = useMemo(
    () => makeMemberId(profile?.id || effectiveInviteCode),
    [profile?.id, effectiveInviteCode]
  );

  const issuedOn = new Date().toLocaleDateString();

  return (
    <div
      className={`${
        embedded ? "w-full py-10" : "min-h-screen"
      } flex justify-center bg-[#f4efe6] px-4`}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          max-w-4xl w-full bg-[#fffdf7] border-[6px] border-[#d4b068] 
          shadow-2xl rounded-2xl relative overflow-hidden
        "
        style={{
          backgroundImage:
            "linear-gradient(135deg, #fffdf7 0%, #faf5e9 100%)",
        }}
      >
        {/* Decorative Gold Top Border */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#b58a3b] via-[#e7c983] to-[#b58a3b]" />

        {/* HEADER */}
        <div className="px-10 pt-10 pb-6 text-center">
          <h1 className="text-4xl font-bold text-[#b48b3a] tracking-wide">
            LIFE SPARK ASSOCIATES
          </h1>

          <p className="text-lg text-slate-600 mt-1 tracking-wider uppercase">
            Official Welcome Certificate
          </p>

          {/* Divider line */}
          <div className="mt-4 mx-auto h-[2px] w-40 bg-[#d1b070]" />
        </div>

        {/* GOLDEN BORDER INNER BOX */}
        <div className="mx-8 border border-[#d4b068] rounded-xl p-8 my-6 bg-white/70 shadow-inner">

          <p className="text-lg text-slate-700 leading-relaxed mb-4">
            This is to certify that:
          </p>

          <h2 className="text-3xl font-bold text-[#8c6a24] mb-2">
            {effectiveName}
          </h2>

          <p className="text-md text-slate-700 mb-6">
            has been officially registered as a member of
            <span className="font-semibold"> Life Spark Associates</span>.
          </p>

          {/* GOLD INFO TABLE */}
          <div className="border border-[#ccb06e] rounded-lg overflow-hidden mb-6">
            <table className="w-full text-[15px]">
              <tbody>
                <tr className="border-b border-[#e8d9ab]">
                  <td className="px-4 py-2 bg-[#f8f2df] font-semibold w-1/3 text-[#8a6c2c]">
                    Member Name
                  </td>
                  <td className="px-4 py-2">{effectiveName}</td>
                </tr>

                <tr className="border-b border-[#e8d9ab]">
                  <td className="px-4 py-2 bg-[#f8f2df] font-semibold text-[#8a6c2c]">
                    Email
                  </td>
                  <td className="px-4 py-2">{effectiveEmail}</td>
                </tr>

                <tr className="border-b border-[#e8d9ab]">
                  <td className="px-4 py-2 bg-[#f8f2df] font-semibold text-[#8a6c2c]">
                    Member ID
                  </td>
                  <td className="px-4 py-2 font-mono">{memberId}</td>
                </tr>

                <tr>
                  <td className="px-4 py-2 bg-[#f8f2df] font-semibold text-[#8a6c2c]">
                    Invite Code
                  </td>
                  <td className="px-4 py-2 font-mono">
                    {effectiveInviteCode}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[15px] text-slate-700 leading-relaxed mb-2">
            You are now part of a growing community focused on opportunity,
            leadership, and personal growth.
          </p>

          <p className="text-[13px] italic text-slate-500">
            Issued on: {issuedOn}
          </p>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="border-t px-8 py-6 bg-[#f8f3e5] flex flex-col sm:flex-row justify-between items-center gap-3">

          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 border border-[#d4b068] rounded-md text-sm flex items-center gap-2 hover:bg-white"
            >
              <FiArrowLeft /> Back
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCreateIdCard}
              className="px-4 py-2 border border-[#d4b068] rounded-md text-sm flex items-center gap-2 hover:bg-white"
            >
              <FiCreditCard /> Create ID Card
            </button>

            <button
              onClick={onContinue}
              className="px-5 py-2 rounded-md text-sm font-medium bg-[#caa24d] text-white hover:bg-[#b88f3e] flex items-center gap-2"
            >
              Continue <FiArrowRight />
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
