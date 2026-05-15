import { motion } from "motion/react";

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-[#0e0e0e] border-t border-white/10 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-16 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="font-display text-4xl text-[#e2e2e2] tracking-tighter uppercase">
            SPARTANS AURORA
          </div>
          <p className="font-sans text-sm text-[#ebbbb4]/70 max-w-sm text-center md:text-left">
            © 2024 spartans-aurora.ca. Aggression Refined. Victory Defined.
          </p>
        </div>
        <div className="flex gap-10">
          <div className="flex flex-col gap-2">
            <span className="font-sans font-bold text-sm text-[#ffb4a8] uppercase mb-2 tracking-widest">Platform</span>
            <a href="#" className="font-sans text-sm text-[#ebbbb4]/70 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="font-sans text-sm text-[#ebbbb4]/70 hover:text-white transition-colors">Terms</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-sans font-bold text-sm text-[#ffb4a8] uppercase mb-2 tracking-widest">Connect</span>
            <a href="#" className="font-sans text-sm text-[#ebbbb4]/70 hover:text-white transition-colors">Sponsors</a>
            <a href="#" className="font-sans text-sm text-[#ebbbb4]/70 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="w-12 h-12 flex items-center justify-center border border-white/20 hover:border-[#ffb4a8] hover:text-[#ffb4a8] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
          </button>
          <button className="w-12 h-12 flex items-center justify-center border border-white/20 hover:border-[#ffb4a8] hover:text-[#ffb4a8] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
