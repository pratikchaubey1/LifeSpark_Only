// src/components/FooterSection.jsx
import React from "react";

const FooterSection = ({ isAuthenticated, onLoginClick, onRegisterClick, onLogoutClick }) => {
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
              Stay updated with WSE news & opportunities.
            </h3>
            <p className="text-xs md:text-sm text-slate-700">
              न्यूज़लेटर का उद्देश्य है कि महत्वपूर्ण अपडेट, ऑफर्स और एजुकेशनल
              कंटेंट सीधे आपके इनबॉक्स तक पहुँचे, ताकि आप हमेशा एक कदम आगे रहें।
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

        {/* Footer bottom */}
        <div className="grid md:grid-cols-4 gap-8 text-xs text-slate-700 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              World Shopee Enterprises
            </h4>
            <p className="text-xs text-slate-600">
              A hybrid platform combining e-commerce and direct selling to
              enrich lives across India.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Explore
            </h4>
            <ul className="space-y-1 text-slate-600">
              <li>Home</li>
              <li>Services</li>
              <li>About Us</li>
              <li>Latest Projects</li>
              <li>Testimonials</li>
              <li>Our Team</li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Contact Info
            </h4>
            <p>Varanasi, Uttar Pradesh</p>
            <p className="mt-1">worldshopeeenterprises@gmail.com</p>
            <p>+91 73070 17024</p>
          </div>

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

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} World Shopee Enterprises. All rights
            reserved.
          </p>

          {/* Bottom menu buttons */}
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

          <p>Design inspired by the original WSE website layout.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
