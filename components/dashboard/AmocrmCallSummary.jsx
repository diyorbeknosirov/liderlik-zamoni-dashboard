"use client";

import { useMemo } from "react";
import { PhoneCall } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AmocrmCallSummary({ logs }) {
  const todayMinutes = useMemo(
    () => Math.round(logs.filter((l) => l.call_date === todayStr()).reduce((s, l) => s + (Number(l.duration_seconds) || 0), 0) / 60),
    [logs]
  );

  const monthMinutes = useMemo(
    () => Math.round(logs.reduce((s, l) => s + (Number(l.duration_seconds) || 0), 0) / 60),
    [logs]
  );

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <PhoneCall size={16} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>AmoCRM qo'ng'iroq vaqti</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{ background: COLORS.primaryLight }}>
          <p className="text-xs" style={{ color: COLORS.primary }}>Bugun</p>
          <p className="font-bold text-lg" style={{ color: COLORS.primary }}>{todayMinutes} daqiqa</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: "#F9FAFB" }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Joriy oy jami</p>
          <p className="font-bold text-lg" style={{ color: COLORS.ink }}>{monthMinutes} daqiqa</p>
        </div>
      </div>
      <p className="text-[11px] mt-3" style={{ color: COLORS.sub }}>
        Bonus qoidalari admin tomonidan "Moliya va Plan" bo'limida belgilanadi.
      </p>
    </Card>
  );
}
