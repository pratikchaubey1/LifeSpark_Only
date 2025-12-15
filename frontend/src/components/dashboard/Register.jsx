import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const API_BASE = "http://localhost:5000";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCheckCircle,
  FiPhone,
  FiUser,
  FiMapPin,
  FiCreditCard,
} from "react-icons/fi";

export default function OfficialRegisterPage({ onSubmit, onGoToLogin, onGoHome }) {
  const [sponsorId, setSponsorId] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [sponsorError, setSponsorError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = sponsorId.trim();

    // reset while typing
    setSponsorError("");
    if (!code) {
      setSponsorName("");
      setSponsorLoading(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setSponsorLoading(true);
        const res = await fetch(`${API_BASE}/api/auth/sponsor/${encodeURIComponent(code)}`);
        const data = await res.json();
        if (!res.ok) {
          setSponsorName("");
          setSponsorError(data.message || "Invalid invite code");
          return;
        }
        setSponsorName(data?.sponsor?.name || "");
      } catch {
        setSponsorName("");
        setSponsorError("Failed to verify invite code");
      } finally {
        setSponsorLoading(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [sponsorId]);

  function validate() {
    const e = {};

    if (!sponsorId.trim()) e.sponsorId = "Invite code is required.";
    else if (!sponsorName.trim()) e.sponsorId = sponsorError || "Invalid invite code";

    if (!name.trim()) e.name = "Name is required.";

    if (!phone.trim()) e.phone = "Phone number is required.";
    else if (!/^[0-9]{10}$/.test(phone.trim()))
      e.phone = "Enter a valid 10-digit phone number.";

    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email.";

    if (!address.trim()) e.address = "Address is required.";

    if (!password) e.password = "Password is required.";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        sponsorId, // used as invite code, required by backend
        sponsorName,
        name,
        phone,
        email,
        address,
        password,
      };

      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // mock API call
        await new Promise((r) => setTimeout(r, 900));
        alert("Registered successfully (mock).");
      }
    } catch (err) {
      setErrors({ form: err.message || "Registration failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Glowing blobs background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-violet-500/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e293b_0,_#020617_55%)]" />
      </div>

      {/* Subtle grid overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative max-w-5xl w-full rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-[0_18px_60px_rgba(15,23,42,0.85)] backdrop-blur-2xl overflow-hidden grid md:grid-cols-[1.1fr,1fr]"
      >
        {/* Left: form section */}
        <div className="px-7 py-7 md:px-10 md:py-10 flex flex-col gap-6">
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="self-start mb-2 text-xs text-slate-400 hover:text-slate-200 hover:underline"
            >
              ← Back to Home
            </button>
          )}
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 flex items-center justify-center text-[11px] font-semibold tracking-tight shadow-lg shadow-indigo-500/40">
              Life
              <br />
              Spark
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Create your Life Spark ID 
              </h1>
              <p className="text-sm md:text-[13px] text-slate-400 mt-1">
                Set up your account to unlock{" "}
                <span className="text-indigo-300">network & income tools</span>{" "}
                in minutes.
              </p>
            </div>
          </div>

          {/* Tagline chips */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 flex items-center gap-1.5">
              <FiCheckCircle className="text-emerald-400" />
              Verified sponsorship
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 flex items-center gap-1.5">
              <FiCheckCircle className="text-indigo-400" />
              Team tracking
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 flex items-center gap-1.5">
              <FiCheckCircle className="text-violet-400" />
              Instant access
            </span>
          </div>

          {/* Form */}
          <div className="mt-2">
            <form onSubmit={handleSubmit} noValidate className="grid gap-3.5">
              {errors.form && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                  {errors.form}
                </div>
              )}

              {/* Invite Code from Sponsor */}
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium tracking-wide text-slate-200">
                    Invite Code
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Enter your sponsor's invite code
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={sponsorId}
                    onChange={(e) => {
                      setSponsorId(e.target.value);
                      // clear old sponsor name until verified
                      setSponsorName("");
                    }}
                    className={`w-full rounded-xl border bg-slate-900/60 px-3.5 py-2.5 pr-10 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition ${
                      errors.sponsorId
                        ? "border-red-400/70"
                        : "border-slate-700"
                    }`}
                    placeholder="e.g. LS443938"
                  />
                  <FiCreditCard className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
                </div>
                {errors.sponsorId && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {errors.sponsorId}
                  </p>
                )}
              </label>

              {/* Sponsor Name (auto) */}
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium tracking-wide text-slate-200">
                    Sponsor name
                  </span>
                  {sponsorLoading ? (
                    <span className="text-[10px] text-slate-500">verifying...</span>
                  ) : null}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={sponsorName}
                    readOnly
                    className={`w-full rounded-xl border bg-slate-900/60 px-3.5 py-2.5 pr-10 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition ${
                      errors.sponsorId
                        ? "border-red-400/70"
                        : "border-slate-700"
                    }`}
                    placeholder="Auto from invite code"
                  />
                  <FiUser className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
                </div>
                {sponsorError && (
                  <p className="text-[11px] text-red-400 mt-1">{sponsorError}</p>
                )}
              </label>

              {/* Your Name */}
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium tracking-wide text-slate-200">
                    Your name
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-xl border bg-slate-900/60 px-3.5 py-2.5 pr-10 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition ${
                      errors.name ? "border-red-400/70" : "border-slate-700"
                    }`}
                    placeholder="Your full name"
                  />
                  <FiUser className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {errors.name}
                  </p>
                )}
              </label>

              {/* Phone */}
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium tracking-wide text-slate-200">
                    Phone number
                  </span>
                  <span className="text-[10px] text-slate-500">
                    WhatsApp enabled
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full rounded-xl border bg-slate-900/60 px-3.5 py-2.5 pr-10 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition ${
                      errors.phone ? "border-red-400/70" : "border-slate-700"
                    }`}
                    placeholder="10-digit mobile number"
                  />
                  <FiPhone className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {errors.phone}
                  </p>
                )}
              </label>

              {/* Email */}
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium tracking-wide text-slate-200">
                    Email address
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-xl border bg-slate-900/60 px-3.5 py-2.5 pr-10 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition ${
                      errors.email ? "border-red-400/70" : "border-slate-700"
                    }`}
                    placeholder="you@example.com"
                  />
                  <FiMail className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {errors.email}
                  </p>
                )}
              </label>

              {/* Address */}
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium tracking-wide text-slate-200">
                    Address
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full rounded-xl border bg-slate-900/60 px-3.5 py-2.5 pr-10 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition min-h-[80px] ${
                      errors.address ? "border-red-400/70" : "border-slate-700"
                    }`}
                    placeholder="House no, street, city, state, pincode"
                  />
                  <FiMapPin className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
                </div>
                {errors.address && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {errors.address}
                  </p>
                )}
              </label>

              {/* Password */}
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium tracking-wide text-slate-200">
                    Create password
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Min 6 characters
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-xl border bg-slate-900/60 px-3.5 py-2.5 pr-10 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition ${
                      errors.password
                        ? "border-red-400/70"
                        : "border-slate-700"
                    }`}
                    placeholder="Create a strong password"
                  />
                  <FiLock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-2.5 p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4 text-slate-400" />
                    ) : (
                      <FiEye className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {errors.password}
                  </p>
                )}
              </label>

              {/* Register button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full rounded-xl py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 text-white shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    Create account
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-4">
              <span className="h-px flex-1 bg-slate-700" />
              <span>Already on Life Spark?</span>
              <span className="h-px flex-1 bg-slate-700" />
            </div>

            {/* Login link */}
            <p className="text-[12px] text-slate-400 text-center mt-1.5">
              Already have an account?{" "}
              <button
                type="button"
                className="text-indigo-300 hover:text-indigo-200 hover:underline font-medium"
                onClick={
                  onGoToLogin ||
                  (() => {
                    console.log("Go to login clicked");
                  })
                }
              >
                Sign in instead
              </button>
            </p>
          </div>
        </div>

        {/* Right: showcase / background block */}
        <div className="hidden md:flex flex-col justify-between relative bg-gradient-to-br from-indigo-500/80 via-sky-500/80 to-violet-600/80 p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2)_0,_transparent_55%)] opacity-60" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-25 mix-blend-soft-light" />

          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-indigo-100/80 bg-white/10 px-3 py-1 rounded-full border border-white/20 w-max">
              Onboard in minutes
            </p>
            <h2 className="text-2xl font-semibold leading-snug text-slate-50 drop-shadow-md">
              Build your{" "}
              <span className="underline decoration-emerald-300/80 decoration-2 underline-offset-4">
                network
              </span>{" "}
              from Day 1.
            </h2>
            <p className="text-sm text-indigo-50/90">
              Link your sponsor, set up your profile, and start tracking your
              team&apos;s progress with real-time insights.
            </p>

            {/* Stats cards */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-white/10 border border-white/20 p-3 shadow-sm shadow-slate-900/40">
                <p className="text-[11px] text-indigo-50/80">
                  New members today
                </p>
                <p className="text-lg font-semibold text-white mt-1">+48</p>
                <p className="text-[11px] text-emerald-200 mt-1">
                  Growing faster than 92%
                </p>
              </div>
              <div className="rounded-xl bg-slate-950/15 border border-white/25 p-3 shadow-sm shadow-slate-900/40">
                <p className="text-[11px] text-indigo-50/80">
                  Total team volume
                </p>
                <p className="text-lg font-semibold text-white mt-1">₹3.2L</p>
                <p className="text-[11px] text-amber-100 mt-1">
                  Weekly insights unlocked
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-6 text-[11px] text-indigo-50/90 flex items-center justify-between gap-2">
            <span>
              100% responsive, secure & designed for{" "}
              <span className="font-semibold">scaling teams</span>.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
