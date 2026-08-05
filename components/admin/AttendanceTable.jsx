"use client";

import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { isCheckInOnTime, computeLeadTotals } from "@/lib/salary";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function startOfWeekStr() {
  const now = new Date();
  const day = now.getDay(); // 0 = Yakshanba
  const diff = now.getDate() - day;
  const start = new Date(now.setDate(diff));
  return start.toISOString().slice(0, 10);
}

function monthStartStr() {
  return todayStr().slice(0, 7) + "-01";
}

const PERIODS = [
  { key: "daily", label: "Bugun" },
  { key: "weekly", label: "Bu hafta" },
  { key: "monthly", label: "Bu oy" },
];

export default function AttendanceTable({ operators, workSessions, leadStats }) {
  const [period, setPeriod] = useState("daily");

  const rangeStart = useMemo(() => {
    if (period === "daily") return todayStr();
    if (period === "weekly") return startOfWeekStr();
    return monthStartStr();
  }, [period]);

  const rows = operators.map((op) => {
    const opSessions = workSessions.filter((s) => s.operator_id === op.id && s.work_date >= rangeStart);
    const totalSeconds = opSessions.reduce((s, w) => s + (Number(w.active_seconds) || 0), 0);
    const onTimeDays = opSessions.filter((s) => isCheckInOnTime(s.started_at)).length;
    const totalDays = opSessions.length;

    const opLeadStats = leadStats.filter((l) => l.operator_id === op.id && l.stat_date >= rangeStart);
    const { conversionRate } = computeLeadTotals(opLeadStats);

    const todaySession = workSessions.find((s) => s.operator_id === op.id && s.work_date === todayStr());
    const checkedInToday = todaySession ? isCheckInOnTime(todaySession.started_at) : false;

    return { op, totalSeconds, onTimeDays, totalDays, conversionRate, checkedInToday };
  });

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Calendar size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Xodimlar davomati</h3>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: period === p.key ? COLORS.primary : "#F3F4F6", color: period === p.key ? "#fff" : COLORS.sub }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left" style={{ color: COLORS.sub }}>
              <th className="py-2 px-1 font-medium">Xodim</th>
              <th className="py-2 px-1 font-medium">Bugungi check-in (o'z vaqtida)</th>
              <th className="py-2 px-1 font-medium">Ishlagan soat</th>
              <th className="py-2 px-1 font-medium">O'z vaqtida kunlar</th>
              <th className="py-2 px-1 font-medium">Konversiya</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ op, totalSeconds, onTimeDays, totalDays, conversionRate, checkedInToday }) => (
              <tr key={op.id} className="border-t" style={{ borderColor: COLORS.border }}>
                <td className="py-2.5 px-1">
                  <div className="flex items-center gap-2">
                    <Avatar initials={op.avatar} src={op.avatarImage} size={28} />
                    <span className="font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{op.firstName} {op.lastName}</span>
                  </div>
                </td>
                <td className="py-2.5 px-1">
                  {checkedInToday ? <CheckCircle2 size={18} style={{ color: COLORS.success }} /> : <XCircle size={18} style={{ color: COLORS.danger }} />}
                </td>
                <td className="py-2.5 px-1 font-semibold" style={{ color: COLORS.ink }}>{(totalSeconds / 3600).toFixed(1)} soat</td>
                <td className="py-2.5 px-1" style={{ color: COLORS.sub }}>{onTimeDays}/{totalDays}</td>
                <td className="py-2.5 px-1">
                  <Pill tone={conversionRate > 5 ? "success" : conversionRate >= 3 ? "default" : "danger"}>{conversionRate.toFixed(1)}%</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-3" style={{ color: COLORS.sub }}>
        * Check-in vaqti — hamma uchun soat 10:10gacha bo'lishi kerak.
      </p>
    </Card>
  );
}
