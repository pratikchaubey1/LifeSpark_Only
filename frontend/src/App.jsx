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
import FooterSection from "./components/FooterSection";
import MemberLayout from "./components/dashboard/MemberDashboard";
import OfficialLoginPage from "./components/dashboard/Login";
import OfficialRegisterPage from "./components/dashboard/Register";
import WelcomePage from "./components/dashboard/WelcomePage";
import WelcomeLetter from "./components/dashboard/WelcomeLetter";
import CreateIdCard from "./components/dashboard/CreateIdCard";

const NAV_ITEMS = [
  { label: "Home", id: "home" } ,
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
  const [authView, setAuthView] = useState(null); // "login" | "register" | "welcome" | "welcomeLetter" | "idCard"
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [welcomeData, setWelcomeData] = useState(null);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setAuthView(null);
  }

  async function handleRegisterSubmit(payload) {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    // Save member token
    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);

    // After register, go to WelcomePage with real invite code from backend
    setWelcomeData({
      name: data.user?.name || payload.name,
      email: data.user?.email || payload.email,
      // we only know plain password from payload, not from backend
      password: payload.password,
      inviteCode: data.user?.inviteCode,
    });
    setAuthView("welcome");
  }

  async function handleLoginSubmit(payload) {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email, password: payload.password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }
    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);
    setAuthView(null);
  }

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

  // When authView is set, show the corresponding page full-screen
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
        onContinue={() => {
          setAuthView(null);
        }}
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
        onContinue={() => setAuthView(null)}
      />
    );
  }

  if (authView === "idCard" && welcomeData) {
    return (
      <CreateIdCard
        userName={welcomeData.name}
        email={welcomeData.email}
        inviteCode={welcomeData.inviteCode}
        onBack={() => setAuthView("welcomeLetter")}
        onContinue={() => setAuthView(null)}
      />
    );
  }

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

