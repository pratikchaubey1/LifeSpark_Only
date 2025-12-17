import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCreditCard } from "react-icons/fi";

import config from "../../config/config";

const API_BASE = config.apiUrl;

const MotionDiv = motion.div;

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
  const issuedOn = new Date().toLocaleDateString();

  return (
    <div
      className={
        embedded
          ? "w-full flex justify-center py-8 bg-slate-100"
          : "min-h-screen bg-slate-100 flex items-center justify-center px-4"
      }
    >
      <MotionDiv
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full bg-white border border-slate-300 shadow-xl rounded-xl"
      >
        {/* HEADER */}
        <div className="border-b px-8 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Life Spark Associates
            </h1>
            <p className="text-sm text-slate-500">
              Official Welcome Letter
            </p>
          </div>

          <div className="text-sm text-slate-500 text-right">
            <p>Date: {issuedOn}</p>
            <p>Member ID: <span className="font-mono">{memberId}</span></p>
          </div>
        </div>

        {/* BODY */}
        <div className="px-8 py-6 text-slate-700 leading-relaxed text-[15px]">
          <p className="mb-4">
            Dear <span className="font-semibold">{effectiveName}</span>,
          </p>

          <p className="mb-4">
            We are pleased to welcome you to <strong>Life Spark Associates</strong>.
            Your registration has been successfully completed, and we are delighted
            to have you as part of our growing organization.
          </p>

          <p className="mb-4">
            At Life Spark, we believe in building long-term professional
            relationships based on trust, transparency, and growth. We are confident
            that your association with us will be mutually beneficial.
          </p>

          <p className="mb-4">
            Below are your registration details for future reference:
          </p>

          {/* DETAILS TABLE */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-5">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium bg-slate-50 w-1/3">
                    Member Name
                  </td>
                  <td className="px-4 py-2">{effectiveName}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium bg-slate-50">
                    Email Address
                  </td>
                  <td className="px-4 py-2">{effectiveEmail}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium bg-slate-50">
                    Member ID
                  </td>
                  <td className="px-4 py-2 font-mono">{memberId}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium bg-slate-50">
                    Invite Code
                  </td>
                  <td className="px-4 py-2 font-mono">{effectiveInviteCode}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            You may use your invite code to refer new members and expand your
            network. Kindly ensure that your login credentials remain confidential.
          </p>

          <p className="text-sm text-slate-500 italic">
            Note: This is a system-generated welcome letter and does not require a
            physical signature.
          </p>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="border-t px-8 py-5 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50">
          <div className="flex gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 border rounded-md text-sm flex items-center gap-2 hover:bg-white"
              >
                <FiArrowLeft />
                Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCreateIdCard}
              className="px-4 py-2 border rounded-md text-sm flex items-center gap-2 hover:bg-white"
            >
              <FiCreditCard />
              Create ID Card
            </button>

            <button
              onClick={onContinue}
              className="px-5 py-2 rounded-md text-sm font-medium bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700"
            >
              Continue to Dashboard
              <FiArrowRight />
            </button>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
