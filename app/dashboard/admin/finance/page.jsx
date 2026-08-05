"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useBonusRules } from "@/hooks/useBonusRules";
import FinancePlan from "@/components/admin/FinancePlan";
import BonusRulesManagement from "@/components/admin/BonusRulesManagement";

export default function AdminFinancePage() {
  const { user } = useAuth();
  const { operators, teamPlan } = useData();
  const { rules, addRule, updateRule, toggleRule, removeRule } = useBonusRules(user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="space-y-4">
      <FinancePlan operators={operators} teamPlan={teamPlan} />
      <BonusRulesManagement rules={rules} onAdd={addRule} onUpdate={updateRule} onToggle={toggleRule} onRemove={removeRule} />
    </div>
  );
}
