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
            In today’s digital age, people spend a major part of their day using
            mobile phones, laptops, smart watches, and other electronic devices.
            With this lifestyle, the radiation emitted from these gadgets should
            not be ignored. If your first product is an anti-radiation watch, it
            is important to clearly explain how it can benefit individuals and
            their families—such as helping reduce exposure to harmful radiation
            coming from mobile phones, Wi-Fi routers, and other frequently used
            electronic devices.
          </p>

          <p className="text-sm text-slate-700 mb-4">
            If your first product is an{" "}
            <span className="font-semibold">anti-radiation chip</span>, it is
            important to explain to people how it can be beneficial for them and
            their families — such as helping to{" "}
            <span className="font-semibold">
              reduce harmful radiation emitted from mobile phones, Wi-Fi
              routers, and other electronic gadgets.
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
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Watch</h4>
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
