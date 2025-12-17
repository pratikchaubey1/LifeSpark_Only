import React, { useEffect, useState } from "react";

import config from "../../config/config";

const API_BASE = config.apiUrl;

const ImageUpload = () => {
  const [profile, setProfile] = useState(null);
  const [pan, setPan] = useState(null);
  const [aadhaar, setAadhaar] = useState(null);
  const [bank, setBank] = useState(null);

  const [existingKyc, setExistingKyc] = useState(null);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/kyc`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) return;
        const data = await res.json();
        if (res.ok) setExistingKyc(data.kyc);
      } catch (e) {
        // non-blocking
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setMsg("");
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login again.");
      return;
    }

    if (!profile && !pan && !aadhaar && !bank) {
      setMsg("Please choose at least one file to upload.");
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      if (profile) fd.append("profile", profile);
      if (pan) fd.append("pan", pan);
      if (aadhaar) fd.append("aadhaar", aadhaar);
      if (bank) fd.append("bank", bank);

      const res = await fetch(`${API_BASE}/kyc`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "KYC upload failed");
        return;
      }

      setExistingKyc(data.kyc);
      setMsg("KYC uploaded successfully.");
      // keep previews, but clear file inputs so user can re-upload if needed
      setProfile(null);
      setPan(null);
      setAadhaar(null);
      setBank(null);
    } catch (e) {
      setMsg("KYC upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const baseBoxClasses =
    "mt-3 h-40 w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-gray-400 text-sm transition hover:border-indigo-400 hover:bg-indigo-50/60";

  const sectionLabelClasses = "font-medium text-gray-800 text-sm";

  const helperText = "JPG, PNG, max 5MB";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex justify-center items-center px-3 py-8">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              KYC Document Upload
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Upload your profile and document images. Make sure they are clear and readable.
            </p>
          </div>
         
        </div>

        {msg && (
          <div className="mb-4 rounded-lg border bg-white px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        {existingKyc?.documents && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="font-semibold text-slate-800 mb-1">Existing KYC</div>
            <div className="text-slate-600">Last updated: {existingKyc.updatedAt ? existingKyc.updatedAt.slice(0, 19).replace("T", " ") : "-"}</div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(existingKyc.documents)
                .filter(([, v]) => v && v.filePath)
                .map(([k, v]) => (
                  <a
                    key={k}
                    href={`${API_BASE}${v.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-indigo-700"
                  >
                    {k} (view)
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Image */}
          <div className="flex flex-col">
            <label className={sectionLabelClasses}>Profile Image</label>
            <span className="text-[11px] text-gray-400 mt-1">
              This will be shown on your profile.
            </span>

            <div className={baseBoxClasses}>
              {profile ? (
                <img
                  src={URL.createObjectURL(profile)}
                  className="h-full w-full object-cover rounded-xl"
                  alt="Profile Preview"
                />
              ) : (
                <>
                  <span className="text-xs font-medium text-gray-500 mb-1">
                    Drop file here or click to upload
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {helperText}
                  </span>
                </>
              )}
            </div>

            <label className="mt-3 inline-flex w-full justify-center sm:w-auto cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition">
              Choose File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setProfile(e.target.files[0]);
                }}
              />
            </label>
          </div>

          {/* PAN Image */}
          <div className="flex flex-col">
            <label className={sectionLabelClasses}>PAN Image</label>
            <span className="text-[11px] text-gray-400 mt-1">
              Upload a clear photo or scan of your PAN.
            </span>

            <div className={baseBoxClasses}>
              {pan ? (
                <img
                  src={URL.createObjectURL(pan)}
                  className="h-full w-full object-cover rounded-xl"
                  alt="PAN Preview"
                />
              ) : (
                <>
                  <span className="text-xs font-medium text-gray-500 mb-1">
                    Drop file here or click to upload
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {helperText}
                  </span>
                </>
              )}
            </div>

            <label className="mt-3 inline-flex w-full justify-center sm:w-auto cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition">
              Choose File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setPan(e.target.files[0]);
                }}
              />
            </label>
          </div>

          {/* Aadhaar Image */}
          <div className="flex flex-col">
            <label className={sectionLabelClasses}>Aadhaar Image</label>
            <span className="text-[11px] text-gray-400 mt-1">
              Front side or combined PDF/image.
            </span>

            <div className={baseBoxClasses}>
              {aadhaar ? (
                <img
                  src={URL.createObjectURL(aadhaar)}
                  className="h-full w-full object-cover rounded-xl"
                  alt="Aadhaar Preview"
                />
              ) : (
                <>
                  <span className="text-xs font-medium text-gray-500 mb-1">
                    Drop file here or click to upload
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {helperText}
                  </span>
                </>
              )}
            </div>

            <label className="mt-3 inline-flex w-full justify-center sm:w-auto cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition">
              Choose File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setAadhaar(e.target.files[0]);
                }}
              />
            </label>
          </div>
        </div>

        {/* BANK IMAGE - Responsive */}
        <div className="mt-8 w-full md:w-1/2">
          <label className={sectionLabelClasses}>Bank Passbook / Cheque</label>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Make sure account number & IFSC are clearly visible.
          </span>

          <div className={baseBoxClasses + " mt-3"}>
            {bank ? (
              <img
                src={URL.createObjectURL(bank)}
                className="h-full w-full object-cover rounded-xl"
                alt="Bank Preview"
              />
            ) : (
              <>
                <span className="text-xs font-medium text-gray-500 mb-1">
                  Drop file here or click to upload
                </span>
                <span className="text-[11px] text-gray-400">
                  {helperText}
                </span>
              </>
            )}
          </div>

          <label className="mt-3 inline-flex w-full justify-center sm:w-auto cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition">
            Choose File
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setBank(e.target.files[0]);
              }}
            />
          </label>
        </div>

        {/* BUTTONS */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] shadow-sm"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>

          <button className="w-full sm:w-auto px-8 py-3 bg-red-500/90 text-white text-sm font-medium rounded-xl hover:bg-red-600 active:scale-[0.98]">
            Cancel
          </button>

          <p className="text-[11px] text-gray-400 sm:ml-2">
            By continuing, you confirm that the documents are valid and belong to you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
