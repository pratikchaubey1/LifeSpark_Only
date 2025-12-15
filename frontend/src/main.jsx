
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import MemberLayout from "./components/dashboard/MemberDashboard.jsx";
import AdminPage from "./components/dashboard/AdminPage.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public landing site */}
        <Route path="/" element={<App />} />

        {/* Member dashboard (left dark menu + right stats) */}
        <Route path="/dashboard" element={<MemberLayout />} />

        {/* Admin panel (supports both /admin and /admin/login URLs) */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/login" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
