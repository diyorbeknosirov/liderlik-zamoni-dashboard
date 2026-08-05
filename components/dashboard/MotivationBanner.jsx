"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { COLORS, MOTIVATIONS } from "@/lib/constants";

export default function MotivationBanner() {
  const idx = useMemo(() => {
    const d = new Date();
    const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    return dayOfYear % MOTIVATIONS.length;
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5" style={{ background: `linear-gradient(90deg, ${COLORS.primary}, #6D5FDB)` }}>
      <Sparkles size={20} className="text-white shrink-0" />
      <p className="text-white font-semibold text-sm sm:text-base">{MOTIVATIONS[idx]}</p>
    </div>
  );
}
