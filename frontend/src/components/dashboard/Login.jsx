import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";

export default function OfficialLoginPage({ onSubmit, onGoToRegister, onGoHome }) {
  const [email, setEmail] = useState("");      // 🔹 missing state add kiya
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email.";

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
      if (onSubmit) await onSubmit({ email, password, remember });
      else await new Promise((r) => setTimeout(r, 900)); // mock delay
      alert("Signed in successfully (mock).");
    } catch (err) {
      setErrors({ form: err.message || "Sign-in failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8 relative overflow-hidden">
      {/* subtle gradient + glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-16 h-52 w-52 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0f172a_0,_#020617_55%)]" />
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full bg-slate-900/80 text-slate-50 shadow-2xl shadow-slate-950/70 rounded-2xl border border-slate-800/80 backdrop-blur-2xl overflow-hidden"
      >
        <div className="px-7 py-6">
          {/* back to home */}
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="mb-3 text-xs text-slate-400 hover:text-slate-200 hover:underline"
            >
              ← Back to Home
            </button>
          )}
          {/* header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 flex items-center justify-center text-center text-white font-semibold text-[11px] shadow-lg shadow-indigo-500/40">
              Life
              <br />
              Spark
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back 👋
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Sign in to continue to your{" "}
                <span className="text-indigo-300">member dashboard</span>.
              </p>
            </div>
          </div>

          {/* Google button */}
          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={() => alert("OAuth mock: Google sign-in")}
              className="flex items-center justify-center gap-3 rounded-lg px-4 py-2.5 border border-slate-700 bg-slate-900/70 hover:bg-slate-800/80 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M21.35 11.1h-9.2v2.8h5.26c-.23 1.23-.93 2.27-1.98 2.96v2.46h3.2c1.88-1.73 2.97-4.28 2.97-7.22 0-.44-.04-.86-.05-1.3z"
                  fill="#4285F4"
                />
                <path
                  d="M12.15 21c2.7 0 4.97-.9 6.63-2.44l-3.2-2.46c-.92.62-2.08.98-3.43.98-2.63 0-4.86-1.77-5.66-4.16H3.15v2.6C4.78 18.86 8.17 21 12.15 21z"
                  fill="#34A853"
                />
                <path
                  d="M6.49 12.87A5.82 5.82 0 016.49 7.1V4.5H3.15A9.99 9.99 0 002.15 12c0 1.6.36 3.12 1 4.5l2.34-3.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.15 4.5c1.47 0 2.8.5 3.84 1.48l2.88-2.88C16.98 1.58 14.7.72 12.15.72 8.17.72 4.78 2.86 3.15 5.5l2.34 2.6c.8-2.39 3.03-4.16 5.66-4.16z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="h-px flex-1 bg-slate-700" />
              <span>Or sign in with email</span>
              <span className="h-px flex-1 bg-slate-700" />
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} noValidate className="grid gap-3">
              {errors.form && (
                <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                  {errors.form}
                </div>
              )}

              {/* email */}
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-200">
                    Email
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Use registered email
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-lg border bg-slate-900/70 px-3.5 py-2.5 pr-10 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400 transition ${
                      errors.email ? "border-red-400/70" : "border-slate-700"
                    }`}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  <FiMail className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-[11px] text-red-400 mt-1"
                  >
                    {errors.email}
                  </p>
                )}
              </label>

              {/* password */}
              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-200">
                    Password
                  </span>
                  <button
                    type="button"
                    className="text-[11px] text-indigo-300 hover:text-indigo-200 hover:underline"
                    onClick={() => alert("Forgot password (mock)")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-lg border bg-slate-900/70 px-3.5 py-2.5 pr-10 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400 transition ${
                      errors.password
                        ? "border-red-400/70"
                        : "border-slate-700"
                    }`}
                    placeholder="Enter your password"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
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
                  <p
                    id="password-error"
                    className="text-[11px] text-red-400 mt-1"
                  >
                    {errors.password}
                  </p>
                )}
              </label>

              {/* remember + help */}
              <div className="flex items-center justify-between text-[11px] mt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-500 bg-slate-900 text-indigo-500 focus:ring-0"
                  />
                  <span className="text-slate-300">Remember this device</span>
                </label>
                <button
                  type="button"
                  className="text-indigo-300 hover:text-indigo-200 hover:underline"
                  onClick={() => alert("Need help (mock)")}
                >
                  Need help?
                </button>
              </div>

              {/* submit button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full rounded-lg py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 text-white shadow-md shadow-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/50 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing you in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* bottom text */}
            <p className="text-[11px] text-slate-500 text-center mt-3">
              Don’t have an account?{" "}
              <button
                type="button"
                className="text-indigo-300 hover:text-indigo-200 hover:underline font-medium"
                onClick={
                  onGoToRegister ||
                  (() => {
                    console.log("Go to Register clicked");
                  })
                }
              >
                Create an account
              </button>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border-t border-slate-800 px-7 py-3 text-[10px] text-slate-500 flex items-center justify-between">
          <span>
            By signing in you agree to our{" "}
            <button className="underline underline-offset-2 hover:text-slate-300">
              Terms
            </button>{" "}
            &{" "}
            <button className="underline underline-offset-2 hover:text-slate-300">
              Privacy Policy
            </button>
            .
          </span>
          <span className="hidden sm:inline text-slate-600">
            Secured by Life Spark
          </span>
        </div>
      </motion.div>
    </div>
  );
}
