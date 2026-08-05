"use client";

import { useEffect, useState } from "react";
import { PartyPopper, Trophy } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Avatar from "@/components/ui/Avatar";

const AUTO_DISMISS_MS = 5000;

function fmt(n) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n || 0));
}

export default function CelebrationOverlay({ event, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!event) return;
    setVisible(true);
    const t1 = setTimeout(() => setVisible(false), AUTO_DISMISS_MS - 300);
    const t2 = setTimeout(() => onDismiss(), AUTO_DISMISS_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [event, onDismiss]);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 cursor-pointer transition-opacity duration-300"
      style={{
        background: "rgba(17, 24, 39, 0.75)",
        backdropFilter: "blur(4px)",
        opacity: visible ? 1 : 0,
      }}
      onClick={() => {
        setVisible(false);
        setTimeout(onDismiss, 250);
      }}
    >
      <div
        className="relative flex flex-col items-center text-center max-w-lg w-full rounded-3xl p-8 sm:p-12 transition-all duration-300"
        style={{
          background: `linear-gradient(160deg, ${COLORS.primary}, #6D5FDB)`,
          transform: visible ? "scale(1)" : "scale(0.85)",
          boxShadow: "0 30px 80px rgba(67, 56, 202, 0.5)",
        }}
      >
        <div className="absolute -top-5 -left-5 text-4xl animate-bounce">🎉</div>
        <div className="absolute -top-3 -right-6 text-4xl animate-bounce" style={{ animationDelay: "0.15s" }}>🎊</div>

        <PartyPopper size={40} className="text-white/90 mb-3" />

        <p className="uppercase tracking-widest text-xs sm:text-sm font-bold text-white/70 mb-4">
          Yangi sotuv amalga oshdi!
        </p>

        <Avatar initials={event.avatar} src={event.avatarImage} size={88} ring="rgba(255,255,255,0.4)" />

        <h2 className="text-white font-extrabold text-2xl sm:text-4xl mt-4">{event.name}</h2>

        <div className="flex items-center gap-1.5 mt-2 text-white/80 font-semibold text-sm sm:text-base">
          <Trophy size={16} />
          {event.team} jamoasi
        </div>

        {event.tariff && (
          <p className="text-white/70 text-sm mt-3">{event.tariff}</p>
        )}

        <p className="text-white font-black text-4xl sm:text-6xl mt-4 tracking-tight">
          +{fmt(event.amount)}
        </p>
        <p className="text-white/80 font-semibold text-sm sm:text-base mt-1">so'm</p>

        <p className="text-white/50 text-xs mt-8">Yopish uchun istalgan joyni bosing</p>
      </div>
    </div>
  );
}
