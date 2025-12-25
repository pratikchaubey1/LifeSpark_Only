import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import MemberLayout from "./components/dashboard/MemberLayout.jsx";
import AdminPage from "./components/dashboard/AdminPage.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Website */}
        <Route path="/*" element={<App />} />

        {/* Dashboard */}
        <Route path="/dashboard/*" element={<MemberLayout />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/login" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
