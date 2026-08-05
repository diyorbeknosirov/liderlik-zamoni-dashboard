"use client";

import { useMemo } from "react";
import { Users, TrendingUp, TrendingDown, Crown } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import Card from "@/components/ui/Card";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeamsComparison({ operators, invoices }) {
  const teams = useMemo(() => {
    const today = todayStr();
    const monthPrefix = today.slice(0, 7);
    const teamNames = Array.from(new Set(operators.map((o) => o.team).filter(Boolean)));

    return teamNames.map((teamName) => {
      const teamOps = operators.filter((o) => o.team === teamName);
      const teamOpIds = new Set(teamOps.map((o) => o.id));

      const monthSales = invoices
        .filter((inv) => teamOpIds.has(inv.operatorId) && inv.date?.startsWith(monthPrefix))
        .reduce((s, inv) => s + Number(inv.amount), 0);

      const todaySales = invoices
        .filter((inv) => teamOpIds.has(inv.operatorId) && inv.date === today)
        .reduce((s, inv) => s + Number(inv.amount), 0);

      return { name: teamName, memberCount: teamOps.length, todaySales, monthSales };
    }).sort((a, b) => b.monthSales - a.monthSales);
  }, [operators, invoices]);

  if (teams.length === 0) return null;

  const leadingTeam = teams[0]?.name;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Jamoalar taqqoslash</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {teams.map((team) => {
          const isLeading = team.name === leadingTeam && teams.length > 1;
          const color = teams.length > 1 ? (isLeading ? COLORS.success : COLORS.danger) : COLORS.primary;
          const bg = teams.length > 1 ? (isLeading ? COLORS.successBg : COLORS.dangerBg) : COLORS.primaryLight;

          return (
            <div key={team.name} className="rounded-2xl border-2 p-4" style={{ borderColor: color, background: bg }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: COLORS.primary }}>
                  <Crown size={16} style={{ color: COLORS.gold }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: COLORS.ink }}>{team.name}</p>
                  <p className="text-xs" style={{ color: COLORS.sub }}>{team.memberCount} ta xodim</p>
                </div>
                {teams.length > 1 && (
                  isLeading
                    ? <TrendingUp size={18} style={{ color, marginLeft: "auto" }} />
                    : <TrendingDown size={18} style={{ color, marginLeft: "auto" }} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px]" style={{ color: COLORS.sub }}>Bugungi sotuv</p>
                  <p className="font-bold text-sm" style={{ color }}>{fmt(team.todaySales)} so'm</p>
                </div>
                <div>
                  <p className="text-[11px]" style={{ color: COLORS.sub }}>Oylik sotuv</p>
                  <p className="font-bold text-sm" style={{ color }}>{fmt(team.monthSales)} so'm</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
