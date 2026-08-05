"use client";

import { useMemo, useState } from "react";
import { Clock, Search } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { isCheckInOnTime } from "@/lib/salary";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "long" });
}

export default function CheckInOutTable({ operators, workSessions }) {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const operatorsById = Object.fromEntries(operators.map((o) => [o.id, o]));
    return workSessions
      .map((s) => {
        const op = operatorsById[s.operator_id];
        if (!op) return null;
        const onTime = isCheckInOnTime(s.started_at);
        return {
          id: s.id,
          operator: op,
          date: s.work_date,
          checkIn: s.started_at,
          checkOut: s.last_ping_at,
          onTime,
        };
      })
      .filter(Boolean)
      .filter((r) => `${r.operator.firstName} ${r.operator.lastName}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [operators, workSessions, search]);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Kelish / Ketish jadvali (joriy oy)</h3>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.sub }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Xodim qidirish..."
            className="rounded-xl border pl-9 pr-3 py-2 text-sm outline-none"
            style={{ borderColor: COLORS.border }}
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left sticky top-0 bg-white" style={{ color: COLORS.sub }}>
              <th className="py-2 px-1 font-medium">Xodim</th>
              <th className="py-2 px-1 font-medium">Sana</th>
              <th className="py-2 px-1 font-medium">Kelgan vaqti</th>
              <th className="py-2 px-1 font-medium">Ketgan vaqti</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: COLORS.border }}>
                <td className="py-2.5 px-1">
                  <div className="flex items-center gap-2">
                    <Avatar initials={r.operator.avatar} src={r.operator.avatarImage} size={24} />
                    <span className="font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{r.operator.firstName} {r.operator.lastName}</span>
                  </div>
                </td>
                <td className="py-2.5 px-1 whitespace-nowrap" style={{ color: COLORS.sub }}>{formatDate(r.date)}</td>
                <td className="py-2.5 px-1 font-semibold" style={{ color: r.onTime ? COLORS.success : COLORS.danger }}>
                  {formatTime(r.checkIn)}
                </td>
                <td className="py-2.5 px-1" style={{ color: COLORS.sub }}>{formatTime(r.checkOut)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-sm" style={{ color: COLORS.sub }}>
                  Hozircha ma'lumot yo'q.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs mt-3" style={{ color: COLORS.sub }}>
        * Kelgan vaqti — soat 10:10gacha kirsa yashil, kechiksa qizil rangda
        ko'rsatiladi. Ketgan vaqti — o'sha kundagi oxirgi qayd etilgan faollik.
      </p>
    </Card>
  );
}
