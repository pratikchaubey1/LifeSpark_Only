import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  gender: "",
  city: "",
  state: "",
  pinCode: "",
  age: "",
  panNo: "",
  aadhaarNo: "",
  nomineeName: "",
  nomineeRelation: "",
  upiNo: "",
  upiId: "",
};

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setMsg("Please login first.");
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
        setUser(data.user);
        setForm({
          ...emptyForm,
          name: data.user?.name || "",
          phone: data.user?.phone || "",
          address: data.user?.address || "",
          gender: data.user?.gender || "",
          city: data.user?.city || "",
          state: data.user?.state || "",
          pinCode: data.user?.pinCode || "",
          age: data.user?.age || "",
          panNo: data.user?.panNo || "",
          aadhaarNo: data.user?.aadhaarNo || "",
          nomineeName: data.user?.nomineeName || "",
          nomineeRelation: data.user?.nomineeRelation || "",
          upiNo: data.user?.upiNo || "",
          upiId: data.user?.upiId || "",
        });
      } catch (e) {
        setMsg("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const inputBase =
    "w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";
  const labelBase = "text-xs sm:text-sm font-medium text-slate-600";

  const onChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setMsg("");
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
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "Failed to update profile");
        return;
      }
      setUser(data.user);
      setMsg("Profile updated successfully.");
    } catch (e) {
      setMsg("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 flex items-start sm:items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Edit Profile</h2>
            <div className="text-xs text-slate-500 mt-1">
              ID: <span className="font-mono">{user?.id || "-"}</span> • Email: <span className="font-mono">{user?.email || "-"}</span> • Role: <span className="font-mono">{user?.role || "member"}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Status: {user?.isActivated ? "Active" : "Inactive"}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Update Profile"}
          </button>
        </div>

        {msg && (
          <div className="mb-5 rounded-lg border bg-white px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        <div className="space-y-8">
          <section>
            <div className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800">Personal Information</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Basic account details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={labelBase}>Name</label>
                <input value={form.name} onChange={onChange("name")} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Mobile No</label>
                <input value={form.phone} onChange={onChange("phone")} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Gender</label>
                <select value={form.gender} onChange={onChange("gender")} className={inputBase}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelBase}>Age</label>
                <input value={form.age} onChange={onChange("age")} className={inputBase} />
              </div>
              <div className="md:col-span-2">
                <label className={labelBase}>Address</label>
                <input value={form.address} onChange={onChange("address")} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>City</label>
                <input value={form.city} onChange={onChange("city")} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>State</label>
                <input value={form.state} onChange={onChange("state")} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Pin Code</label>
                <input value={form.pinCode} onChange={onChange("pinCode")} className={inputBase} />
              </div>
            </div>
          </section>

          <section>
            <div className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800">KYC Details (Unique)</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">PAN / Aadhaar must be unique across users.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={labelBase}>PAN No</label>
                <input value={form.panNo} onChange={onChange("panNo")} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Aadhaar No</label>
                <input value={form.aadhaarNo} onChange={onChange("aadhaarNo")} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Nominee Name</label>
                <input value={form.nomineeName} onChange={onChange("nomineeName")} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Nominee Relation</label>
                <input value={form.nomineeRelation} onChange={onChange("nomineeRelation")} className={inputBase} />
              </div>
            </div>
          </section>

          <section>
            <div className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800">UPI Details (Unique)</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">UPI ID must be unique across users.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={labelBase}>UPI No</label>
                <input value={form.upiNo} onChange={onChange("upiNo")} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>UPI ID</label>
                <input value={form.upiId} onChange={onChange("upiId")} className={inputBase} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
