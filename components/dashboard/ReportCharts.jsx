"use client";

import { useMemo } from "react";
import { BarChart3, Phone, Users, TrendingUp, Clock, XCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "@/lib/constants";
import { fmt, fmtCompact } from "@/lib/format";
import { computeLeadTotals } from "@/lib/salary";
import Card from "@/components/ui/Card";

function daysInCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export default function ReportCharts({ invoices, callLogs, leadStats, operatorId }) {
  const now = new Date();
  const monthPrefix = now.toISOString().slice(0, 7);
  const totalDays = daysInCurrentMonth();

  const myInvoices = useMemo(
    () => invoices.filter((inv) => inv.operatorId === operatorId && inv.date?.startsWith(monthPrefix)),
    [invoices, operatorId, monthPrefix]
  );
  const myCallLogs = useMemo(
    () => callLogs.filter((c) => c.call_date?.startsWith(monthPrefix)),
    [callLogs, monthPrefix]
  );
  const myLeadStats = useMemo(
    () => leadStats.filter((s) => s.operator_id === operatorId),
    [leadStats, operatorId]
  );

  const salesByDay = useMemo(() => {
    const map = {};
    myInvoices.forEach((inv) => {
      const day = Number(inv.date.slice(8, 10));
      map[day] = (map[day] || 0) + Number(inv.amount);
    });
    return Array.from({ length: totalDays }, (_, i) => ({ day: String(i + 1), amount: map[i + 1] || 0 }));
  }, [myInvoices, totalDays]);

  const minutesByDay = useMemo(() => {
    const map = {};
    myCallLogs.forEach((c) => {
      const day = Number(c.call_date.slice(8, 10));
      map[day] = (map[day] || 0) + Number(c.duration_minutes);
    });
    return Array.from({ length: totalDays }, (_, i) => ({ day: String(i + 1), minutes: map[i + 1] || 0 }));
  }, [myCallLogs, totalDays]);

  const conversionByDay = useMemo(() => {
    const map = {};
    myLeadStats.forEach((s) => {
      const day = Number(s.stat_date.slice(8, 10));
      const lost = (s.lost_sabab_nomalum || 0) + (s.lost_qimmat || 0) + (s.lost_nedozvon || 0) + (s.lost_kerak_emas || 0)
        + (s.lost_dubl || 0) + (s.lost_adashib_otgan || 0) + (s.lost_kontaktda_xatolik || 0) + (s.lost_hozir_emas || 0);
      const leads = (s.yangi_lid || 0) + (s.qayta_aloqa || 0) + (s.aloqa_ornatildi || 0) + (s.malumot_berildi || 0)
        + (s.demoga_yozildi || 0) + (s.demoga_keladi || 0) + (s.shartnoma || 0) + (s.won || 0) + lost;
      map[day] = { leads, sales: s.won || 0 };
    });
    return Array.from({ length: totalDays }, (_, i) => {
      const d = map[i + 1];
      const pct = d && d.leads ? (d.sales / d.leads) * 100 : 0;
      return { day: String(i + 1), conversion: Number(pct.toFixed(1)) };
    });
  }, [myLeadStats, totalDays]);

  const totalMinutes = myCallLogs.reduce((s, c) => s + Number(c.duration_minutes), 0);
  const avgCallDuration = myCallLogs.length ? totalMinutes / myCallLogs.length : 0;
  const daysActive = new Set(myCallLogs.map((c) => c.call_date)).size || 1;
  const avgMinutesPerDay = totalMinutes / daysActive;

  const { totalLeads, totalSales, totalRejections, conversionRate } = computeLeadTotals(myLeadStats);

  const statCards = [
    { label: "Jami suhbat vaqti", value: `${Math.round(totalMinutes)} daqiqa`, icon: Clock, tone: COLORS.primary },
    { label: "O'rtacha suhbat", value: `${avgCallDuration.toFixed(1)} daqiqa`, icon: Phone, tone: COLORS.sub },
    { label: "Umumiy lid", value: `${totalLeads} ta`, icon: Users, tone: COLORS.gold },
    { label: "Umumiy Lost", value: `${totalRejections} ta`, icon: XCircle, tone: COLORS.danger },
    { label: "Konversiya (lid → won)", value: `${conversionRate.toFixed(1)}%`, icon: TrendingUp, tone: conversionRate > 5 ? COLORS.success : conversionRate >= 3 ? "#F5B301" : COLORS.danger },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon size={18} style={{ color: s.tone }} className="mb-2" />
            <p className="text-xs" style={{ color: COLORS.sub }}>{s.label}</p>
            <p className="font-bold text-base sm:text-lg mt-0.5" style={{ color: COLORS.ink }}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Kunlik sotuvlar (joriy oy)</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={salesByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: COLORS.sub }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 11, fill: COLORS.sub }} axisLine={false} tickLine={false} width={50} />
            <Tooltip formatter={(v) => fmt(v) + " so'm"} labelFormatter={(l) => `${l}-kun`} contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.border}` }} />
            <Bar dataKey="amount" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} style={{ color: COLORS.success }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Kunlik konversiya (joriy oy)</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={conversionByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: COLORS.sub }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={{ fontSize: 11, fill: COLORS.sub }} axisLine={false} tickLine={false} width={40} unit="%" />
            <Tooltip formatter={(v) => v + "%"} labelFormatter={(l) => `${l}-kun`} contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.border}` }} />
            <Line type="monotone" dataKey="conversion" stroke={COLORS.success} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Phone size={18} style={{ color: COLORS.success }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Kunlik suhbat daqiqalari (joriy oy)</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={minutesByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: COLORS.sub }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={{ fontSize: 11, fill: COLORS.sub }} axisLine={false} tickLine={false} width={40} />
            <Tooltip formatter={(v) => v + " daqiqa"} labelFormatter={(l) => `${l}-kun`} contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.border}` }} />
            <Bar dataKey="minutes" fill={COLORS.success} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs mt-3" style={{ color: COLORS.sub }}>
          Faol kunlarda o'rtacha: {avgMinutesPerDay.toFixed(0)} daqiqa/kun
        </p>
      </Card>
    </div>
  );
}
