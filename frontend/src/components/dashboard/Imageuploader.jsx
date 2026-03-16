import React, { useState, useEffect } from "react";
import config from "../../config/config";

const API_BASE = config.apiUrl;

const compressImage = (file, maxWidth = 1000, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob failed"));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function KycTextForm({ onMenuOpen }) {
  const [panNo, setPanNo] = useState("");
  const [aadhaarNo, setAadhaarNo] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");

  const [aadhaarImg, setAadhaarImg] = useState(null);
  const [panImg, setPanImg] = useState(null);
  const [selfieImg, setSelfieImg] = useState(null);

  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);

  const [errors, setErrors] = useState({});
  const [dupErrors, setDupErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [existingKyc, setExistingKyc] = useState(null);

  useEffect(() => { fetchExistingKyc(); }, []);

  const fetchExistingKyc = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoadingKyc(false); return; }
    try {
      const res = await fetch(`${API_BASE}/kyc`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.kyc) setExistingKyc(data.kyc);
    } catch (err) {
      console.error("Error fetching KYC", err);
    } finally {
      setLoadingKyc(false);
    }
  };

  const validate = (field, value) => {
    let error = "";
    if (field === "panNo") {
      const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
      if (!value) error = "PAN is required";
      else if (value.length !== 10) error = "PAN must be 10 characters";
      else if (!panRegex.test(value)) error = "Invalid PAN format (e.g. ABCDE1234F)";
    } else if (field === "aadhaarNo") {
      if (!value) error = "Aadhaar is required";
      else if (value.length !== 12) error = "Aadhaar must be 12 digits";
      else if (!/^\d+$/.test(value)) error = "Aadhaar must contain only digits";
    } else if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = "Email is required";
      else if (!emailRegex.test(value)) error = "Invalid email format";
    } else if (field === "phone") {
      if (!value) error = "Phone is required";
      else if (value.length !== 10) error = "Phone must be 10 digits";
      else if (!/^[6-9]\d{9}$/.test(value)) error = "Invalid phone (must start with 6-9 and be 10 digits)";
    } else if (field === "state") {
      if (!value) error = "State is required";
    } else if (field === "address") {
      if (!value) error = "Address is required";
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const checkDuplicate = async (field, value) => {
    if (!validate(field, value)) return;

    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/kyc/check-duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ field, value: value.trim() }),
      });
      const data = await res.json();
      setDupErrors(prev => {
        const n = { ...prev };
        if (data.duplicate) n[field] = `This ${field === 'panNo' ? 'PAN' : field === 'aadhaarNo' ? 'Aadhaar' : field} is already registered`;
        else delete n[field];
        return n;
      });
    } catch (err) { console.error("Dup check error", err); }
  };

  const handleFileChange = (setter, previewSetter) => async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setMsg("Compressing image...");
        const compressedFile = await compressImage(file);
        setter(compressedFile);
        previewSetter(URL.createObjectURL(compressedFile));
        setMsg("");
      } catch (err) {
        console.error("Compression error", err);
        setMsg("Failed to process image. Please try another.");
      }
    }
  };

  const handleSubmit = async () => {
    setMsg("");
    const isPanValid = validate("panNo", panNo);
    const isAadhaarValid = validate("aadhaarNo", aadhaarNo);
    const isEmailValid = validate("email", email);
    const isPhoneValid = validate("phone", phone);
    const isAddressValid = validate("address", address);
    const isStateValid = validate("state", state);

    if (!isPanValid || !isAadhaarValid || !isEmailValid || !isPhoneValid || !isAddressValid || !isStateValid) {
      return setMsg("Please fix validation errors.");
    }

    if (Object.keys(dupErrors).length > 0) return setMsg("Please fix the duplicate errors before submitting.");

    const isResubmit = existingKyc && existingKyc.status === 'rejected';
    if (!isResubmit && (!aadhaarImg || !panImg || !selfieImg)) return setMsg("Please upload all 3 images (Aadhaar, PAN, Selfie).");

    const token = localStorage.getItem("token");
    if (!token) return setMsg("Please login again.");

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("panNo", panNo);
      formData.append("aadhaarNo", aadhaarNo);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("state", state);
      if (aadhaarImg) formData.append("aadhaar", aadhaarImg);
      if (panImg) formData.append("pan", panImg);
      if (selfieImg) formData.append("selfie", selfieImg);

      const res = await fetch(`${API_BASE}/kyc`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) return setMsg(data.message || "KYC submission failed");
      setMsg("KYC Submitted Successfully!");
      if (data.kyc) setExistingKyc(data.kyc);
    } catch (err) {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = "w-full p-3 mt-1 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  if (loadingKyc) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex justify-center items-center">
        <div className="p-8 bg-white rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600 font-medium">Checking KYC status...</div>
        </div>
      </div>
    );
  }

  const isSubmitted = existingKyc && existingKyc.panNo;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white shadow-xl border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <button onClick={() => onMenuOpen?.()} className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">KYC Verification</h1>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl border text-sm ${msg.includes("Successfully") ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            {msg}
          </div>
        )}

        {isSubmitted && existingKyc.status !== 'rejected' ? (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl flex items-center gap-3 ${existingKyc.status === 'approved' ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${existingKyc.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {existingKyc.status === 'approved' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>
              <div className="flex-1">
                <div className={`font-bold ${existingKyc.status === 'approved' ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {existingKyc.status === 'approved' ? 'KYC Approved' : 'KYC Under Review'}
                </div>
                <div className={`text-xs uppercase tracking-wider font-semibold ${existingKyc.status === 'approved' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  Status: {existingKyc.status}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="PAN Number" value={existingKyc.panNo} />
              <DetailItem label="Aadhaar Number" value={existingKyc.aadhaarNo} />
              <DetailItem label="Email" value={existingKyc.email} />
              <DetailItem label="Phone" value={existingKyc.phone} />
              <DetailItem label="State" value={existingKyc.state} />
              <div className="md:col-span-2">
                <DetailItem label="Address" value={existingKyc.address} />
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Uploaded Documents</div>
              <div className="grid grid-cols-3 gap-4">
                {existingKyc.documents?.aadhaar && (
                  <DocThumb label="Aadhaar" src={existingKyc.documents.aadhaar.startsWith('http') ? existingKyc.documents.aadhaar : `${API_BASE}${existingKyc.documents.aadhaar}`} />
                )}
                {existingKyc.documents?.pan && (
                  <DocThumb label="PAN" src={existingKyc.documents.pan.startsWith('http') ? existingKyc.documents.pan : `${API_BASE}${existingKyc.documents.pan}`} />
                )}
                {existingKyc.documents?.selfie && (
                  <DocThumb label="Selfie" src={existingKyc.documents.selfie.startsWith('http') ? existingKyc.documents.selfie : `${API_BASE}${existingKyc.documents.selfie}`} />
                )}
              </div>
            </div>

            {existingKyc.remarks && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-xs font-bold text-amber-800 uppercase mb-1">Admin Remarks</div>
                <div className="text-sm text-amber-700">{existingKyc.remarks}</div>
              </div>
            )}
          </div>
        ) : (
          <>
            {existingKyc?.status === 'rejected' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="font-bold text-red-800 text-sm">Your KYC was rejected</div>
                {existingKyc.remarks && <div className="text-sm text-red-700 mt-1">{existingKyc.remarks}</div>}
                <div className="text-xs text-red-600 mt-2">Please correct the details and re-submit.</div>
              </div>
            )}

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* PAN */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">PAN Number <span className="text-red-500">*</span></label>
                  <input
                    className={`${inputBase} ${errors.panNo || dupErrors.panNo ? 'border-red-400 ring-1 ring-red-100' : ''}`}
                    value={panNo}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      setPanNo(val);
                      if (errors.panNo) validate('panNo', val);
                    }}
                    onBlur={() => checkDuplicate('panNo', panNo)}
                    placeholder="ABCDE1234F"
                  />
                  {(errors.panNo || dupErrors.panNo) && <div className="text-xs text-red-600 mt-1 font-medium">{errors.panNo || dupErrors.panNo}</div>}
                </div>

                {/* Aadhaar */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">Aadhaar Number <span className="text-red-500">*</span></label>
                  <input
                    className={`${inputBase} ${errors.aadhaarNo || dupErrors.aadhaarNo ? 'border-red-400 ring-1 ring-red-100' : ''}`}
                    value={aadhaarNo}
                    maxLength={12}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setAadhaarNo(val);
                      if (errors.aadhaarNo) validate('aadhaarNo', val);
                    }}
                    onBlur={() => checkDuplicate('aadhaarNo', aadhaarNo)}
                    placeholder="0000 0000 0000"
                  />
                  {(errors.aadhaarNo || dupErrors.aadhaarNo) && <div className="text-xs text-red-600 mt-1 font-medium">{errors.aadhaarNo || dupErrors.aadhaarNo}</div>}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></label>
                  <input
                    className={`${inputBase} ${errors.email || dupErrors.email ? 'border-red-400 ring-1 ring-red-100' : ''}`}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) validate('email', e.target.value);
                    }}
                    onBlur={() => checkDuplicate('email', email)}
                    placeholder="your@email.com"
                  />
                  {(errors.email || dupErrors.email) && <div className="text-xs text-red-600 mt-1 font-medium">{errors.email || dupErrors.email}</div>}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    className={`${inputBase} ${errors.phone || dupErrors.phone ? 'border-red-400 ring-1 ring-red-100' : ''}`}
                    value={phone}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                      if (errors.phone) validate('phone', val);
                    }}
                    onBlur={() => checkDuplicate('phone', phone)}
                    placeholder="9876543210"
                  />
                  {(errors.phone || dupErrors.phone) && <div className="text-xs text-red-600 mt-1 font-medium">{errors.phone || dupErrors.phone}</div>}
                </div>
              </div>

              {/* State */}
              <div>
                <label className="text-sm font-semibold text-slate-700">Aadhaar State <span className="text-red-500">*</span></label>
                <input
                  className={`${inputBase} ${errors.state ? 'border-red-400' : ''}`}
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    if (errors.state) validate('state', e.target.value);
                  }}
                  placeholder="e.g. Maharashtra"
                />
                {errors.state && <div className="text-xs text-red-600 mt-1 font-medium">{errors.state}</div>}
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-semibold text-slate-700">Address <span className="text-red-500">*</span></label>
                <textarea
                  className={`${inputBase} ${errors.address ? 'border-red-400' : ''}`}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) validate('address', e.target.value);
                  }}
                  placeholder="Enter your full address"
                  rows={3}
                ></textarea>
                {errors.address && <div className="text-xs text-red-600 mt-1 font-medium">{errors.address}</div>}
              </div>

              <div className="pt-2">
                <div className="text-sm font-bold text-slate-700 mb-4">Upload Documents <span className="text-red-500">*</span></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <ImageUploadSlot label="Aadhaar Photo" preview={aadhaarPreview} onChange={handleFileChange(setAadhaarImg, setAadhaarPreview)} />
                  <ImageUploadSlot label="PAN Card Photo" preview={panPreview} onChange={handleFileChange(setPanImg, setPanPreview)} />
                  <ImageUploadSlot label="Selfie Photo" preview={selfiePreview} onChange={handleFileChange(setSelfieImg, setSelfiePreview)} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.values(errors).some(e => !!e) || Object.values(dupErrors).some(e => !!e)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 shadow-lg shadow-indigo-200"
              >
                {submitting ? "Submitting..." : "Submit KYC"}
              </button>
              <button onClick={() => onMenuOpen?.()} className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 active:scale-95 transition font-semibold">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-slate-800 font-semibold">{value || 'N/A'}</div>
    </div>
  );
}

function DocThumb({ label, src }) {
  return (
    <div className="text-center">
      <a href={src} target="_blank" rel="noreferrer" className="block border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        <img src={src} alt={label} className="w-full h-28 object-cover" />
      </a>
      <div className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-wider">{label}</div>
    </div>
  );
}

function ImageUploadSlot({ label, preview, onChange }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{label}</label>
      <label className="block cursor-pointer border-2 border-dashed border-slate-300 rounded-xl overflow-hidden hover:border-indigo-400 transition-colors bg-slate-50">
        {preview ? (
          <img src={preview} alt={label} className="w-full h-32 object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-medium">Tap to upload</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={onChange} className="hidden" />
      </label>
    </div>
  );
}
