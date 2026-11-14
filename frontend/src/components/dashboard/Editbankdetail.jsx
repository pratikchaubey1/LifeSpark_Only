import React, { useEffect, useState } from "react";
import {
  FiShield,
  FiLock,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiSend,
  FiX,
  FiRefreshCw
} from "react-icons/fi";
import config from "../../config/config";

const API_BASE = config.apiUrl;

export default function EditBankDetail({ onMenuOpen }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    bankName: "",
    accountNo: "",
    ifsc: "",
    branchName: ""
  });
  const [pendingRequest, setPendingRequest] = useState(null);

  // Request Update Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    accountHolder: "",
    bankName: "",
    accountNo: "",
    confirmAccountNo: "",
    ifsc: "",
    branchName: "",
    reason: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [msg, setMsg] = useState("");
  const [modalMsg, setModalMsg] = useState("");

  const loadData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch profile
      const resProfile = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataProfile = await resProfile.json();

      if (resProfile.ok && dataProfile.user) {
        setUser(dataProfile.user);
        const b = dataProfile.user.bankDetails || {};
        setBankDetails({
          accountHolder: b.accountHolder || "",
          bankName: b.bankName || "",
          accountNo: b.accountNo || "",
          ifsc: b.ifsc || "",
          branchName: b.branchName || ""
        });
      }

      // Fetch pending bank update request if any
      const resReq = await fetch(`${API_BASE}/profile/bank-update-request`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resReq.ok) {
        const dataReq = await resReq.json();
        setPendingRequest(dataReq.request || null);
      }
    } catch {
      setMsg("Failed to load bank details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    setFormErrors({});
    setModalMsg("");
    setRequestForm({
      accountHolder: bankDetails.accountHolder || "",
      bankName: bankDetails.bankName || "",
      accountNo: "",
      confirmAccountNo: "",
      ifsc: bankDetails.ifsc || "",
      branchName: bankDetails.branchName || "",
      reason: ""
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMsg("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const formatted = name === "ifsc" ? value.toUpperCase() : value;
    setRequestForm((prev) => ({ ...prev, [name]: formatted }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateRequest = () => {
    const errors = {};
    if (!requestForm.accountHolder.trim()) {
      errors.accountHolder = "Account Holder name is required.";
    }
    if (!requestForm.bankName.trim()) {
      errors.bankName = "Bank Name is required.";
    }
    if (!requestForm.branchName.trim()) {
      errors.branchName = "Branch Name is required.";
    }
    if (!requestForm.accountNo.trim()) {
      errors.accountNo = "Account Number is required.";
    } else if (!/^\d{8,18}$/.test(requestForm.accountNo.trim())) {
      errors.accountNo = "Enter a valid account number (8–18 digits).";
    }
    if (requestForm.accountNo.trim() !== requestForm.confirmAccountNo.trim()) {
      errors.confirmAccountNo = "Account numbers do not match.";
    }
    if (!requestForm.ifsc.trim()) {
      errors.ifsc = "IFSC code is required.";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(requestForm.ifsc.trim())) {
      errors.ifsc = "Enter valid IFSC (e.g. SBIN0123456).";
    }
    if (!requestForm.reason.trim()) {
      errors.reason = "Please enter reason for update.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!validateRequest()) return;

    const token = localStorage.getItem("token");
    if (!token) return setModalMsg("Please login again.");

    try {
      setSubmittingRequest(true);
      setModalMsg("");

      const res = await fetch(`${API_BASE}/profile/bank-update-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          requestedBankDetails: {
            accountHolder: requestForm.accountHolder.trim(),
            bankName: requestForm.bankName.trim(),
            accountNo: requestForm.accountNo.trim(),
            ifsc: requestForm.ifsc.trim().toUpperCase(),
            branchName: requestForm.branchName.trim()
          },
          reason: requestForm.reason.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setModalMsg(data.message || "Failed to submit bank update request.");
        return;
      }

      setMsg("Bank update request submitted successfully. Admin will review and update your details.");
      setIsModalOpen(false);
      loadData();
    } catch {
      setModalMsg("Something went wrong while submitting request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const hasBankDetails = Boolean(bankDetails.accountNo && bankDetails.accountNo.trim());

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        <FiRefreshCw className="animate-spin text-indigo-600 mr-2" size={20} />
        Loading bank details...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 flex justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onMenuOpen?.()}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 transition text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                Bank Details
              </h1>
              <p className="text-xs text-slate-500">
                Official payout bank account details
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            className="p-2 text-slate-400 hover:text-indigo-600 transition"
            title="Refresh"
          >
            <FiRefreshCw size={18} />
          </button>
        </div>

        {/* NOTIFICATION MSG */}
        {msg && (
          <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2">
            <FiCheckCircle size={16} className="shrink-0 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {/* PENDING UPDATE REQUEST BANNER */}
        {pendingRequest && pendingRequest.status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <FiClock className="text-amber-600" size={18} />
                Bank Details Update Request Pending
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-800">
                UNDER ADMIN REVIEW
              </span>
            </div>

            <p className="text-xs text-amber-800">
              You submitted a request to update your bank details on{" "}
              <span className="font-semibold">
                {new Date(pendingRequest.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </span>. The admin will review and approve your changes shortly.
            </p>

            <div className="bg-white/80 rounded-xl p-3 border border-amber-200 text-xs text-slate-700 space-y-1">
              <div>
                <span className="font-semibold text-slate-500">Requested Account:</span>{" "}
                <span className="font-mono font-bold">{pendingRequest.requestedBankDetails?.accountNo}</span> (
                {pendingRequest.requestedBankDetails?.bankName} - {pendingRequest.requestedBankDetails?.ifsc})
              </div>
              <div>
                <span className="font-semibold text-slate-500">Holder:</span>{" "}
                <span>{pendingRequest.requestedBankDetails?.accountHolder}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Reason:</span>{" "}
                <span className="italic">{pendingRequest.reason}</span>
              </div>
            </div>
          </div>
        )}

        {/* LATEST REJECTED BANNER */}
        {pendingRequest && pendingRequest.status === "rejected" && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm text-xs text-rose-800 flex items-start gap-2.5">
            <FiAlertCircle className="shrink-0 mt-0.5 text-rose-600" size={16} />
            <div>
              <p className="font-bold">Previous Bank Update Request Rejected</p>
              <p className="mt-0.5">
                Admin remark: {pendingRequest.adminRemark || "Request could not be approved."}
              </p>
            </div>
          </div>
        )}

        {/* READ-ONLY BANK DETAILS CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FiShield className="text-indigo-600" size={20} />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Registered Bank Account
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Withdrawals and payouts are credited only to this bank account.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
              <FiLock size={12} className="text-slate-500" />
              LOCKED & VERIFIED
            </div>
          </div>

          {/* Details Grid (Read-Only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Account Holder Name
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {bankDetails.accountHolder || "Not Provided"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Bank Name
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {bankDetails.bankName || "Not Provided"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Account Number
              </p>
              <p className="text-base font-mono font-bold text-indigo-700 mt-1">
                {bankDetails.accountNo || "Not Provided"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                IFSC Code
              </p>
              <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                {bankDetails.ifsc || "Not Provided"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Branch Name
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {bankDetails.branchName || "Not Provided"}
              </p>
            </div>
          </div>

          {/* Policy Note & Request Update Button */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              🔒 Bank details cannot be changed directly by user. Click below to submit an update request to Admin.
            </p>

            <button
              type="button"
              onClick={handleOpenModal}
              disabled={pendingRequest?.status === "pending"}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
            >
              <FiSend size={14} />
              Request Update Details
            </button>
          </div>
        </div>

      </div>

      {/* REQUEST UPDATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FiSend className="text-indigo-600" size={18} />
                <h3 className="text-base font-bold text-slate-900">
                  Request Bank Details Update
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Submit your new bank details along with a reason. Your request will be reviewed and updated by Admin.
            </p>

            {modalMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {modalMsg}
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountHolder"
                  value={requestForm.accountHolder}
                  onChange={handleInputChange}
                  placeholder="Enter full name as on bank account"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.accountHolder && (
                  <p className="text-rose-500 mt-0.5">{formErrors.accountHolder}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={requestForm.bankName}
                    onChange={handleInputChange}
                    placeholder="e.g. State Bank of India"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formErrors.bankName && (
                    <p className="text-rose-500 mt-0.5">{formErrors.bankName}</p>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={requestForm.branchName}
                    onChange={handleInputChange}
                    placeholder="e.g. Main Branch"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formErrors.branchName && (
                    <p className="text-rose-500 mt-0.5">{formErrors.branchName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  New Account Number
                </label>
                <input
                  type="text"
                  name="accountNo"
                  value={requestForm.accountNo}
                  onChange={handleInputChange}
                  placeholder="Enter new bank account number"
                  className="w-full p-2.5 font-mono rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.accountNo && (
                  <p className="text-rose-500 mt-0.5">{formErrors.accountNo}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Confirm New Account Number
                </label>
                <input
                  type="text"
                  name="confirmAccountNo"
                  value={requestForm.confirmAccountNo}
                  onChange={handleInputChange}
                  placeholder="Re-enter bank account number"
                  className="w-full p-2.5 font-mono rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.confirmAccountNo && (
                  <p className="text-rose-500 mt-0.5">{formErrors.confirmAccountNo}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifsc"
                  value={requestForm.ifsc}
                  onChange={handleInputChange}
                  placeholder="e.g. SBIN0123456"
                  className="w-full p-2.5 font-mono uppercase rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.ifsc && (
                  <p className="text-rose-500 mt-0.5">{formErrors.ifsc}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Reason for Update
                </label>
                <textarea
                  rows={2}
                  name="reason"
                  value={requestForm.reason}
                  onChange={handleInputChange}
                  placeholder="e.g. Previous account closed / typo in account number"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.reason && (
                  <p className="text-rose-500 mt-0.5">{formErrors.reason}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {submittingRequest ? "Submitting..." : "Send to Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
