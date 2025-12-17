// src/components/TeamSection.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, sectionTitle } from "../config/motionConfig";

import config from "../config/config";

const API_BASE = config.apiUrl;

const fallbackTeam = [
  { id: "TEAM-fallback-1", name: "Mr. Raju Yadav", role: "Post-Basic | From Bihar", imageUrl: "" },
  { id: "TEAM-fallback-2", name: "Mr. Sushil Yadav", role: "Post-Basic | From U.P.", imageUrl: "" },
  { id: "TEAM-fallback-3", name: "Mr. Shiv Kumar", role: "Post-Basic | From Bihar, Rajgir", imageUrl: "" },
  { id: "TEAM-fallback-4", name: "Mr. Amresh Kumar Pal", role: "Post-Basic | From Mirzapur", imageUrl: "" },
  { id: "TEAM-fallback-5", name: "Mr. Raj Bijendra Yadav (Biltu)", role: "Post-Basic | From Bihar", imageUrl: "" },
  { id: "TEAM-fallback-6", name: "Mr. Gopal Sharan", role: "Post-Basic | From Bihar", imageUrl: "" },
  { id: "TEAM-fallback-7", name: "Mr. Saroj Kumar", role: "Post-Basic | From Bihar", imageUrl: "" },
  { id: "TEAM-fallback-8", name: "Mr. Rajkishor Prasad", role: "Post-Basic | From Bihar", imageUrl: "" },
];

const TeamSection = () => {
  const [team, setTeam] = useState(fallbackTeam);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/site/team-members`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.teamMembers)) {
          setTeam(data.teamMembers);
        }
      } catch {
        // keep fallbackTeam
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <section
      id="team"
      className="py-16 md:py-20 border-b border-slate-200 bg-white"
    >
      <div className="max-w-6xl mx-auto px-4">
        {sectionTitle("Our Team", "Our LSA Company Dedicated Team Member")}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-5"
        >
          {loading ? (
            <div className="text-sm text-slate-500">Loading team members...</div>
          ) : (
            team.map((member) => (
              <motion.div
                key={member.id || member.name}
                whileHover={{ y: -4, scale: 1.01 }}
                className="rounded-3xl bg-white border border-slate-200 p-4 flex flex-col items-center gap-2 shadow-sm"
              >
                {member.imageUrl ? (
                  <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-blue-500 flex items-center justify-center text-xs font-semibold text-white">
                    Photo
                  </div>
                )}
                <p className="text-sm font-semibold text-slate-900 text-center">
                  {member.name}
                </p>
                <p className="text-[11px] text-slate-600 text-center">
                  {member.role}
                </p>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
