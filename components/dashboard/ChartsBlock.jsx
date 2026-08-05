"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import { COLORS } from "@/lib/constants";
import { fmt, fmtCompact } from "@/lib/format";
import { useData } from "@/context/DataContext";
import Card from "@/components/ui/Card";

function buildTrendFromInvoices(invoices, days = 14) {
  const byDate = {};
  invoices.forEach((inv) => {
    byDate[inv.date] = (byDate[inv.date] || 0) + Number(inv.amount);
  });

  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: `${d.getDate()}/${d.getMonth() + 1}`, amount: byDate[key] || 0 });
  }
  return out;
}

export default function ChartsBlock({ operators }) {
  const { invoices } = useData();
  const barData = operators.map((o) => ({ name: o.firstName, Reja: o.monthlyPlan, Sotildi: o.sold }));
  const trendData = useMemo(() => buildTrendFromInvoices(invoices, 14), [invoices]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Reja vs Amaldagi (sotuvchilar bo'yicha)</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.sub }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 11, fill: COLORS.sub }} axisLine={false} tickLine={false} width={50} />
            <Tooltip formatter={(v) => fmt(v) + " so'm"} contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.border}` }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Reja" fill="#D1D5DB" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Sotildi" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} style={{ color: COLORS.success }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Jamoa tushumi dinamikasi (14 kun)</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.25} />
                <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: COLORS.sub }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 11, fill: COLORS.sub }} axisLine={false} tickLine={false} width={50} />
            <Tooltip formatter={(v) => fmt(v) + " so'm"} contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.border}` }} />
            <Area type="monotone" dataKey="amount" name="Tushum" stroke={COLORS.primary} fill="url(#trendFill)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
