"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import Avatar from "@/components/ui/Avatar";

export default function WelcomeModal({ user, operator, monthSold, salesCount, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const dailyPlan = operator?.monthlyPlan ? Math.round(operator.monthlyPlan / 26) : 0;

  const confirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(17, 24, 39, 0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="max-w-lg w-full rounded-3xl p-7 sm:p-9 text-center"
        style={{ background: `linear-gradient(160deg, ${COLORS.primary}, #6D5FDB)`, boxShadow: "0 30px 80px rgba(67, 56, 202, 0.5)" }}
      >
        <Avatar initials={user.avatar} src={user.avatarImage} size={72} ring="rgba(255,255,255,0.4)" />

        <h2 className="text-white font-extrabold text-2xl mt-4">Salom, {user.firstName}!</h2>
        <p className="text-white/90 font-semibold mt-1 flex items-center justify-center gap-1.5">
          <Sparkles size={16} /> Siz eng zo'r sotuvchisiz!
        </p>

        <div className="text-left rounded-2xl p-4 mt-5 space-y-2.5 text-sm text-white/95" style={{ background: "rgba(255,255,255,0.12)" }}>
          <p>💰 Bugungi planingiz: <strong>{fmt(dailyPlan)} so'm</strong></p>
          <p>
            🎯 Sotuvchi sifatida vazifangiz: mijozlarga sifatli xizmat ko'rsatish,
            ularning savollariga to'liq va aniq javob berish, va eng mos kursni
            taklif qilib, sotuvni yakuniga yetkazish.
          </p>
          <p>📈 Oy davomida <strong>{salesCount} ta sotuv</strong> qildingiz, jami <strong>{fmt(monthSold)} so'm</strong>.</p>
        </div>

        <p className="text-white font-semibold mt-5 leading-relaxed">
          Bugun kayfiyatni zo'r qilib ishni boshlang — hammasi zo'r bo'ladi,
          siz qila olasiz! 💪
        </p>

        <p className="text-white/80 mt-5 mb-3 text-sm">Boshlaymizmi?</p>
        <button
          onClick={confirm}
          disabled={loading}
          className="px-8 py-3 rounded-full font-bold text-base disabled:opacity-60"
          style={{ background: "white", color: COLORS.primary }}
        >
          {loading ? "..." : "Ha, boshlaymiz!"}
        </button>
      </div>
    </div>
  );
}
