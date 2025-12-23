import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
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

import MemberLayout from "./components/dashboard/MemberLayout";
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

  const [authView, setAuthView] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [welcomeData, setWelcomeData] = useState(null);

  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setAuthView(null);
    setWelcomeData(null);
    navigate("/");
  }

  // REGISTER SUBMIT
  async function handleRegisterSubmit(payload) {
    const res = await fetch(`${config.apiUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Register failed");

    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);

    setWelcomeData({
      name: data.user?.name || payload.name,
      email: data.user?.email || payload.email,
      password: payload.password,
      inviteCode: data.user?.inviteCode,
    });

    setAuthView("welcome");
    navigate("/welcome");
  }

  // LOGIN SUBMIT
  async function handleLoginSubmit(payload) {
    const res = await fetch(`${config.apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);

    setAuthView("dashboard");
    navigate("/dashboard");
  }

  // Smooth scroll + GSAP animation
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.from(".hero-heading", { y: 40, opacity: 0, duration: 1 });
  }, []);

  return (
    <Routes>
      {/* HOME PAGE */}
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-slate-50">
            <Header
              activeSection={activeSection}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              NAV_ITEMS={NAV_ITEMS}
              onLoginClick={() => navigate("/login")}
              onRegisterClick={() => navigate("/register")}
              onLogoutClick={handleLogout}
              isAuthenticated={isAuthenticated}
            />

            <HeroSection />
            <AboutSection />
            <MissionVisionSection />
            <ServicesSection />
            <ProjectsSection />
            <ProductSection />
            <TeamSection />
            <TestimonialsSection />
            <FAQSection />
            <FooterSection />
          </div>
        }
      />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          <OfficialLoginPage
            onSubmit={handleLoginSubmit}
            onGoToRegister={() => navigate("/register")}
            onGoHome={() => navigate("/")}
          />
        }
      />

      {/* REGISTER */}
      <Route
        path="/register"
        element={
          <OfficialRegisterPage
            onSubmit={handleRegisterSubmit}
            onGoToLogin={() => navigate("/login")}
            onGoHome={() => navigate("/")}
          />
        }
      />

      {/* WELCOME */}
      <Route
        path="/welcome"
        element={
          welcomeData ? (
            <WelcomePage
              userName={welcomeData.name}
              email={welcomeData.email}
              password={welcomeData.password}
              inviteCode={welcomeData.inviteCode}
              onContinue={() => navigate("/dashboard")}
              onViewWelcomeLetter={() => navigate("/welcome-letter")}
              onCreateIdCard={() => navigate("/create-id-card")}
            />
          ) : null
        }
      />

      {/* WELCOME LETTER */}
      <Route
        path="/welcome-letter"
        element={
          welcomeData ? (
            <WelcomeLetter
              userName={welcomeData.name}
              email={welcomeData.email}
              inviteCode={welcomeData.inviteCode}
              onBack={() => navigate("/welcome")}
              onContinue={() => navigate("/dashboard")}
            />
          ) : null
        }
      />

      {/* CREATE ID CARD */}
      <Route
        path="/create-id-card"
        element={
          welcomeData ? (
            <CreateIdCard
              userName={welcomeData.name}
              email={welcomeData.email}
              inviteCode={welcomeData.inviteCode}
              onBack={() => navigate("/welcome")}
              onContinue={() => navigate("/dashboard")}
            />
          ) : null
        }
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated ? (
            <MemberLayout onLogout={handleLogout} />
          ) : (
            <OfficialLoginPage onSubmit={handleLoginSubmit} />
          )
        }
      />
    </Routes>
  );
}
