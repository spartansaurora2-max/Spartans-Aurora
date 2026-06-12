import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useState, type FormEvent } from "react";

interface JoinRanksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM = { firstName: "", lastName: "", phone: "", email: "" };

export default function JoinRanksModal({ isOpen, onClose }: JoinRanksModalProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const base = import.meta.env.VITE_API_URL ?? "";
      const res = await fetch(`${base}/api/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Unable to submit. Please try again.");
      }
      alert("YOUR INTEL HAS BEEN RECEIVED. PREPARE FOR CONTACT.");
      setFormData(EMPTY_FORM);
      onClose();
    } catch (err: any) {
      setError(err.message || "Unable to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#222222] border-2 border-[#ff5540] p-8 md:p-12 shadow-[10px_10px_0px_0px_#ff5540]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-[#ff5540] transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="font-display text-4xl md:text-5xl uppercase text-white mb-2 leading-none">
              JOIN THE <span className="text-[#ff5540]">RANKS</span>
            </h2>
            <p className="font-sans text-sm text-[#e2e2e2]/60 mb-8 uppercase tracking-widest">
              Submit your intel. Only the elite proceed.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-sans font-bold text-[10px] tracking-widest uppercase text-[#ffb4a8]">
                    First Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/20 focus:border-[#ff5540] text-white py-2 outline-none transition-colors font-sans"
                    placeholder="ENTER NAME"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-sans font-bold text-[10px] tracking-widest uppercase text-[#ffb4a8]">
                    Last Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/20 focus:border-[#ff5540] text-white py-2 outline-none transition-colors font-sans"
                    placeholder="ENTER SURNAME"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-sans font-bold text-[10px] tracking-widest uppercase text-[#ffb4a8]">
                  Telephone Number
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-white/20 focus:border-[#ff5540] text-white py-2 outline-none transition-colors font-sans"
                  placeholder="XXX-XXX-XXXX"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-sans font-bold text-[10px] tracking-widest uppercase text-[#ffb4a8]">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-white/20 focus:border-[#ff5540] text-white py-2 outline-none transition-colors font-sans"
                  placeholder="SOLDIER@EXAMPLE.COM"
                />
              </div>

              {error && (
                <p className="font-sans text-sm text-[#ff5540] font-bold">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-8 bg-[#ff5540] text-[#5c0000] font-sans font-bold text-sm tracking-widest py-4 uppercase shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#ffffff] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {submitting ? "ENLISTING..." : "ENLIST NOW"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
