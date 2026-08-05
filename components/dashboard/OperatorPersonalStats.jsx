import { Wallet, Target, TrendingUp, CheckCircle2, Sparkles, Percent, Gift, Video, HeartHandshake } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import { computeOperatorSalary } from "@/lib/customBonus";
import { computeLiderlikMonthlySalary, COMMISSION_TIERS } from "@/lib/liderlikSalary";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import ProgressBar from "@/components/ui/ProgressBar";

export default function OperatorPersonalStats({ operator, todaySold = 0, rules = [], monthData }) {
  const pct = operator.monthlyPlan ? (operator.sold / operator.monthlyPlan) * 100 : 0;
  const dailyPlan = Math.round(operator.monthlyPlan / 26);
  const soldToday = todaySold;
  const dayPct = dailyPlan ? (soldToday / dailyPlan) * 100 : 0;
  const remainingDays = Math.max(1, 26 - new Date().getDate());
  const forecast = operator.sold + (operator.sold / new Date().getDate()) * remainingDays;
  const forecastPct = operator.monthlyPlan ? (forecast / operator.monthlyPlan) * 100 : 0;

  const salary = computeLiderlikMonthlySalary(operator, monthData);
  const extraBonuses = computeOperatorSalary(operator, rules, monthData);
  const grandTotal = salary.totalIncome + extraBonuses.bonusTotal;

  const commissionTierLabel = COMMISSION_TIERS.find((t) => t.rate === salary.commissionRate)?.label || "—";

  const stats = [
    { label: "Oylik sotuv", value: fmt(operator.sold) + " so'm", icon: Wallet, tone: COLORS.primary },
    { label: "Reja bajarilishi", value: pct.toFixed(0) + "%", icon: Target, tone: pct >= 100 ? COLORS.success : COLORS.primary },
    { label: "Ishlangan kunlar", value: `${salary.workedDays} kun`, icon: CheckCircle2, tone: COLORS.primary },
    { label: "Komissiya darajasi", value: `${(salary.commissionRate * 100).toFixed(0)}%`, icon: Percent, tone: COLORS.gold },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon size={18} style={{ color: s.tone }} className="mb-2" />
            <p className="text-xs" style={{ color: COLORS.sub }}>{s.label}</p>
            <p className="font-bold text-base sm:text-lg mt-0.5" style={{ color: COLORS.ink }}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Shaxsiy oylik reja</h3>
            <Pill tone={pct >= 100 ? "success" : "primary"}>{pct.toFixed(0)}%</Pill>
          </div>
          <ProgressBar percent={pct} />
          <div className="flex justify-between mt-2 text-xs" style={{ color: COLORS.sub }}>
            <span>{fmt(operator.sold)} so'm</span>
            <span>Reja: {fmt(operator.monthlyPlan)} so'm</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl p-3" style={{ background: "#F9FAFB" }}>
              <p className="text-xs mb-1" style={{ color: COLORS.sub }}>Bugungi natija</p>
              <p className="font-bold text-base" style={{ color: COLORS.ink }}>{fmt(soldToday)} so'm</p>
              <p className="text-[11px] mt-0.5" style={{ color: dayPct >= 100 ? COLORS.success : COLORS.sub }}>
                Kunlik reja: {fmt(dailyPlan)} ({dayPct.toFixed(0)}%)
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ background: COLORS.primaryLight }}>
              <p className="text-xs mb-1" style={{ color: COLORS.primary }}>Oy oxiri prognozi</p>
              <p className="font-bold text-base" style={{ color: COLORS.primary }}>{fmt(forecast)} so'm</p>
              <p className="text-[11px] mt-0.5" style={{ color: forecastPct >= 100 ? COLORS.success : COLORS.danger }}>
                {forecastPct.toFixed(0)}% bajarilishi kutilmoqda
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t space-y-2 text-sm" style={{ borderColor: COLORS.border }}>
            <p className="text-xs font-semibold" style={{ color: COLORS.sub }}>Qo'shimcha bonuslar</p>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5" style={{ color: COLORS.sub }}><Gift size={13} />Kunlik sotuv bonusi ({salary.bonusDaysCount} kun)</span>
              <span className="font-semibold" style={{ color: COLORS.success }}>+{fmt(salary.dailySalesBonusTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5" style={{ color: COLORS.sub }}><Video size={13} />Demo bonusi ({salary.demoTotal} ta)</span>
              <span className="font-semibold" style={{ color: COLORS.success }}>+{fmt(salary.demoBonus)}</span>
            </div>
            {salary.referralCount > 0 && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5" style={{ color: COLORS.sub }}><HeartHandshake size={13} />Konsultatsiya rag'bati ({salary.referralCount} ta)</span>
                <span className="font-semibold" style={{ color: COLORS.success }}>+{fmt(salary.referralBonus)}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5" style={{ color: COLORS.ink }}>
            <Sparkles size={15} style={{ color: COLORS.gold }} /> Umumiy daromad tarkibi
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span style={{ color: COLORS.sub }}>FIX maosh (kunlik ballar)</span>
              <span className="font-semibold" style={{ color: salary.fixTotal >= 0 ? COLORS.ink : COLORS.danger }}>{fmt(salary.fixTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.sub }}>Sotuv komissiyasi ({commissionTierLabel})</span>
              <span className="font-semibold" style={{ color: COLORS.success }}>{fmt(salary.commission)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.sub }}>Qo'shimcha bonuslar</span>
              <span className="font-semibold" style={{ color: COLORS.success }}>
                {fmt(salary.dailySalesBonusTotal + salary.demoBonus + salary.referralBonus)}
              </span>
            </div>
            {extraBonuses.appliedBonuses.length > 0 && (
              <>
                <div className="h-px my-1" style={{ background: COLORS.border }} />
                <p className="text-[11px] font-semibold" style={{ color: COLORS.sub }}>Jamoaviy / maxsus mukofotlar</p>
                {extraBonuses.appliedBonuses.map(({ rule, bonus }) => (
                  <div key={rule.id} className="flex justify-between">
                    <span className="truncate pr-2" style={{ color: COLORS.sub }}>{rule.name}</span>
                    <span className="font-semibold shrink-0" style={{ color: COLORS.success }}>+{fmt(bonus)}</span>
                  </div>
                ))}
              </>
            )}
            <div className="h-px my-1" style={{ background: COLORS.border }} />
            <div className="flex justify-between">
              <span className="font-semibold" style={{ color: COLORS.ink }}>Jami</span>
              <span className="font-extrabold text-base" style={{ color: COLORS.success }}>{fmt(grandTotal)} so'm</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
