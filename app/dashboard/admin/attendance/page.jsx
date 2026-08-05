"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserSearch } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useMonthlyWorkSessions } from "@/hooks/useMonthlyWorkSessions";
import { useLeadStats } from "@/hooks/useLeadStats";
import { useDailyCriteria } from "@/hooks/useDailyCriteria";
import AttendanceTable from "@/components/admin/AttendanceTable";
import CheckInOutTable from "@/components/admin/CheckInOutTable";
import DailyEvaluationPanel from "@/components/admin/DailyEvaluationPanel";
import AttendanceCalendar from "@/components/dashboard/AttendanceCalendar";
import Card from "@/components/ui/Card";

export default function AdminAttendancePage() {
  const { user } = useAuth();
  const { operators } = useData();
  const { sessions: workSessions } = useMonthlyWorkSessions(user);
  const { stats: leadStats } = useLeadStats(user);
  const { rows: dailyCriteria, setDailyEvaluation } = useDailyCriteria(user);
  const router = useRouter();
  const [selectedOperatorId, setSelectedOperatorId] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    if (!selectedOperatorId && operators.length > 0) {
      setSelectedOperatorId(operators[0].id);
    }
  }, [operators, selectedOperatorId]);

  if (!user || user.role !== "admin") return null;

  const selectedOperator = operators.find((o) => o.id === selectedOperatorId);
  const selectedSessions = workSessions.filter((s) => s.operator_id === selectedOperatorId);

  return (
    <div className="space-y-4">
      <AttendanceTable operators={operators} workSessions={workSessions} leadStats={leadStats} />

      <DailyEvaluationPanel operators={operators} dailyCriteria={dailyCriteria} onEvaluate={setDailyEvaluation} />

      <CheckInOutTable operators={operators} workSessions={workSessions} />

      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserSearch size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Xodim bo'yicha kalendar</h3>
        </div>
        <select
          value={selectedOperatorId}
          onChange={(e) => setSelectedOperatorId(e.target.value)}
          className="w-full sm:w-72 rounded-xl border px-3.5 py-2.5 text-sm outline-none mb-4"
          style={{ borderColor: COLORS.border }}
        >
          {operators.map((op) => (
            <option key={op.id} value={op.id}>{op.firstName} {op.lastName} ({op.team})</option>
          ))}
        </select>

        {selectedOperator && (
          <AttendanceCalendar
            operator={selectedOperator}
            workSessions={selectedSessions}
            title={`${selectedOperator.firstName} ${selectedOperator.lastName} — check-in kalendari`}
          />
        )}
      </Card>
    </div>
  );
}
