// src/components/ServicesSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { fadeUp, sectionTitle } from "../config/motionConfig";

const services = [
  {
    title: "Business Strategy",
    desc: "Help new members understand the core business around flagship products, not just selling.",
  },
  {
    title: "Consultancy & Advice",
    desc: "Guide new partners so they can grow confidently in direct selling and e-commerce.",
  },
  {
    title: "Planning & Roadmap",
    desc: "Clear business plans so no one feels lost or quits midway.",
  },
  {
    title: "Private Clients",
    desc: "Special focus and support for high-value or private clients.",
  },
];

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="py-16 md:py-20 border-b border-slate-200 bg-slate-50"
    >
      <div className="max-w-6xl mx-auto px-4">
        {sectionTitle("Our Services", "Offering the Best Consulting")}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              whileHover={{ y: -6, scale: 1.02 }}
              className="rounded-3xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-emerald-300 transition"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">
                  0{i + 1}
                </p>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-700">{service.desc}</p>
              </div>
              <button className="mt-4 text-xs text-emerald-600 flex items-center gap-1 hover:text-emerald-500">
                Read More <span className="text-base leading-none">↗</span>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
