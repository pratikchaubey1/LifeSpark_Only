// src/components/MissionVisionSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../config/motionConfig";

const MissionVisionSection = () => {
  return (
    <section className="py-16 md:py-20 border-b border-slate-200 bg_white bg-white">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          custom={0}
          className="rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 mb-2">
            Our Mission
          </p>
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">
            Empowering people through digital education & business.
          </h3>
          <p className="text-sm text-slate-700 mb-3">
            WORLD SHOPEE ENTERPRISES का मिशन है कि आम लोगों को डिजिटल दुनिया का
            ज्ञान, सही ट्रेनिंग और मजबूत बिज़नेस मॉडल के साथ जोड़ा जाए ताकि वे
            अपनी शर्तों पर जीवन जी सकें।
          </p>
          <p className="text-sm text-slate-700 mb-4">
            हम ऐसा हाइब्रिड मॉडल इस्तेमाल करते हैं जिसमें ई-कॉमर्स और डायरेक्ट
            सेलिंग दोनों शामिल हैं, ताकि हर सदस्य अपनी क्षमता के अनुसार बढ़ सके।
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Practical business training</li>
            <li>• Simple plans for new members</li>
            <li>• Focus on long-term, ethical growth</li>
          </ul>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          custom={0.15}
          className="rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-600 mb-2">
            Our Vision
          </p>
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">
            A trusted name in every Indian household.
          </h3>
          <p className="text-sm text-slate-700 mb-3">
            हमारा विज़न है कि हम व्यक्तिगत देखभाल, स्वास्थ्य और वेलनेस के क्षेत्र
            में ऐसे प्रोडक्ट्स दें जो बदलती ज़रूरतों के साथ तालमेल बिठाएँ।
          </p>
          <p className="text-sm text-slate-700 mb-4">
            डिजिटल ट्रांसफ़ॉर्मेशन की ताकत का उपयोग करते हुए, हम अपने पार्टनर्स और
            ग्राहकों दोनों के लिए समृद्ध भविष्य बनाना चाहते हैं।
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Digital-first business expansion</li>
            <li>• Strong product quality & innovation</li>
            <li>• Helping people live on their own terms</li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default MissionVisionSection;
