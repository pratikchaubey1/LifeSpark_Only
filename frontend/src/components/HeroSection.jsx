// src/components/HeroSection.jsx
import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeUp } from "../config/motionConfig";

const HeroSection = ({ scrollToId }) => {
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 400], [0, -40]);

  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-slate-200 bg-white"
    >
      <motion.div
        style={{ y: heroParallax }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_60%),_radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_55%)]"
      />
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-2 gap-10 relative z-10">
        {/* LEFT: Hero text card */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          custom={0}
          className="relative space-y-6 p-6 md:p-7 rounded-3xl bg-white/90 border border-slate-100 shadow-[0_18px_45px_rgba(148,163,184,0.45)] backdrop-blur"
        >
          <p className="hero-sub text-xs uppercase tracking-[0.25em] text-emerald-600">
            सपनों की दुनिया को हकीकत में बदलें
          </p>
          <h1 className="hero-heading text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-slate-900">
            LIFE SPARK ASSOCIATES
            <span className="block mt-2 text-base md:text-lg text-emerald-700 font-normal">
              छोटे फैसले, बड़ा बदलाव — हर भारतीय परिवार तक अवसर पहुँचाना।
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-700 max-w-lg">
            एक ऐसा प्लेटफ़ॉर्म जहाँ ई-कॉमर्स, डायरेक्ट सेलिंग और डिजिटल शिक्षा
            साथ मिलकर आपको और आपके नेटवर्क को सशक्त बनाते हैं।
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-2.5 rounded-full bg-emerald-400 text-slate-950 text-sm font-semibold hover:bg-emerald-300 transition shadow-lg shadow-emerald-200/60">
              Apply Now
            </button>
            <button className="px-5 py-2.5 rounded-full border border-slate-300 text-sm text-slate-700 hover:border-emerald-400 hover:text-emerald-700 transition bg-white">
              Read More
            </button>
            <button
              onClick={() => scrollToId("product")}
              className="px-5 py-2.5 rounded-full border border-transparent bg-slate-100 text-sm text-slate-800 hover:bg-slate-200 transition"
            >
              Product List
            </button>
          </div>

          {/* small premium blue info cards */}
          <div className="flex flex-wrap gap-4 pt-4 text-xs">
            <div className="flex-1 min-w-[150px] rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-100 px-4 py-3 shadow-sm">
              <p className="text-emerald-700 font-semibold mb-1">
                Hybrid Model
              </p>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                Direct selling + e-commerce for modern, scalable growth.
              </p>
            </div>
            <div className="flex-1 min-w-[150px] rounded-2xl bg-gradient-to-br from-cyan-50 via-white to-blue-50 border border-cyan-100 px-4 py-3 shadow-sm">
              <p className="text-emerald-700 font-semibold mb-1">
                Digital Focus
              </p>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                Practical guidance to grow confidently in the online world.
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Hero info card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute -inset-10 bg-gradient-to-tr from-emerald-100 via-cyan-100 to-blue-100 blur-3xl" />
          <motion.div
            whileHover={{ y: -8, rotateX: 6, rotateY: -6 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="relative rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-[0_10px_40px_rgba(148,163,184,0.35)] backdrop-blur-xl w-full max-w-md"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 mb-4">
              नवीनतम ब्रांड • WS Enterprises
            </p>
            <p className="text-sm text-slate-800 mb-3">
              हमारा लक्ष्य है कि{" "}
              <span className="font-semibold">LIFE SPARK ASSOCIATES</span>{" "}
              हर भारतीय परिवार के लिए भरोसेमंद नाम बने — गुणवत्ता, नवाचार और
              सही अवसरों के साथ।
            </p>
            <p className="text-xs text-slate-600 mb-5">
              ई-कॉमर्स और डायरेक्ट सेलिंग के सर्वश्रेष्ठ मिश्रण के साथ, हम
              अपने सदस्यों को अपनी शर्तों पर जीवन जीने की स्वतंत्रता देने पर
              विश्वास करते हैं।
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-3 border border-emerald-100">
                <p className="text-emerald-700 font-semibold mb-1">
                  Personal Care
                </p>
                <p className="text-slate-700">
                  रोजमर्रा की जरूरतों के लिए भरोसेमंद उत्पाद।
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 border border-cyan-100">
                <p className="text-cyan-700 font-semibold mb-1">
                  Health & Wellness
                </p>
                <p className="text-slate-700">
                  बेहतर जीवन के लिए हेल्थ और वेलनेस सॉल्यूशन्स।
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
