// App.jsx
import React, { useEffect, useState } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import MissionVisionSection from "./components/MissionVisionSection";
import ServicesSection from "./components/ServicesSection";
import ProjectsSection from "./components/ProjectsSection";
import ProductSection from "./components/ProductSection";
import TeamSection from "./components/TeamSection";
import TestimonialsSection from "./components/TestimonialsSection";
import FAQSection from "./components/FAQSection";
import NewsletterSection from "./components/NewsletterSection";
import FooterSection from "./components/FooterSection";

const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Service", id: "services" },
  { label: "Project", id: "projects" },
  { label: "Product", id: "product" },
  { label: "Team", id: "team" },
  { label: "FAQs", id: "faqs" },
  { label: "Contact", id: "footer" },
];

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1.2,
      smoothWheel: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.from(".hero-heading", {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
    gsap.from(".hero-sub", {
      y: 20,
      opacity: 0,
      duration: 0.9,
      delay: 0.3,
      ease: "power3.out",
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id) setActiveSection(id);
          }
        });
      },
      { threshold: 0.3 }
    );

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      lenis.destroy();
      observer.disconnect();
    };
  }, []);

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header
        activeSection={activeSection}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        scrollToId={scrollToId}
        NAV_ITEMS={NAV_ITEMS}
      />

      <HeroSection scrollToId={scrollToId} />
      <AboutSection />
      <MissionVisionSection />
      <ServicesSection />
      <ProjectsSection />
      <ProductSection />
      <TeamSection />
      <TestimonialsSection />
      <FAQSection />
      <NewsletterSection />
      <FooterSection />
    </div>
  );
}
