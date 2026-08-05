"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useCallLogs } from "@/hooks/useCallLogs";
import { useLeadStats } from "@/hooks/useLeadStats";
import { useMonthlyWorkSessions } from "@/hooks/useMonthlyWorkSessions";
import { useAmocrmCallLogs } from "@/hooks/useAmocrmCallLogs";
import { useDailyCriteria } from "@/hooks/useDailyCriteria";
import CallLogForm from "@/components/dashboard/CallLogForm";
import LeadStatsForm from "@/components/dashboard/LeadStatsForm";
import ReportCharts from "@/components/dashboard/ReportCharts";
import AttendanceCalendar from "@/components/dashboard/AttendanceCalendar";
import AmocrmCallSummary from "@/components/dashboard/AmocrmCallSummary";
import DemoCountForm from "@/components/dashboard/DemoCountForm";

export default function ReportPage() {
  const { user } = useAuth();
  const { invoices, operators } = useData();
  const { logs, addCallLog } = useCallLogs(user?.id);
  const { stats: leadStats, upsertForDate } = useLeadStats(user);
  const { sessions: workSessions } = useMonthlyWorkSessions(user);
  const { logs: amocrmLogs } = useAmocrmCallLogs(user);
  const { rows: dailyCriteria, setTodayDemoCount } = useDailyCriteria(user);

  if (!user) return null;

  const saveLeadStats = (date, patch) => upsertForDate(user.id, date, patch);
  const myOperator = operators.find((o) => o.id === user.id);
  const myWorkSessions = workSessions.filter((s) => s.operator_id === user.id);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <AmocrmCallSummary logs={amocrmLogs} />
          <DemoCountForm userId={user.id} dailyCriteria={dailyCriteria} onSave={setTodayDemoCount} />
          <CallLogForm onAdd={addCallLog} />
          <AttendanceCalendar operator={myOperator} workSessions={myWorkSessions} />
        </div>
        <div className="lg:col-span-2">
          <LeadStatsForm user={user} stats={leadStats} onSave={saveLeadStats} />
        </div>
      </div>
      <ReportCharts invoices={invoices} callLogs={logs} leadStats={leadStats} operatorId={user.id} />
    </div>
  );
}
