"use client";

import { useMemo, useState } from "react";
import { BarChart3, Calendar } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";

const STAGE_FIELDS = [
  { key: "yangi_lid", label: "Yangi lid" },
  { key: "qayta_aloqa", label: "Qayta aloqa" },
  { key: "aloqa_ornatildi", label: "Aloqa" },
  { key: "malumot_berildi", label: "Ma'lumot" },
  { key: "demoga_yozildi", label: "Demoga yozildi" },
  { key: "demoga_keladi", label: "Demoga keladi" },
  { key: "shartnoma", label: "Shartnoma" },
  { key: "won", label: "Won" },
];

const REJECTION_FIELDS = [
  { key: "lost_sabab_nomalum", label: "Sabab noma'lum" },
  { key: "lost_qimmat", label: "Qimmat" },
  { key: "lost_nedozvon", label: "Nedozvon" },
  { key: "lost_kerak_emas", label: "Kerak emas" },
  { key: "lost_dubl", label: "Dubl" },
  { key: "lost_adashib_otgan", label: "Adashib o'tgan" },
  { key: "lost_kontaktda_xatolik", label: "Kontaktda xato" },
  { key: "lost_hozir_emas", label: "Hozir emas" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function monthStartStr() {
  return todayStr().slice(0, 7) + "-01";
}

const PERIODS = [
  { key: "daily", label: "Kunlik" },
  { key: "monthly", label: "Oylik (jami)" },
];

export default function AnalyticsTable({ operators, leadStats }) {
  const [period, setPeriod] = useState("daily");
  const [date, setDate] = useState(todayStr());

  const rows = useMemo(() => {
    return operators.map((op) => {
      const opStats = leadStats.filter((l) => {
        if (l.operator_id !== op.id) return false;
        if (period === "daily") return l.stat_date === date;
        return true; // monthly — leadStats allaqachon joriy oy bilan cheklangan
      });
      const sums = {};
      [...STAGE_FIELDS, ...REJECTION_FIELDS].forEach((f) => {
        sums[f.key] = opStats.reduce((s, r) => s + (r[f.key] || 0), 0);
      });
      const totalRejections = REJECTION_FIELDS.reduce((s, f) => s + sums[f.key], 0);
      const totalLeads = STAGE_FIELDS.reduce((s, f) => s + sums[f.key], 0) + totalRejections;
      const conversion = totalLeads ? (sums.won / totalLeads) * 100 : 0;
      return { op, sums, totalLeads, totalRejections, conversion };
    });
  }, [operators, leadStats, period, date]);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Analitika (CRM voronkasi)</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
          {period === "daily" && (
            <div className="flex items-center gap-1.5">
              <Calendar size={15} style={{ color: COLORS.sub }} />
              <input
                type="date"
                value={date}
                min={monthStartStr()}
                max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border px-2.5 py-1.5 text-sm outline-none"
                style={{ borderColor: COLORS.border }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1250px]">
          <thead>
            <tr className="text-left" style={{ color: COLORS.sub }}>
              <th className="py-2 px-1 font-medium sticky left-0 bg-white">Xodim</th>
              {STAGE_FIELDS.map((f) => <th key={f.key} className="py-2 px-1 font-medium whitespace-nowrap">{f.label}</th>)}
              <th className="py-2 px-1 font-medium whitespace-nowrap">Umumiy lid</th>
              {REJECTION_FIELDS.map((f) => <th key={f.key} className="py-2 px-1 font-medium whitespace-nowrap">{f.label}</th>)}
              <th className="py-2 px-1 font-medium whitespace-nowrap">Umumiy Lost</th>
              <th className="py-2 px-1 font-medium whitespace-nowrap">Konversiya</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ op, sums, totalLeads, totalRejections, conversion }) => (
              <tr key={op.id} className="border-t" style={{ borderColor: COLORS.border }}>
                <td className="py-2.5 px-1 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <Avatar initials={op.avatar} src={op.avatarImage} size={26} />
                    <span className="font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{op.firstName} {op.lastName}</span>
                  </div>
                </td>
                {STAGE_FIELDS.map((f) => (
                  <td key={f.key} className="py-2.5 px-1 text-center" style={{ color: COLORS.sub }}>{sums[f.key]}</td>
                ))}
                <td className="py-2.5 px-1 text-center font-bold" style={{ color: COLORS.primary }}>{totalLeads}</td>
                {REJECTION_FIELDS.map((f) => (
                  <td key={f.key} className="py-2.5 px-1 text-center" style={{ color: COLORS.sub }}>{sums[f.key]}</td>
                ))}
                <td className="py-2.5 px-1 text-center font-bold" style={{ color: COLORS.danger }}>{totalRejections}</td>
                <td className="py-2.5 px-1 text-center">
                  <Pill tone={conversion > 5 ? "success" : conversion >= 3 ? "default" : "danger"}>{conversion.toFixed(1)}%</Pill>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={20} className="py-8 text-center text-sm" style={{ color: COLORS.sub }}>Ma'lumot topilmadi.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-3" style={{ color: COLORS.sub }}>
        * "Umumiy lid" va "Umumiy Lost" ustunlari qo'lda tahrirlanmaydi — ular yuqoridagi
        bosqich/sabab ustunlarining avtomatik yig'indisi. "Kunlik" rejimda tanlangan
        sananing aynan o'sha kunlik yozuvi ko'rsatiladi.
      </p>
    </Card>
  );
}
