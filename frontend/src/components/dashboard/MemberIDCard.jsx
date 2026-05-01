import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiMenu, FiDownload, FiMail, FiPhone, FiMapPin, FiAward } from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import config from "../../config/config";
import toast from "react-hot-toast";

const API_BASE = config.apiUrl;

export default function MemberIDCard({ onMenuOpen }) {
  const [profile, setProfile] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        const [profileRes, kycRes] = await Promise.all([
          fetch(`${API_BASE}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/kyc`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileRes.json();
        const kycData = await kycRes.json();

        if (profileRes.ok) setProfile(profileData.user);
        if (kycRes.ok) setKyc(kycData.kyc);
      } catch (err) {
        console.error("Failed to load ID card data", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      toast.loading("Downloading ID Card...", { id: "pdf-gen" });

      // Use a more robust capture method
      const canvas = await html2canvas(cardRef.current, {
        scale: 4, // Very high quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ensure the cloned element is visible and has proper dimensions
          const el = clonedDoc.getElementById("printable-card");
          if (el) {
            el.style.boxShadow = "none";
            el.style.border = "none";
            el.style.transform = "none";
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Calculate dimensions in mm (standard for PDF)
      // 360px at 96dpi is ~95.25mm
      // 580px at 96dpi is ~153.46mm
      const imgWidth = 95; 
      const imgHeight = 153; 

      const pdf = new jsPDF('p', 'mm', [imgWidth + 10, imgHeight + 10]); // Add tiny margin to page size
      pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
      pdf.save(`ID_Card_${profile?.inviteCode || "Member"}.pdf`);
      
      toast.success("ID Card Downloaded!", { id: "pdf-gen" });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to download PDF", { id: "pdf-gen" });
    } finally {
      setDownloading(false);
    }
  };

  const selfieUrl = kyc?.documents?.selfie 
    ? (kyc.documents.selfie.startsWith('http') ? kyc.documents.selfie : `${API_BASE}/uploads/${kyc.documents.selfie}`)
    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onMenuOpen?.()}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition active:scale-95"
          >
            <FiMenu className="text-slate-600 text-xl" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-none">Member ID Card</h2>
            <div className="text-xs text-slate-500 mt-1">Digital identity card</div>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          {downloading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiDownload />
          )}
          <span className="hidden sm:inline">{downloading ? "Downloading..." : "Download PDF"}</span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* ID CARD CONTAINER */}
        <div id="printable-card" ref={cardRef} className="relative w-[360px] h-[580px] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
          {/* Top Design Element */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-blue-600 to-indigo-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
          </div>

          <div className="relative pt-8 px-6 text-center h-full flex flex-col">
            {/* Logo Area */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center p-1.5">
                <img src="/logo192.png" alt="LS" className="w-full h-full object-contain" onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/3256/3256121.png"} />
              </div>
              <div className="text-left">
                <div className="text-white font-black text-sm leading-tight tracking-tight uppercase">Life Spark</div>
                <div className="text-blue-100 text-[8px] font-bold tracking-[0.2em] uppercase opacity-80">Associates</div>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="relative mx-auto w-32 h-32 mb-6 shrink-0">
              <div className="absolute inset-0 bg-blue-600/20 rounded-[2rem] blur-lg"></div>
              <div className="relative w-full h-full rounded-[2.2rem] border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                <img 
                  src={selfieUrl} 
                  alt="Member" 
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center border-2 border-white">
                <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <FiAward className="text-white text-xs" />
                </div>
              </div>
            </div>

            {/* Name & ID */}
            <div className="mb-8 shrink-0">
              <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{profile?.name}</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                Member ID: {profile?.inviteCode}
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-6 text-left flex-1">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <FiPhone size={14} />
                </div>
                <div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Phone Number</div>
                  <div className="text-xs font-bold text-slate-700">{profile?.phone || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <FiMail size={14} />
                </div>
                <div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Email Address</div>
                  <div className="text-xs font-bold text-slate-700 break-all pr-2">{profile?.email || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <FiMapPin size={14} />
                </div>
                <div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Office Address</div>
                  <div className="text-xs font-bold text-slate-700 break-words pr-2">{profile?.address || 'India'}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 pb-6 border-t border-slate-100 flex items-center justify-between">
              <div className="text-left">
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Referral No.</div>
                <div className="text-[11px] font-black text-slate-900">{profile?.sponsorId || 'Direct'}</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Joining Date</div>
                <div className="text-[11px] font-black text-slate-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : '--/--/----'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DOWNLOAD INSTRUCTIONS */}
        <div className="max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-sm no-print">
          <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
            <FiDownload className="text-blue-600" /> ID Card Instructions
          </h4>
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
            <li>Your ID Card is generated in high resolution for clear printing.</li>
            <li>Use any standard PDF viewer to open and print the file.</li>
            <li>Laminate the card after printing for a professional finish.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
