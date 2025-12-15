// src/components/TestimonialsSection.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, sectionTitle } from "../config/motionConfig";

const API_BASE = "http://localhost:5000";

const fallbackTestimonials = [
  {
    id: "TST-fallback-1",
    text: "World Shopee Enterprises helped me turn small efforts into a meaningful side income.",
    name: "Person Name",
    role: "Distributor",
  },
  {
    id: "TST-fallback-2",
    text: "The training on digital skills and planning made a huge difference in my confidence.",
    name: "Person Name",
    role: "Team Leader",
  },
  {
    id: "TST-fallback-3",
    text: "Clear products, simple roadmap and a very supportive community.",
    name: "Person Name",
    role: "Partner",
  },
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/site/testimonials`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.testimonials)) {
          setTestimonials(data.testimonials);
        }
      } catch {
        // keep fallbackTestimonials
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <section className="py-16 md:py-20 border-b border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        {sectionTitle("Our Feedbacks", "Clients are Talking")}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          custom={0}
          className="grid md:grid-cols-3 gap-5"
        >
          {loading ? (
            <div className="text-sm text-slate-500">Loading testimonials...</div>
          ) : (
            testimonials.map((t) => (
              <motion.div
                key={t.id || `${t.name}-${t.role}`}
                whileHover={{ y: -4 }}
                className="rounded-3xl bg_white bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-sm"
              >
                <p className="text-xs text-slate-700 mb-4 leading-relaxed">
                  {t.text}
                </p>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-[11px] text-slate-600">{t.role}</p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
