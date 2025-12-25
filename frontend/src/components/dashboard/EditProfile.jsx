import React, { useEffect, useState } from "react";
import config from "../../config/config";

import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiHome,
  FiClock,
  FiHash,
} from "react-icons/fi";

const API_BASE = config.apiUrl;

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  gender: "",
  city: "",
  state: "",
  pinCode: "",
  age: "",
};

export default function EditProfile({ onMenuOpen }) {
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
        const res = await fetch(`${API_BASE}/profile`, {
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
        });
      } catch (e) {
        setMsg("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setMsg("");
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login again.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/profile`, {
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
      <div className="w-full min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600 animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 flex justify-center">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl border border-slate-200 p-6 space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onMenuOpen?.()}
              className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="text-xl font-bold text-slate-800">Edit Profile</h1>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update"}
          </button>
        </div>

        {msg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {msg}
          </div>
        )}

        {/* Form */}
        <div className="space-y-10">
          <Section title="Personal Information">
            <Grid>
              <IconField label="Name" icon={<FiUser />} value={form.name} onChange={onChange("name")} />

              <IconField label="Mobile No" icon={<FiPhone />} value={form.phone} onChange={onChange("phone")} />

              <SelectField label="Gender" value={form.gender} onChange={onChange("gender")} options={["Male", "Female", "Other"]} />

              <IconField label="Age" icon={<FiClock />} value={form.age} onChange={onChange("age")} />

              <FullIconField label="Address" icon={<FiHome />} value={form.address} onChange={onChange("address")} />

              <IconField label="City" icon={<FiMapPin />} value={form.city} onChange={onChange("city")} />

              <IconField label="State" icon={<FiMapPin />} value={form.state} onChange={onChange("state")} />

              <IconField label="Pin Code" icon={<FiHash />} value={form.pinCode} onChange={onChange("pinCode")} />
            </Grid>
          </Section>
        </div>

      </div>
    </div>
  );
}

/* -------- REUSABLE COMPONENTS -------- */

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>;
}

function IconField({ label, value, onChange, icon }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1 flex items-center gap-2 bg-slate-200 p-3 rounded-xl border border-slate-300">
        <span className="text-slate-600">{icon}</span>
        <input
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent outline-none text-sm text-slate-800"
        />
      </div>
    </div>
  );
}

function FullIconField({ label, value, onChange, icon }) {
  return (
    <div className="md:col-span-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1 flex items-center gap-2 bg-slate-200 p-3 rounded-xl border border-slate-300">
        <span className="text-slate-600">{icon}</span>
        <input
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent outline-none text-sm text-slate-800"
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="mt-1 w-full p-3 rounded-xl bg-slate-200 border border-slate-300 text-sm text-slate-800 outline-none"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
