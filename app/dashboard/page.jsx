"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useSalaryMonthData } from "@/hooks/useSalaryMonthData";
import { useBonusRules } from "@/hooks/useBonusRules";
import TeamStatsBlock from "@/components/dashboard/TeamStatsBlock";
import Top3Podium from "@/components/dashboard/Top3Podium";
import LeaderboardTable from "@/components/dashboard/LeaderboardTable";
import ChartsBlock from "@/components/dashboard/ChartsBlock";
import OperatorPersonalStats from "@/components/dashboard/OperatorPersonalStats";
import TeamsComparison from "@/components/dashboard/TeamsComparison";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function currentMonthStr() {
  return todayStr().slice(0, 7);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { operators, teamPlan, invoices, loading } = useData();
  const monthData = useSalaryMonthData(user, currentMonthStr());
  const { rules } = useBonusRules(user);

  if (!user) return null;

  if (loading) {
    return <p className="text-sm text-gray-400">Ma'lumotlar yuklanmoqda...</p>;
  }

  const myOperator = user.role === "operator" ? operators.find((o) => o.id === user.id) : null;
  const teamSoldMonth = operators.reduce((s, o) => s + o.sold, 0);
  const today = todayStr();
  const teamSoldToday = invoices
    .filter((inv) => inv.date === today)
    .reduce((s, inv) => s + inv.amount, 0);
  const myTodaySold = myOperator
    ? invoices.filter((inv) => inv.date === today && inv.operatorId === myOperator.id).reduce((s, inv) => s + inv.amount, 0)
    : 0;

  return (
    <div className="space-y-4">
      {user.role === "operator" && myOperator && (
        <OperatorPersonalStats
          operator={myOperator}
          todaySold={myTodaySold}
          rules={rules}
          monthData={monthData}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TeamStatsBlock soldMonth={teamSoldMonth} planMonth={teamPlan || 1} planDay={Math.round((teamPlan || 1) / 26)} soldToday={teamSoldToday} />
        <Top3Podium operators={operators} />
      </div>

      <TeamsComparison operators={operators} invoices={invoices} />

      <LeaderboardTable
        operators={operators}
        isAdmin={user.role === "admin"}
        rules={rules}
        monthData={monthData}
      />
      <ChartsBlock operators={operators} />
    </div>
  );
}
