// src/config/motionConfig.jsx
import React from "react";

export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay },
  }),
};

export const sectionTitle = (subtitle, title) => (
  <div className="text-center max-w-2xl mx-auto mb-10">
    <p className="text-xs tracking-[0.25em] uppercase text-teal-600 mb-3">
      {subtitle}
    </p>
    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
      {title}
    </h2>
    <div className="mt-4 h-[2px] w-16 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 mx-auto rounded-full" />
  </div>
);
