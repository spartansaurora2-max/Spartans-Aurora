import { motion, AnimatePresence } from "motion/react";
import { X, CalendarDays, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScheduleEvent {
  subject: string;
  start: string | null;
  end: string | null;
  timeZone: string;
  location: string;
  isAllDay: boolean;
  preview: string;
  link: string;
}

// Graph returns naive local datetimes (e.g. "2026-06-20T18:00:00.0000000")
// already in the requested timezone, so parse the wall-clock parts directly
// rather than letting the browser apply its own offset.
function parseGraphDate(value: string | null): Date | null {
  if (!value) return null;
  const m = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (!m) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  const [, y, mo, d, h, mi, s] = m;
  return new Date(+y, +mo - 1, +d, +h, +mi, s ? +s : 0);
}

const DAY_FMT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
};
const TIME_FMT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

export default function ScheduleModal({ isOpen, onClose }: ScheduleModalProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL ?? "";
        const res = await fetch(`${base}/api/schedule`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Unable to load the schedule.");
        }
        if (!cancelled) setEvents(data.events || []);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Unable to load the schedule.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

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
            className="relative w-full max-w-lg bg-[#222222] border-2 border-[#ff5540] p-8 md:p-12 shadow-[10px_10px_0px_0px_#ff5540] max-h-[85vh] flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-[#ff5540] transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="font-display text-4xl md:text-5xl uppercase text-white mb-2 leading-none">
              THE <span className="text-[#ff5540]">SCHEDULE</span>
            </h2>
            <p className="font-sans text-sm text-[#e2e2e2]/60 mb-8 uppercase tracking-widest">
              Next 30 days of operations.
            </p>

            <div className="overflow-y-auto -mr-2 pr-2 space-y-4">
              {loading && (
                <p className="font-sans text-sm text-[#ffb4a8] uppercase tracking-widest">
                  Loading intel...
                </p>
              )}

              {!loading && error && (
                <p className="font-sans text-sm text-[#ff5540] font-bold">{error}</p>
              )}

              {!loading && !error && events.length === 0 && (
                <p className="font-sans text-sm text-[#e2e2e2]/60 uppercase tracking-widest">
                  No events scheduled in the next 30 days.
                </p>
              )}

              {!loading &&
                !error &&
                events.map((ev, i) => {
                  const start = parseGraphDate(ev.start);
                  const end = parseGraphDate(ev.end);
                  return (
                    <div
                      key={i}
                      className="border-l-4 border-[#ff5540] bg-white/5 pl-4 pr-3 py-3"
                    >
                      <div className="flex items-center gap-2 text-[#ffb4a8] font-sans font-bold text-xs tracking-widest uppercase mb-1">
                        <CalendarDays size={14} />
                        {start ? start.toLocaleDateString(undefined, DAY_FMT) : ""}
                        {start && !ev.isAllDay && (
                          <span className="text-white/70">
                            {start.toLocaleTimeString(undefined, TIME_FMT)}
                            {end &&
                              ` – ${end.toLocaleTimeString(undefined, TIME_FMT)}`}
                          </span>
                        )}
                        {ev.isAllDay && (
                          <span className="text-white/70">All day</span>
                        )}
                      </div>
                      <h3 className="font-display text-xl uppercase text-white leading-tight">
                        {ev.subject}
                      </h3>
                      {ev.location && (
                        <p className="flex items-center gap-1.5 font-sans text-xs text-[#e2e2e2]/60 mt-1">
                          <MapPin size={12} /> {ev.location}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
