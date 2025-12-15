// src/components/FAQSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { fadeUp, sectionTitle } from "../config/motionConfig";

const faqs = [
  {
    q: "What does a financial / business advisor do for WSE?",
    a: "Advisors help members understand the business model, manage risk, set goals and build a sustainable income plan.",
  },
  {
    q: "Which industries do you focus on?",
    a: "Primarily personal care, health, wellness and digital products, with expansion into fashion and electronics.",
  },
  {
    q: "Can you guarantee growth?",
    a: "No one can guarantee returns, but with training, planning and consistent work, members get a fair chance to grow.",
  },
  {
    q: "What makes your plans different?",
    a: "Hybrid approach: e-commerce + direct selling, transparent plans and practical digital education for members.",
  },
];

const FAQSection = () => {
  return (
    <section
      id="faqs"
      className="py-16 md:py-20 border-b border-slate-200 bg-white"
    >
      <div className="max-w-5xl mx_auto max-w-5xl mx-auto px-4">
        {sectionTitle("FAQs", "Get the Answers to Common Questions")}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          custom={0}
          className="space-y-4"
        >
          {faqs.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm shadow-sm"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-slate-900 text-sm">{item.q}</span>
                <span className="text-xs text-slate-500 group-open:hidden">
                  +
                </span>
                <span className="text-xs text-slate-500 hidden group-open:inline">
                  −
                </span>
              </summary>
              <p className="mt-2 text-xs text-slate-700">{item.a}</p>
            </details>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
