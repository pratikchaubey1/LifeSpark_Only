import React, { useEffect, useState } from "react";
import config from "../../config/config";

const API_BASE = config.apiUrl;

export default function EditBankDetail({ onMenuOpen }) {
  const [form, setForm] = useState({
    accountHolder: "",
    bankName: "",
    accountNo: "",
    ifsc: "",
    branchName: "",
  });

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login first.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          setMsg(data.message || "Failed to load profile");
          setLoading(false);
          return;
        }

        const b = data.user?.bankDetails || {};
        setForm({
          accountHolder: b.accountHolder || "",
          bankName: b.bankName || "",
          accountNo: b.accountNo || "",
          ifsc: b.ifsc || "",
          branchName: b.branchName || "",
        });
      } catch (e) {
        setMsg("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "ifsc" ? value.toUpperCase() : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.accountHolder.trim()) newErrors.accountHolder = "Account holder name is required.";

    if (!form.bankName.trim()) newErrors.bankName = "Bank name is required.";

    if (!form.accountNo.trim()) {
      newErrors.accountNo = "Account number is required.";
    } else if (!/^\d{8,18}$/.test(form.accountNo.trim())) {
      newErrors.accountNo = "Enter a valid account number (8–18 digits).";
    }

    if (!form.ifsc.trim()) {
      newErrors.ifsc = "IFSC code is required.";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim())) {
      newErrors.ifsc = "Enter valid IFSC (eg: SBIN0123456).";
    }

    if (!form.branchName.trim()) newErrors.branchName = "Branch name is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setMsg("");
    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) return setMsg("Please login again.");

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bankDetails: form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Failed to update bank details");
        return;
      }

      setMsg("Bank details updated successfully.");
    } catch (e) {
      setMsg("Failed to update bank details");
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    "w-full p-3 mt-1 rounded-xl border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none";

  const labelBase = "text-sm font-medium text-slate-700";

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-slate-600">
        Loading bank details...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex justify-center p-4">

      <div className="w-full max-w-3xl bg-white border shadow-xl rounded-2xl p-6 sm:p-8 space-y-10">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          {/* MENU BUTTON */}
          <button
            onClick={() => onMenuOpen?.()}
            className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-slate-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Edit Bank Details
          </h1>
        </div>

        {msg && (
          <div className="p-3 rounded-xl border bg-slate-50 text-slate-700 text-sm">
            {msg}
          </div>
        )}

        {/* FORM */}
        <div className="space-y-6">

          <div>
            <label className={labelBase}>Account Holder</label>
            <input
              name="accountHolder"
              className={inputBase}
              placeholder="Enter account holder name"
              value={form.accountHolder}
              onChange={handleChange}
            />
            {errors.accountHolder && <p className="text-xs mt-1 text-red-500">{errors.accountHolder}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelBase}>Bank Name</label>
              <input
                name="bankName"
                className={inputBase}
                placeholder="Enter bank name"
                value={form.bankName}
                onChange={handleChange}
              />
              {errors.bankName && <p className="text-xs mt-1 text-red-500">{errors.bankName}</p>}
            </div>

            <div>
              <label className={labelBase}>Branch Name</label>
              <input
                name="branchName"
                className={inputBase}
                placeholder="Enter branch name"
                value={form.branchName}
                onChange={handleChange}
              />
              {errors.branchName && <p className="text-xs mt-1 text-red-500">{errors.branchName}</p>}
            </div>
          </div>

          <div>
            <label className={labelBase}>Account Number</label>
            <input
              name="accountNo"
              className={inputBase}
              placeholder="Enter account number"
              value={form.accountNo}
              onChange={handleChange}
            />
            {errors.accountNo && <p className="text-xs mt-1 text-red-500">{errors.accountNo}</p>}
          </div>

          <div>
            <label className={labelBase}>IFSC Code</label>
            <input
              name="ifsc"
              className={inputBase + " uppercase tracking-wide"}
              placeholder="e.g. SBIN0123456"
              value={form.ifsc}
              onChange={handleChange}
            />
            {errors.ifsc && <p className="text-xs mt-1 text-red-500">{errors.ifsc}</p>}
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Details"}
          </button>

          <button
            onClick={() => setMsg("")}
            className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl hover:bg-slate-300 active:scale-95 transition"
          >
            Cancel
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Withdrawals are sent only to this bank account.
        </p>
      </div>
    </div>
  );
}
