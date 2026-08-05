"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { isCheckInOnTime } from "@/lib/salary";
import Card from "@/components/ui/Card";

const WEEKDAY_LABELS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function AttendanceCalendar({ operator, workSessions, title }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = daysInMonth(year, month);
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Yakshanba
  const leadingBlanks = (firstWeekday + 6) % 7; // Dushanba=0 qilib moslashtiramiz

  const sessionsByDate = useMemo(() => {
    const map = {};
    (workSessions || []).forEach((s) => {
      map[s.work_date] = s;
    });
    return map;
  }, [workSessions]);

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateStr });
  }

  const today = now.toISOString().slice(0, 10);

  return (
    <Card className="p-3 sm:p-4 max-w-xs">
      <div className="flex items-center gap-1.5 mb-3">
        <CalendarDays size={15} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-xs" style={{ color: COLORS.ink }}>
          {title || "Check-in kalendari (joriy oy)"}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[9px] font-semibold" style={{ color: COLORS.sub }}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} />;
          const session = sessionsByDate[cell.dateStr];
          const isFuture = cell.dateStr > today;
          let bg = "#F3F4F6";
          let color = COLORS.sub;
          let border = "transparent";

          if (session && !isFuture) {
            const onTime = isCheckInOnTime(session.started_at);
            bg = onTime ? COLORS.successBg : COLORS.dangerBg;
            color = onTime ? COLORS.success : COLORS.danger;
            border = onTime ? COLORS.success : COLORS.danger;
          }

          return (
            <div
              key={cell.dateStr}
              className="aspect-square rounded flex items-center justify-center text-[10px] font-semibold"
              style={{ background: bg, color, border: `1px solid ${border}`, opacity: isFuture ? 0.4 : 1 }}
              title={cell.dateStr}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 mt-3 text-[9px]" style={{ color: COLORS.sub }}>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded shrink-0" style={{ background: COLORS.successBg, border: `1px solid ${COLORS.success}` }} />
          O'z vaqtida check-in
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded shrink-0" style={{ background: COLORS.dangerBg, border: `1px solid ${COLORS.danger}` }} />
          Kechikkan / kelmagan
        </span>
      </div>
    </Card>
  );
}
