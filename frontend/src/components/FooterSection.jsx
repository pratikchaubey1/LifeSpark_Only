// src/components/FooterSection.jsx
import React from "react";
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";

const FooterSection = ({
  isAuthenticated,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
}) => {
  return (
    <footer
      id="footer"
      className="pt-16 pb-6 border-t border-slate-200 bg-slate-50"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Newsletter */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 md:p-8 mb-10 grid md:grid-cols-[1.3fr_1fr] gap-6 items-center shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 mb-2">
              Newsletter
            </p>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
              Stay updated with LSA news & opportunities.
            </h3>
            <p className="text-xs md:text-sm text-slate-700">
              The purpose of our newsletter is to deliver important updates,
              exclusive offers, and educational content directly to your inbox,
              helping you stay informed and always one step ahead.
            </p>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 rounded-full bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-emerald-400"
            />
            <button className="w-full px-4 py-2.5 text-xs rounded-full bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition">
              Subscribe
            </button>
          </div>
        </div>

        {/* Footer content */}
        <div className="grid md:grid-cols-4 gap-8 text-xs text-slate-700 mb-8">
          {/* Brand + Social */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Life Spark Associates
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              A hybrid platform combining e-commerce and direct selling to
              enrich lives across India.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://t.me/+zkZb7h9Gcbw4NDg9"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-slate-300 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition"
                aria-label="Telegram"
              >
                <FaTelegramPlane size={20} />
              </a>

              <a
                href="https://chat.whatsapp.com/Ly40UBqqkhA8j6vsOL7vqg?mode=hqrt2"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-slate-300 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Contact Info
            </h4>
            <p>
              5th floor, 2/A, M.P. Marg, Opera House, Charni Road (East),
              Mumbai 400005
            </p>
            <p className="mt-1">lifesparkassociate@gmail.com</p>
          </div>

          {/* Popular Posts */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Popular Post
            </h4>
            <p className="text-slate-900 font-medium">Investment</p>
            <p className="text-xs text-slate-600 mb-2">
              Revisiting your income & distribution goals.
            </p>
            <p className="text-slate-900 font-medium">Business</p>
            <p className="text-xs text-slate-600">
              Conversation with leaders on the direct selling future.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} Life Spark Associates. All rights
            reserved.
          </p>

          <div className="flex items-center gap-3 mt-2 md:mt-0">
            {isAuthenticated ? (
              <button
                className="px-4 py-1.5 rounded-full border border-rose-300 text-rose-600 text-[11px] font-semibold hover:bg-rose-50 transition"
                onClick={onLogoutClick}
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  className="px-4 py-1.5 rounded-full border border-emerald-400 text-emerald-600 text-[11px] font-semibold hover:bg-emerald-50 transition"
                  onClick={onRegisterClick}
                >
                  Register
                </button>
                <button
                  className="px-4 py-1.5 rounded-full bg-emerald-400 text-slate-950 text-[11px] font-semibold hover:bg-emerald-300 transition"
                  onClick={onLoginClick}
                >
                  Login
                </button>
              </>
            )}
          </div>

          <p>Design inspired by the original LSA website layout.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
