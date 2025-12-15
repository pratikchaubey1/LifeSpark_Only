import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheck,
  FiArrowRight,
  FiFileText,
  FiCreditCard,
} from "react-icons/fi";

export default function WelcomePage({
  userName = "Pratik",
  email = "user@example.com",
  password = "password123",
  inviteCode = "LS-INV-1029",
  onContinue,
  onViewWelcomeLetter,
  onCreateIdCard,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-80 w-80 bg-indigo-500/40 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 bg-violet-500/40 blur-3xl rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="max-w-3xl w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-semibold text-white">
            Life<br />Spark
          </div>
          <div>
            <p className="text-xs text-slate-400">Welcome to Life Spark</p>
            <h1 className="text-2xl font-semibold text-white">
              Hello, <span className="text-indigo-400">{userName}</span> 👋
            </h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Left */}
          <div className="space-y-4">
            {/* Profile */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <p className="text-xs uppercase text-slate-500 mb-2">
                Profile Info
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FiUser className="text-indigo-400" />
                  <span className="text-slate-200">{userName}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FiMail className="text-sky-400" />
                  <span className="text-slate-200 truncate">{email}</span>
                </div>
              </div>
            </div>

            {/* Login details */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <p className="text-xs uppercase text-slate-500 mb-2">
                Login Details
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                  <FiMail className="text-slate-400" />
                  <span className="text-xs text-slate-200 truncate">
                    {email}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                  <FiLock className="text-slate-400" />
                  <span className="flex-1 text-slate-200 text-sm">
                    {showPassword ? password : "••••••••"}
                  </span>
                  <button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <FiEyeOff className="text-slate-400" />
                    ) : (
                      <FiEye className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Invite Code */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
              <p className="text-xs uppercase tracking-wider mb-2">
                Your Invite Code
              </p>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-black/30 rounded-xl px-3 py-2 font-semibold tracking-wide">
                  {inviteCode}
                </div>
                <button
                  onClick={copyCode}
                  className="h-9 w-9 rounded-lg bg-black/40 flex items-center justify-center"
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                </button>
              </div>

              <p className="text-[11px] mt-2 opacity-90">
                Share this code to invite new members under your network.
              </p>
            </div>

            {/* Continue + extra actions */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <button
                onClick={onContinue}
                className="w-full rounded-xl py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-500 text-white flex items-center justify-center gap-2 hover:brightness-110 transition"
              >
                Go to Dashboard
                <FiArrowRight />
              </button>

              {(onViewWelcomeLetter || onCreateIdCard) && (
                <div className="grid sm:grid-cols-2 gap-2 mt-3">
                  {onViewWelcomeLetter && (
                    <button
                      onClick={onViewWelcomeLetter}
                      className="w-full rounded-xl py-2 text-xs font-medium bg-slate-950 border border-slate-800 text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-900 transition"
                    >
                      <FiFileText />
                      Welcome Letter
                    </button>
                  )}

                  {onCreateIdCard && (
                    <button
                      onClick={onCreateIdCard}
                      className="w-full rounded-xl py-2 text-xs font-medium bg-slate-950 border border-slate-800 text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-900 transition"
                    >
                      <FiCreditCard />
                      Create ID Card
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
