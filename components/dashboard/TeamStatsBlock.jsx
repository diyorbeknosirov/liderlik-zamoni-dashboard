import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import ProgressBar from "@/components/ui/ProgressBar";

export default function TeamStatsBlock({ soldMonth, planMonth, planDay, soldToday }) {
  const monthPct = (soldMonth / planMonth) * 100;
  const remainingDays = 26 - Math.min(26, Math.floor((new Date().getDate() / 30) * 26));
  const forecastAmount = soldMonth + (soldMonth / Math.max(1, new Date().getDate())) * remainingDays;
  const forecastPct = (forecastAmount / planMonth) * 100;
  const dayPct = (soldToday / planDay) * 100;

  return (
    <Card className="p-4 sm:p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Wallet size={18} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Jamoa umumiy ko'rsatkichlari</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-end justify-between mb-1">
          <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: COLORS.ink }}>
            {fmt(soldMonth)} <span className="text-sm font-medium" style={{ color: COLORS.sub }}>so'm</span>
          </span>
          <Pill tone={monthPct >= 100 ? "success" : "primary"}>{monthPct.toFixed(0)}%</Pill>
        </div>
        <p className="text-xs mb-2" style={{ color: COLORS.sub }}>Oylik reja: {fmt(planMonth)} so'm</p>
        <ProgressBar percent={monthPct} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: "#F9FAFB" }}>
          <p className="text-xs mb-1" style={{ color: COLORS.sub }}>Bugungi tushum</p>
          <p className="font-bold text-base" style={{ color: COLORS.ink }}>{fmt(soldToday)}</p>
          <p className="text-[11px] mt-0.5" style={{ color: dayPct >= 100 ? COLORS.success : COLORS.sub }}>
            Kunlik reja {fmt(planDay)} ({dayPct.toFixed(0)}%)
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: COLORS.primaryLight }}>
          <p className="text-xs mb-1" style={{ color: COLORS.primary }}>Oy oxiri prognozi</p>
          <p className="font-bold text-base" style={{ color: COLORS.primary }}>{fmt(forecastAmount)}</p>
          <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: forecastPct >= 100 ? COLORS.success : COLORS.danger }}>
            {forecastPct >= 100 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {forecastPct.toFixed(0)}% bajarilishi kutilmoqda
          </p>
        </div>
      </div>
    </Card>
  );
}
