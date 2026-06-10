import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData.email, formData.password);
      navigate("/media");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Try again.");
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-24 min-h-screen flex items-center justify-center px-4 md:px-16"
    >
      <div className="relative w-full max-w-md">
        <div className="absolute -top-6 -left-6 z-10 p-4 bg-[#ff5540] text-[#5c0000] shadow-[4px_4px_0px_0px_#ffffff]">
          <Lock size={28} />
        </div>

        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="glass-card p-8 md:p-12 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="font-display text-5xl md:text-6xl uppercase text-[#ffb4a8] italic leading-none mb-2">
              SECURE <span className="text-white">ACCESS</span>
            </h1>
            <p className="font-sans text-sm text-[#ebbbb4]/70 mb-10 uppercase tracking-widest">
              Authenticate to enter the war room.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block font-sans font-bold text-[10px] tracking-widest uppercase text-[#ffb4a8]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40"
                  />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/20 focus:border-[#ff5540] text-white py-2 pl-7 outline-none transition-colors font-sans"
                    placeholder="SOLDIER@EXAMPLE.COM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-sans font-bold text-[10px] tracking-widest uppercase text-[#ffb4a8]">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40"
                  />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/20 focus:border-[#ff5540] text-white py-2 pl-7 pr-8 outline-none transition-colors font-sans"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#ff5540] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="appearance-none w-4 h-4 border-2 border-white/30 checked:bg-[#ff5540] checked:border-[#ff5540] transition-colors cursor-pointer"
                  />
                  <span className="font-sans text-[10px] tracking-widest uppercase text-[#ebbbb4]/70">
                    Stay deployed
                  </span>
                </label>
                <a
                  href="#"
                  className="font-sans text-[10px] tracking-widest uppercase text-[#ffb4a8] hover:text-[#ff5540] transition-colors"
                >
                  Lost credentials?
                </a>
              </div>

              {error && (
                <p className="font-sans text-xs tracking-widest uppercase text-[#ff5540] border-l-2 border-[#ff5540] pl-3 py-1">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-[#ff5540] text-[#5c0000] font-sans font-bold text-sm tracking-widest py-4 uppercase shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#ffffff] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#ffffff]"
              >
                {loading ? "AUTHENTICATING..." : "BREACH THE GATE"}
              </button>
            </form>

            <p className="font-sans text-xs text-[#ebbbb4]/60 mt-8 text-center uppercase tracking-widest">
              Not enlisted?{" "}
              <Link to="/roster" className="text-[#ffb4a8] hover:text-[#ff5540] transition-colors">
                Join the ranks
              </Link>
            </p>
          </div>

          <div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none">
            <span className="font-display text-[200px] text-white">301</span>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}
