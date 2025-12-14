import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

export default function EditBankDetail() {
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
        const res = await fetch(`${API_BASE}/api/profile`, {
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

    if (!form.accountHolder.trim()) {
      newErrors.accountHolder = "Account holder name is required.";
    }
    if (!form.bankName.trim()) {
      newErrors.bankName = "Bank name is required.";
    }
    if (!form.accountNo.trim()) {
      newErrors.accountNo = "Account number is required.";
    } else if (!/^\d{8,18}$/.test(form.accountNo.trim())) {
      newErrors.accountNo = "Enter a valid account number (8–18 digits).";
    }
    if (!form.ifsc.trim()) {
      newErrors.ifsc = "IFSC code is required.";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim())) {
      newErrors.ifsc = "Enter a valid IFSC code (e.g. SBIN0123456).";
    }
    if (!form.branchName.trim()) {
      newErrors.branchName = "Branch name is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setMsg("");
    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login again.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/api/profile`, {
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
      const b = data.user?.bankDetails || {};
      setForm({
        accountHolder: b.accountHolder || "",
        bankName: b.bankName || "",
        accountNo: b.accountNo || "",
        ifsc: b.ifsc || "",
        branchName: b.branchName || "",
      });
    } catch (e) {
      setMsg("Failed to update bank details");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    setMsg("");
  };

  const inputBase =
    "w-full mt-1.5 p-2.5 rounded-xl border text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";
  const labelBase = "text-gray-700 font-medium text-xs sm:text-sm";

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-slate-600">Loading bank details...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 flex items-start sm:items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-6">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-lg sm:text-2xl font-semibold text-slate-900">Edit Bank Details</h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Bank account number must be unique across users.</p>
        </div>

        {msg && (
          <div className="mb-4 rounded-lg border bg-white px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={labelBase}>Account Holder</label>
            <input
              type="text"
              name="accountHolder"
              value={form.accountHolder}
              onChange={handleChange}
              placeholder="Enter account holder name"
              className={`${inputBase} ${errors.accountHolder ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.accountHolder && <p className="mt-1 text-[11px] text-red-500">{errors.accountHolder}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelBase}>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                placeholder="Enter bank name"
                className={`${inputBase} ${errors.bankName ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.bankName && <p className="mt-1 text-[11px] text-red-500">{errors.bankName}</p>}
            </div>

            <div>
              <label className={labelBase}>Branch Name</label>
              <input
                type="text"
                name="branchName"
                value={form.branchName}
                onChange={handleChange}
                placeholder="Enter branch name"
                className={`${inputBase} ${errors.branchName ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.branchName && <p className="mt-1 text-[11px] text-red-500">{errors.branchName}</p>}
            </div>
          </div>

          <div>
            <label className={labelBase}>Account Number</label>
            <input
              type="text"
              inputMode="numeric"
              name="accountNo"
              value={form.accountNo}
              onChange={handleChange}
              placeholder="Enter account number"
              className={`${inputBase} ${errors.accountNo ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.accountNo && <p className="mt-1 text-[11px] text-red-500">{errors.accountNo}</p>}
          </div>

          <div>
            <label className={labelBase}>IFSC Code</label>
            <input
              type="text"
              name="ifsc"
              value={form.ifsc}
              onChange={handleChange}
              placeholder="e.g. SBIN0123456"
              className={`${inputBase} uppercase tracking-wide ${errors.ifsc ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.ifsc && <p className="mt-1 text-[11px] text-red-500">{errors.ifsc}</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            className="w-full sm:flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Details"}
          </button>

          <button
            className="w-full sm:flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 active:scale-[0.98] transition border border-slate-200"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>

        <p className="mt-3 text-[10px] sm:text-[11px] text-slate-400">Note: Withdrawals are processed to this bank account only.</p>
      </div>
    </div>
  );
}
