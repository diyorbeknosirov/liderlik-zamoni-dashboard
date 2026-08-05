"use client";

import { useMemo, useState } from "react";
import { Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import { COMMISSION_TIERS } from "@/lib/liderlikSalary";
import { computeOperatorMonthlySalary } from "@/lib/monthlySalaryReport";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";

function todayMonthStr() {
  return new Date().toISOString().slice(0, 7);
}

function monthLabel(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" });
}

export default function SalaryReport({ operators, monthData, rules, monthStr, onMonthChange, loading }) {
  const [expandedId, setExpandedId] = useState(null);

  const rows = useMemo(() => {
    return operators
      .map((op) => ({ operator: op, salary: computeOperatorMonthlySalary(op, monthData, rules) }))
      .sort((a, b) => b.salary.total - a.salary.total);
  }, [operators, monthData, rules]);

  const grandTotal = rows.reduce((s, r) => s + r.salary.total, 0);

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wallet size={18} style={{ color: COLORS.primary }} />
            <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>
              Maosh hisoboti — {monthLabel(monthStr)}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={monthStr}
              max={todayMonthStr()}
              onChange={(e) => onMonthChange(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm outline-none"
              style={{ borderColor: COLORS.border }}
            />
            <div className="text-right">
              <p className="text-[11px]" style={{ color: COLORS.sub }}>Jamoa umumiy maosh fondi</p>
              <p className="font-bold text-base" style={{ color: COLORS.success }}>{fmt(grandTotal)} so'm</p>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-sm" style={{ color: COLORS.sub }}>Yuklanmoqda...</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.map(({ operator, salary }) => {
            const isOpen = expandedId === operator.id;
            const tierLabel = COMMISSION_TIERS.find((t) => t.rate === salary.commissionRate)?.label || "—";
            return (
              <Card key={operator.id} className="p-0 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isOpen ? null : operator.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <Avatar initials={operator.avatar} src={operator.avatarImage} size={34} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: COLORS.ink }}>{operator.firstName} {operator.lastName}</p>
                    <p className="text-xs" style={{ color: COLORS.sub }}>{operator.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-base" style={{ color: COLORS.success }}>{fmt(salary.total)} so'm</p>
                  </div>
                  {isOpen ? <ChevronUp size={18} style={{ color: COLORS.sub }} /> : <ChevronDown size={18} style={{ color: COLORS.sub }} />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: COLORS.border }}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      <div className="rounded-xl p-3" style={{ background: "#F9FAFB" }}>
                        <p className="text-[11px]" style={{ color: COLORS.sub }}>FIX maosh ({salary.workedDays} kun)</p>
                        <p className="font-bold text-sm" style={{ color: salary.fixTotal >= 0 ? COLORS.ink : COLORS.danger }}>{fmt(salary.fixTotal)}</p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: COLORS.successBg }}>
                        <p className="text-[11px]" style={{ color: COLORS.success }}>Sotuv aylanmasi</p>
                        <p className="font-bold text-sm" style={{ color: COLORS.success }}>{fmt(salary.soldForCommission)}</p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: COLORS.primaryLight }}>
                        <p className="text-[11px]" style={{ color: COLORS.primary }}>Komissiya ({tierLabel})</p>
                        <p className="font-bold text-sm" style={{ color: COLORS.primary }}>{fmt(salary.commission)}</p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: "#FFF8E1" }}>
                        <p className="text-[11px]" style={{ color: COLORS.gold }}>Kunlik sotuv bonusi ({salary.bonusDaysCount} kun)</p>
                        <p className="font-bold text-sm" style={{ color: COLORS.gold }}>{fmt(salary.dailySalesBonusTotal)}</p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: "#EEF2FF" }}>
                        <p className="text-[11px]" style={{ color: "#4F46E5" }}>Demo bonusi ({salary.demoTotal} ta)</p>
                        <p className="font-bold text-sm" style={{ color: "#4F46E5" }}>{fmt(salary.demoBonus)}</p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: "#FDF2F8" }}>
                        <p className="text-[11px]" style={{ color: "#DB2777" }}>Konsultatsiya rag'bati ({salary.referralCount} ta)</p>
                        <p className="font-bold text-sm" style={{ color: "#DB2777" }}>{fmt(salary.referralBonus)}</p>
                      </div>
                    </div>

                    {salary.appliedBonuses.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-[11px] font-semibold" style={{ color: COLORS.sub }}>Jamoaviy / maxsus mukofotlar</p>
                        {salary.appliedBonuses.map(({ rule, bonus }) => (
                          <div key={rule.id} className="flex justify-between text-xs">
                            <span style={{ color: COLORS.sub }}>{rule.name}</span>
                            <span className="font-semibold" style={{ color: COLORS.success }}>+{fmt(bonus)} so'm</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
          {rows.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-sm" style={{ color: COLORS.sub }}>Xodimlar topilmadi.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
