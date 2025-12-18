// App.jsx
import React, { useEffect, useState } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";

import config from "./config/config";

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
import FooterSection from "./components/FooterSection";

import MemberLayout from "./components/dashboard/MemberDashboard";
import OfficialLoginPage from "./components/dashboard/Login";
import OfficialRegisterPage from "./components/dashboard/Register";
import WelcomePage from "./components/dashboard/WelcomePage";
import WelcomeLetter from "./components/dashboard/WelcomeLetter";
import CreateIdCard from "./components/dashboard/CreateIdCard";

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

  // authView controls full-screen auth/dashboard flow
  const [authView, setAuthView] = useState(null);
  // null | "login" | "register" | "welcome" | "welcomeLetter" | "idCard" | "dashboard"

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const [welcomeData, setWelcomeData] = useState(null);

  /* ---------------- LOGOUT ---------------- */
  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setAuthView(null);
    setWelcomeData(null);
  }

  /* ---------------- REGISTER ---------------- */
  async function handleRegisterSubmit(payload) {
    const res = await fetch(`${config.apiUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);

    setWelcomeData({
      name: data.user?.name || payload.name,
      email: data.user?.email || payload.email,
      password: payload.password, // only for welcome screen
      inviteCode: data.user?.inviteCode,
    });

    setAuthView("welcome");
  }

  /* ---------------- LOGIN ---------------- */
  async function handleLoginSubmit(payload) {
    const res = await fetch(`${config.apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);

    // Login ke baad direct dashboard
    setAuthView("dashboard");
  }

  /* ---------------- SMOOTH SCROLL + ANIM ---------------- */
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1.2,
      smoothWheel: true,
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
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id);
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
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  /* ================= FULL SCREEN VIEWS ================= */

  if (authView === "login") {
    return (
      <OfficialLoginPage
        onSubmit={handleLoginSubmit}
        onGoToRegister={() => setAuthView("register")}
        onGoHome={() => setAuthView(null)}
      />
    );
  }

  if (authView === "register") {
    return (
      <OfficialRegisterPage
        onSubmit={handleRegisterSubmit}
        onGoToLogin={() => setAuthView("login")}
        onGoHome={() => setAuthView(null)}
      />
    );
  }

  if (authView === "welcome" && welcomeData) {
    return (
      <WelcomePage
        userName={welcomeData.name}
        email={welcomeData.email}
        password={welcomeData.password}
        inviteCode={welcomeData.inviteCode}
        onContinue={() => setAuthView("dashboard")}
        onViewWelcomeLetter={() => setAuthView("welcomeLetter")}
        onCreateIdCard={() => setAuthView("idCard")}
      />
    );
  }

  if (authView === "welcomeLetter" && welcomeData) {
    return (
      <WelcomeLetter
        userName={welcomeData.name}
        email={welcomeData.email}
        inviteCode={welcomeData.inviteCode}
        onBack={() => setAuthView("welcome")}
        onCreateIdCard={() => setAuthView("idCard")}
        onContinue={() => setAuthView("dashboard")}
      />
    );
  }

  if (authView === "idCard" && welcomeData) {
    return (
      <CreateIdCard
        userName={welcomeData.name}
        email={welcomeData.email}
        inviteCode={welcomeData.inviteCode}
        onBack={() => setAuthView("welcome")}
        onContinue={() => setAuthView("dashboard")}
      />
    );
  }

  /* ---------------- DASHBOARD ---------------- */
  if (authView === "dashboard" && isAuthenticated) {
    return <MemberLayout onLogout={handleLogout} />;
  }

  /* ================= LANDING WEBSITE ================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header
        activeSection={activeSection}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        scrollToId={scrollToId}
        NAV_ITEMS={NAV_ITEMS}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setAuthView("login")}
        onRegisterClick={() => setAuthView("register")}
        onLogoutClick={handleLogout}
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
      <FooterSection
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setAuthView("login")}
        onRegisterClick={() => setAuthView("register")}
        onLogoutClick={handleLogout}
      />
    </div>
  );
}
