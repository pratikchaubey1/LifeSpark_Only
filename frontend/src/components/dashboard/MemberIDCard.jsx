import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiDownload,
  FiPrinter,
  FiMail,
  FiPhone,
  FiMapPin,
  FiAward,
  FiCheckCircle,
  FiShield,
  FiCalendar,
  FiUser,
  FiShare2,
  FiImage
} from "react-icons/fi";
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
  const [activeSide, setActiveSide] = useState("front"); // "front" | "back" | "both"
  const [imageError, setImageError] = useState(false);

  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

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

  const inviteCode = profile?.inviteCode || "LS000000";
  const memberName = profile?.name || "Member Name";
  const memberPhone = profile?.phone || "N/A";
  const memberEmail = profile?.email || "N/A";
  const sponsorCode = profile?.sponsorId || "DIRECT";
  const memberCity = profile?.city || profile?.state || "India";
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Lifetime";

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/register/${inviteCode}`
    : `https://lifespark.org/register/${inviteCode}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    inviteLink
  )}&margin=4`;

  const selfieUrl =
    kyc?.documents?.selfie && !imageError
      ? kyc.documents.selfie.startsWith("http")
        ? kyc.documents.selfie
        : `${API_BASE}/uploads/${kyc.documents.selfie}`
      : null;

  // Capture helper using html2canvas
  const captureCardCanvas = async (element) => {
    if (!element) return null;
    return await html2canvas(element, {
      scale: 3, // Crisp 300 DPI equivalent
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 10000,
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById(element.id);
        if (el) {
          el.style.transform = "none";
          el.style.boxShadow = "none";
        }
      },
    });
  };

  // Download PDF (Includes Front & Back sides)
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      toast.loading("Rendering high-res ID Card PDF...", { id: "pdf-gen" });

      const frontCanvas = await captureCardCanvas(frontCardRef.current);
      const backCanvas = await captureCardCanvas(backCardRef.current);

      if (!frontCanvas) {
        throw new Error("Unable to capture card elements");
      }

      // Standard badge dimensions in mm: 85mm x 135mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [85, 135],
      });

      // Page 1: Front Card
      const frontImg = frontCanvas.toDataURL("image/png", 1.0);
      pdf.addImage(frontImg, "PNG", 5, 5, 75, 125);

      // Page 2: Back Card (if available)
      if (backCanvas) {
        pdf.addPage([85, 135], "portrait");
        const backImg = backCanvas.toDataURL("image/png", 1.0);
        pdf.addImage(backImg, "PNG", 5, 5, 75, 125);
      }

      pdf.save(`LifeSpark_ID_Card_${inviteCode}.pdf`);
      toast.success("ID Card PDF Downloaded successfully!", { id: "pdf-gen" });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF. Try downloading as image.", { id: "pdf-gen" });
    } finally {
      setDownloading(false);
    }
  };

  // Download PNG Image of active side
  const handleDownloadPNG = async () => {
    try {
      setDownloading(true);
      toast.loading("Generating PNG image...", { id: "img-gen" });

      const targetRef = activeSide === "back" ? backCardRef.current : frontCardRef.current;
      const canvas = await captureCardCanvas(targetRef);

      if (!canvas) throw new Error("Could not capture image");

      const imgData = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `LifeSpark_ID_${inviteCode}_${activeSide}.png`;
      link.click();

      toast.success("ID Card Image Saved!", { id: "img-gen" });
    } catch (err) {
      console.error("Image generation error:", err);
      toast.error("Failed to save image.", { id: "img-gen" });
    } finally {
      setDownloading(false);
    }
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Loading ID Card...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      {/* ACTION BAR */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 no-print">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => onMenuOpen?.()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition active:scale-95"
            title="Toggle Menu"
          >
            <FiMenu className="text-slate-700 text-xl" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight flex items-center gap-2">
              <FiShield className="text-blue-600" /> Member Identity Card
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified LifeSpark Associate ID • Print &amp; PDF Ready
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Card Side Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setActiveSide("front")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSide === "front"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Front Card
            </button>
            <button
              onClick={() => setActiveSide("back")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSide === "back"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Back Card
            </button>
            <button
              onClick={() => setActiveSide("both")}
              className={`px-3 py-1.5 rounded-lg transition-all hidden md:block ${
                activeSide === "both"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Both Sides
            </button>
          </div>

          {/* Download PNG */}
          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm active:scale-95 transition disabled:opacity-50"
            title="Save high-res PNG image"
          >
            <FiImage className="text-indigo-600 text-sm" />
            <span className="hidden sm:inline">Save Image</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm active:scale-95 transition"
            title="Print ID card"
          >
            <FiPrinter className="text-slate-600 text-sm" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 active:scale-95 transition disabled:opacity-50"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiDownload size={14} />
            )}
            <span>{downloading ? "Generating..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* ID CARDS DISPLAY CONTAINER */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-5xl mb-8">

        {/* ============================================================== */}
        {/* FRONT SIDE CARD */}
        {/* ============================================================== */}
        {(activeSide === "front" || activeSide === "both") && (
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 no-print flex items-center gap-1">
              <FiCheckCircle className="text-blue-600" /> Front Badge
            </span>

            <div
              id="front-id-card"
              ref={frontCardRef}
              style={{
                width: "360px",
                height: "580px",
                boxSizing: "border-box",
                backgroundColor: "#ffffff",
              }}
              className="relative rounded-[28px] overflow-hidden border border-slate-300 shadow-2xl shadow-slate-300/60 flex flex-col justify-between select-none"
            >
              {/* Lanyard punch slot simulation */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-2.5 rounded-full bg-slate-200/80 border border-slate-300/80 z-20 shadow-inner"></div>

              {/* HEADER SECTION (Deep Royal Navy + Gold Accent) */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0a192f 0%, #112240 50%, #1d3557 100%)",
                }}
                className="relative pt-6 pb-4 px-5 text-white overflow-hidden shrink-0"
              >
                {/* Decorative background geometry */}
                <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border border-white/10 opacity-30 pointer-events-none"></div>
                <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full border border-white/10 opacity-20 pointer-events-none"></div>

                <div className="flex items-center justify-between relative z-10">
                  {/* Company Logo & Brand */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-amber-300/50">
                      <img
                        src="/one.png"
                        alt="LifeSpark Logo"
                        crossOrigin="anonymous"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://cdn-icons-png.flaticon.com/512/3256/3256121.png";
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-white font-black text-sm tracking-wide uppercase leading-tight font-sans">
                        LifeSpark
                      </div>
                      <div className="text-amber-400 text-[8.5px] font-bold tracking-[0.22em] uppercase">
                        Global Associates
                      </div>
                    </div>
                  </div>

                  {/* Golden Smart Chip Graphic */}
                  <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 border border-amber-500/60 shadow-sm flex flex-col justify-between p-1 shrink-0">
                    <div className="h-[2px] w-full bg-amber-600/40 rounded-full"></div>
                    <div className="flex justify-between items-center px-0.5">
                      <div className="w-1.5 h-1.5 rounded-full border border-amber-700/50"></div>
                      <div className="w-2 h-[1px] bg-amber-700/50"></div>
                      <div className="w-1.5 h-1.5 rounded-full border border-amber-700/50"></div>
                    </div>
                    <div className="h-[2px] w-full bg-amber-600/40 rounded-full"></div>
                  </div>
                </div>

                {/* Sub-header Bar */}
                <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between text-[9px] font-bold tracking-wider uppercase text-blue-100">
                  <span>Authorized Identity Card</span>
                  <span className="text-amber-400 font-mono tracking-normal">ISO 9001:2015</span>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="px-5 pt-3 pb-3 flex-1 flex flex-col justify-between bg-white text-slate-800">
                {/* PHOTO & NAME BLOCK */}
                <div className="flex flex-col items-center text-center">
                  {/* Photo Frame */}
                  <div className="relative mb-2.5">
                    <div className="w-24 h-24 rounded-2xl p-[3px] bg-gradient-to-br from-amber-400 via-blue-600 to-indigo-700 shadow-md">
                      <div className="w-full h-full rounded-[13px] overflow-hidden bg-slate-100 flex items-center justify-center">
                        {selfieUrl ? (
                          <img
                            src={selfieUrl}
                            alt={memberName}
                            crossOrigin="anonymous"
                            onError={() => setImageError(true)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 text-blue-700">
                            <FiUser size={34} />
                            <span className="text-[8px] font-bold mt-1 uppercase tracking-wider text-slate-500">
                              Associate
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hologram / Verified Badge */}
                    <div
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow border-2 border-white"
                      title="Verified Associate"
                    >
                      <FiCheckCircle size={14} />
                    </div>
                  </div>

                  {/* Member Name */}
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase font-sans line-clamp-1">
                    {memberName}
                  </h3>

                  {/* Designation */}
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 mt-0.5">
                    Independent Business Associate
                  </div>

                  {/* Member ID Pill */}
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono font-bold">
                    <span className="text-[9px] text-blue-500 font-sans uppercase tracking-wider">
                      ID:
                    </span>
                    <span>{inviteCode}</span>
                  </div>
                </div>

                {/* DETAILS GRID */}
                <div className="my-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  {/* Phone */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase text-[9px] flex items-center gap-1.5">
                      <FiPhone size={11} className="text-blue-600 shrink-0" /> Mobile
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {memberPhone}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase text-[9px] flex items-center gap-1.5">
                      <FiMail size={11} className="text-blue-600 shrink-0" /> Email
                    </span>
                    <span className="font-semibold text-slate-700 truncate max-w-[170px]" title={memberEmail}>
                      {memberEmail}
                    </span>
                  </div>

                  {/* Sponsor */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase text-[9px] flex items-center gap-1.5">
                      <FiUser size={11} className="text-blue-600 shrink-0" /> Sponsor
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {sponsorCode}
                    </span>
                  </div>

                  {/* Joining Date */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase text-[9px] flex items-center gap-1.5">
                      <FiCalendar size={11} className="text-blue-600 shrink-0" /> Issue Date
                    </span>
                    <span className="font-semibold text-slate-700">
                      {joinDate}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase text-[9px] flex items-center gap-1.5">
                      <FiMapPin size={11} className="text-blue-600 shrink-0" /> Region
                    </span>
                    <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                      {memberCity}
                    </span>
                  </div>
                </div>

                {/* BOTTOM AUTHENTICATION SECTION */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  {/* QR Code */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 p-0.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                      <img
                        src={qrUrl}
                        alt="QR Verification"
                        crossOrigin="anonymous"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                        Scan to Verify
                      </div>
                      <div className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Status
                      </div>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="text-right">
                    <div className="font-serif italic text-blue-900 text-xs font-bold leading-none pr-1">
                      LifeSpark
                    </div>
                    <div className="w-20 border-b border-slate-300 my-0.5 ml-auto"></div>
                    <div className="text-[7.5px] font-extrabold uppercase tracking-wider text-slate-400">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER BAR */}
              <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-center text-[8px] font-mono tracking-widest uppercase shrink-0 border-t border-slate-800">
                LIFESPARK GLOBAL ASSOCIATES • OFFICIAL MEMBER CARD
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BACK SIDE CARD */}
        {/* ============================================================== */}
        {(activeSide === "back" || activeSide === "both") && (
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 no-print flex items-center gap-1">
              <FiShield className="text-indigo-600" /> Back Badge
            </span>

            <div
              id="back-id-card"
              ref={backCardRef}
              style={{
                width: "360px",
                height: "580px",
                boxSizing: "border-box",
                backgroundColor: "#ffffff",
              }}
              className="relative rounded-[28px] overflow-hidden border border-slate-300 shadow-2xl shadow-slate-300/60 flex flex-col justify-between select-none"
            >
              {/* Lanyard punch slot simulation */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-2.5 rounded-full bg-slate-200/80 border border-slate-300/80 z-20 shadow-inner"></div>

              {/* Top Magnetic Stripe Simulation */}
              <div className="pt-7 bg-slate-100">
                <div
                  style={{
                    background: "linear-gradient(90deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                  }}
                  className="h-10 w-full flex items-center justify-between px-6"
                >
                  <div className="text-[8px] font-mono text-slate-400 tracking-widest">
                    MAGNETIC ENCODED SECURITY STRIP
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400/80"></div>
                </div>
              </div>

              {/* BACK CONTENT */}
              <div className="p-5 flex-1 flex flex-col justify-between text-slate-700 bg-white">
                {/* Header / Brand */}
                <div className="text-center pb-2 border-b border-slate-200">
                  <div className="text-sm font-black text-slate-900 tracking-wider uppercase font-sans">
                    Terms &amp; Instructions
                  </div>
                  <div className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">
                    Official LifeSpark Associates Network
                  </div>
                </div>

                {/* Terms List */}
                <div className="space-y-2 text-[10px] text-slate-600 leading-relaxed my-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 mt-0.5">•</span>
                    <span>This identity card certifies the holder as an authorized Independent Business Associate of LifeSpark.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 mt-0.5">•</span>
                    <span>This card is non-transferable and must be presented on demand at all official seminars, meetings, and centers.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 mt-0.5">•</span>
                    <span>Cardholder agrees to abide strictly by the LifeSpark Code of Ethics and Business Conduct Guidelines.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 mt-0.5">•</span>
                    <span>If lost, stolen, or misplaced, report immediately to the LifeSpark administrative helpdesk.</span>
                  </div>
                </div>

                {/* Contact & Return Block */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-center">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    If found, please return to:
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">
                    LifeSpark Corporate Care Centre
                  </div>
                  <div className="text-[9.5px] text-slate-500 font-mono">
                    Helpline: support@lifespark.org • www.lifespark.org
                  </div>
                </div>

                {/* Simulated Barcode & Serial */}
                <div className="pt-2 text-center flex flex-col items-center">
                  {/* Barcode lines */}
                  <div className="w-56 h-8 flex items-center justify-between px-2 bg-white">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3].map(
                      (w, i) => (
                        <div
                          key={i}
                          style={{ width: `${w}px` }}
                          className="h-full bg-slate-900 rounded-none shrink-0"
                        ></div>
                      )
                    )}
                  </div>
                  <div className="text-[9px] font-mono font-bold tracking-widest text-slate-500 mt-1">
                    * {inviteCode} *
                  </div>
                </div>
              </div>

              {/* FOOTER BAR */}
              <div className="bg-slate-900 text-slate-400 py-2 px-4 text-center text-[7.5px] font-mono tracking-widest uppercase shrink-0 border-t border-slate-800">
                VALID LIFETIME • AUTHORIZED REPRODUCTION PROHIBITED
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRINT & DOWNLOAD GUIDE CARD */}
      <div className="w-full max-w-3xl bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2 text-sm">
          <FiAward className="text-blue-600" /> Professional Printing Tips
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Standard Badge Size</span>
            Standard CR-80 card format (85mm × 135mm portrait lanyard proportions).
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">High-Resolution PDF</span>
            Vector-rendered at 300 DPI for crisp typography on paper or PVC card printing.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Lamination Ready</span>
            Designed with slot punch and border bleed margins for clear gloss laminates.
          </div>
        </div>
      </div>
    </div>
  );
}
