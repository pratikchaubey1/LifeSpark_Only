// src/components/AboutSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { fadeUp, sectionTitle } from "../config/motionConfig";

const stats = [
  { labelTop: "50k+", labelBottom: "Trusted Customers", accent: "Global" },
  { labelTop: "32k+", labelBottom: "Projects Completed", accent: "Across India" },
  { labelTop: "21+", labelBottom: "Years Experience", accent: "Industry-wide" },
  { labelTop: "97+", labelBottom: "Team Members", accent: "Dedicated & Skilled" },
];

const AboutSection = () => (
  <section
    id="about"
    className="py-16 md:py-20 border-b border-slate-200 bg-slate-50"
  >
    <div className="max-w-6xl mx-auto px-4">
      {sectionTitle("About Us", "The Most Profitable Company in WSE")}
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          custom={0}
          className="space-y-5 text-sm md:text-[15px] text-slate-700"
        >
          <p>
            WORLD SHOPEE ENTERPRISES का विज़न है कि हर भारतीय परिवार में हमारा
            ब्रांड एक जाना-पहचाना नाम बने। हम व्यक्तिगत देखभाल, स्वास्थ्य और
            वेलनेस जैसे क्षेत्रों में विविध उत्पाद उपलब्ध कराते हैं।
          </p>
          <p>
            हमारा मिशन लोगों को डिजिटल दुनिया के बारे में शिक्षित करना और
            उन्हें मजबूत व्यापारिक अवसरों से जोड़ना है, ताकि वे अपने सपनों
            को अपना सकें और अपने परिवारों को आर्थिक रूप से मज़बूत बना सकें।
          </p>
          <p>
            “वेल्थ थ्रू हेल्थ” के सिद्धांत पर चलते हुए, हम अपने समुदाय के
            सदस्यों के जीवन को समृद्ध बनाने पर ध्यान देते हैं — अच्छा स्वास्थ्य,
            बेहतर आय और सही मार्गदर्शन के साथ।
          </p>
          <div className="flex flex-wrap gap-3 pt-3 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-white border border-emerald-100 text-emerald-700">
              Strategy & Consulting
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-cyan-100 text-cyan-700">
              Business Process
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700">
              Marketing Rules
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-fuchsia-100 text-fuchsia-700">
              Partnerships
            </span>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0.2}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white border border-slate-200 p-4 flex flex-col justify-between shadow-sm"
            >
              <p className="text-2xl font-semibold text-emerald-600 mb-2">
                {s.labelTop}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">
                {s.labelBottom}
              </p>
              <p className="text-[11px] text-slate-500">{s.accent}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutSection;
