import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "ROSTER", path: "/roster" },
    { name: "MEDIA", path: "/media" },
    { name: "ARCHIVE", path: "/archive" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl border-b border-white/20">
      <div className="flex justify-between items-center px-4 md:px-16 py-4 max-w-7xl mx-auto">
        <Link to="/" className="font-display text-2xl md:text-3xl text-[#ffb4a8] tracking-tighter uppercase">
          SPARTANS AURORA
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="md:hidden flex flex-col justify-between h-5 w-7 rounded-lg border border-white/20 p-1 text-white hover:bg-white/10"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            <span className="block h-0.5 w-full bg-white"></span>
            <span className="block h-0.5 w-full bg-white"></span>
            <span className="block h-0.5 w-full bg-white"></span>
          </button>
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-sans font-bold text-sm tracking-widest uppercase transition-all active:scale-95 duration-200 ${
                  location.pathname === link.path
                    ? "text-[#ffb4a8] border-b-2 border-[#ffb4a8] pb-1"
                    : "text-[#e2e2e2] hover:text-[#ffb4a8]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 border-t border-white/10 bg-[#131313]/95">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`font-sans font-bold text-sm tracking-widest uppercase transition-all active:scale-95 duration-200 px-4 py-3 rounded-xl ${
                  location.pathname === link.path
                    ? "bg-[#ffb4a8]/10 text-[#ffb4a8]"
                    : "text-[#e2e2e2] hover:bg-white/10 hover:text-[#ffb4a8]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
