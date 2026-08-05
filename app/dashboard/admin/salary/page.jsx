"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useSalaryMonthData } from "@/hooks/useSalaryMonthData";
import { useBonusRules } from "@/hooks/useBonusRules";
import SalaryReport from "@/components/admin/SalaryReport";

function todayMonthStr() {
  return new Date().toISOString().slice(0, 7);
}

export default function AdminSalaryPage() {
  const { user } = useAuth();
  const { operators } = useData();
  const [monthStr, setMonthStr] = useState(todayMonthStr());
  const monthData = useSalaryMonthData(user, monthStr);
  const { rules } = useBonusRules(user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <SalaryReport
      operators={operators}
      monthData={monthData}
      rules={rules}
      monthStr={monthStr}
      onMonthChange={setMonthStr}
      loading={monthData.loading}
    />
  );
}
