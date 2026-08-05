"use client";

import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { COLORS, MONTHS_UZ } from "@/lib/constants";
import { fmt } from "@/lib/format";
import { useData } from "@/context/DataContext";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";

export default function CalendarArchive({ operators }) {
  const { invoices } = useData();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const archiveData = useMemo(() => {
    const monthStr = String(month + 1).padStart(2, "0");
    const prefix = `${year}-${monthStr}`;

    const soldByOperator = {};
    invoices
      .filter((inv) => inv.date?.startsWith(prefix) && inv.status === "Tasdiqlangan")
      .forEach((inv) => {
        soldByOperator[inv.operatorId] = (soldByOperator[inv.operatorId] || 0) + Number(inv.amount);
      });

    return operators.map((o) => ({ ...o, sold: soldByOperator[o.id] || 0 }));
  }, [year, month, operators, invoices]);

  const isCurrent = year === now.getFullYear() && month === now.getMonth();

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Kalendar va arxiv</h3>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-xl border px-3.5 py-2 text-sm outline-none" style={{ borderColor: COLORS.border }}>
          {MONTHS_UZ.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-xl border px-3.5 py-2 text-sm outline-none" style={{ borderColor: COLORS.border }}>
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        {isCurrent ? <Pill tone="primary">Joriy oy</Pill> : <Pill>Arxiv ma'lumoti</Pill>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-left" style={{ color: COLORS.sub }}>
              <th className="py-2 px-1 font-medium">Sotuvchi</th>
              <th className="py-2 px-1 font-medium">Reja</th>
              <th className="py-2 px-1 font-medium">Sotildi</th>
              <th className="py-2 px-1 font-medium">Bajarilish</th>
            </tr>
          </thead>
          <tbody>
            {archiveData.map((op) => {
              const pct = op.monthlyPlan ? (op.sold / op.monthlyPlan) * 100 : 0;
              return (
                <tr key={op.id} className="border-t" style={{ borderColor: COLORS.border }}>
                  <td className="py-2.5 px-1 font-semibold" style={{ color: COLORS.ink }}>{op.firstName} {op.lastName}</td>
                  <td className="py-2.5 px-1" style={{ color: COLORS.sub }}>{fmt(op.monthlyPlan)}</td>
                  <td className="py-2.5 px-1 font-semibold" style={{ color: COLORS.ink }}>{fmt(op.sold)}</td>
                  <td className="py-2.5 px-1"><Pill tone={pct >= 100 ? "success" : "default"}>{pct.toFixed(0)}%</Pill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-3" style={{ color: COLORS.sub }}>
        * Faqat "Tasdiqlangan" statusidagi sotuvlar hisobga olinadi. Yangi oy boshlanganda avvalgi
        oy ma'lumotlari sana bo'yicha saqlanadi — hech narsa qo'lda reset qilinmaydi.
      </p>
    </Card>
  );
}
