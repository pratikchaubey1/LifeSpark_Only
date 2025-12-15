// src/components/ProductSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { fadeUp, sectionTitle } from "../config/motionConfig";

const ProductSection = () => {
  return (
    <section
      id="product"
      className="py-16 md:py-20 border-b border-slate-200 bg-slate-50"
    >
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          custom={0}
        >
          {sectionTitle("Our Product", "What Does Choosing a Product Do?")}
          <p className="text-sm text-slate-700 mb-3">
            आज हर व्यक्ति दिन में कई घंटे मोबाइल, लैपटॉप और अन्य गैजेट्स पर बिताता
            है। ऐसे में इलेक्ट्रॉनिक डिवाइसेस से निकलने वाली रेडिएशन को हल्के में
            नहीं लिया जा सकता।
          </p>
          <p className="text-sm text-slate-700 mb-4">
            यदि आपका पहला प्रोडक्ट एंटी-रेडिएशन चिप है, तो आपको लोगों को इस तरह
            समझाना चाहिए कि यह उनके और उनके परिवार के लिए कैसे फायदेमंद हो सकता
            है — जैसे कि{" "}
            <span className="font-semibold">
              मोबाइल, वाई-फाई और गैजेट्स से निकलने वाली हानिकारक रेडिएशन को
              कम करना।
            </span>
          </p>
          <button className="px-5 py-2.5 text-xs rounded-full border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition bg-white">
            Read More
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-3xl bg-white border border-emerald-200 p-6 shadow-sm"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 mb-3">
            Flagship Product
          </p>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">
            Anti-Radiation Chip
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 mb-4">
            <li>• Helps reduce exposure to harmful gadget radiation.</li>
            <li>• Easy to apply on phones, laptops and Wi-Fi routers.</li>
            <li>• Builds awareness about digital health.</li>
          </ul>
          <div className="h-28 rounded-2xl bg-gradient-to-tr from-emerald-200 via-cyan-200 to-blue-300 flex items-center justify-center text-xs font-semibold text-slate-900">
            Product Image Placeholder
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductSection;
