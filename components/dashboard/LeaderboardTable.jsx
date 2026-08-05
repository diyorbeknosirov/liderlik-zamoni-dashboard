import { LayoutGrid, TrendingUp } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import { planStatusColor, planStatusBg } from "@/lib/planColor";
import { computeOperatorSalary } from "@/lib/customBonus";
import { computeLiderlikMonthlySalary } from "@/lib/liderlikSalary";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import ProgressBar from "@/components/ui/ProgressBar";

function forecastPercent(op) {
  const dayOfMonth = new Date().getDate();
  if (!op.monthlyPlan || dayOfMonth === 0) return 0;
  const projected = (op.sold / dayOfMonth) * 26; // 26 ish kuni asosida
  return (projected / op.monthlyPlan) * 100;
}

export default function LeaderboardTable({ operators, isAdmin, rules = [], monthData }) {
  const sorted = [...operators].sort((a, b) => b.sold - a.sold);
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LayoutGrid size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Leaderboard</h3>
        </div>
      </div>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left" style={{ color: COLORS.sub }}>
              <th className="py-2 px-1 font-medium">#</th>
              <th className="py-2 px-1 font-medium">Sotuvchi</th>
              <th className="py-2 px-1 font-medium">Jamoa</th>
              <th className="py-2 px-1 font-medium">Reja</th>
              <th className="py-2 px-1 font-medium">Sotildi</th>
              <th className="py-2 px-1 font-medium">Bajarilish</th>
              <th className="py-2 px-1 font-medium">Oy oxiri prognozi</th>
              {isAdmin && <th className="py-2 px-1 font-medium">Kutilayotgan maosh</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((op, i) => {
              const pct = op.monthlyPlan ? (op.sold / op.monthlyPlan) * 100 : 0;
              const forecastPct = forecastPercent(op);
              const color = planStatusColor(pct);
              const officialSalary = isAdmin && monthData ? computeLiderlikMonthlySalary(op, monthData) : null;
              const extraBonus = isAdmin && monthData ? computeOperatorSalary(op, rules, monthData) : null;
              const totalSalary = officialSalary && extraBonus ? officialSalary.totalIncome + extraBonus.bonusTotal : null;
              return (
                <tr key={op.id} className="border-t" style={{ borderColor: COLORS.border }}>
                  <td className="py-2.5 px-1 font-bold" style={{ color: i < 3 ? COLORS.gold : COLORS.sub }}>{i + 1}</td>
                  <td className="py-2.5 px-1">
                    <div className="flex items-center gap-2">
                      <Avatar initials={op.avatar} src={op.avatarImage} size={30} />
                      <span className="font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{op.firstName} {op.lastName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-1 whitespace-nowrap" style={{ color: COLORS.sub }}>{op.team}</td>
                  <td className="py-2.5 px-1 whitespace-nowrap" style={{ color: COLORS.sub }}>{fmt(op.monthlyPlan)} so'm</td>
                  <td className="py-2.5 px-1 font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{fmt(op.sold)} so'm</td>
                  <td className="py-2.5 px-1 w-40">
                    <div className="flex items-center gap-2">
                      <ProgressBar percent={pct} height={7} color={color} />
                      <span className="text-xs font-bold w-11 shrink-0 px-1.5 py-0.5 rounded-full text-center" style={{ color, background: planStatusBg(pct) }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-1">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: planStatusColor(forecastPct) }}>
                      <TrendingUp size={12} /> {forecastPct.toFixed(0)}%
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="py-2.5 px-1 font-semibold whitespace-nowrap" style={{ color: COLORS.primary }}>
                      {fmt(totalSalary ?? op.fixedSalary)} so'm
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
