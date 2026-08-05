"use client";

import { useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { useData } from "@/context/DataContext";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

export default function FinancePlan({ operators, teamPlan }) {
  const { updateTeamPlan, updateOperator } = useData();
  const [localTeamPlan, setLocalTeamPlan] = useState(teamPlan);
  const [savingTeam, setSavingTeam] = useState(false);
  const [opPlans, setOpPlans] = useState({});

  const saveTeamPlan = async () => {
    setSavingTeam(true);
    try {
      await updateTeamPlan(Number(localTeamPlan));
    } finally {
      setSavingTeam(false);
    }
  };

  const savingOpPlan = async (op) => {
    const val = opPlans[op.id] ?? op.monthlyPlan;
    await updateOperator(op.id, { monthlyPlan: Number(val) });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <CircleDollarSign size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Umumiy jamoa rejasi</h3>
        </div>
        <div className="max-w-sm flex items-end gap-2">
          <div className="flex-1">
            <Input label="Oylik umumiy reja (so'm)" type="number" value={localTeamPlan} onChange={(e) => setLocalTeamPlan(e.target.value)} />
          </div>
          <Button onClick={saveTeamPlan} disabled={savingTeam}>{savingTeam ? "..." : "Saqlash"}</Button>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="font-bold text-sm mb-4" style={{ color: COLORS.ink }}>Har bir sotuvchi uchun reja</h3>
        <div className="space-y-3">
          {operators.map((op) => (
            <div key={op.id} className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 w-44 shrink-0">
                <Avatar initials={op.avatar} src={op.avatarImage} size={30} />
                <span className="text-sm font-semibold" style={{ color: COLORS.ink }}>{op.firstName} {op.lastName}</span>
              </div>
              <input
                type="number"
                defaultValue={op.monthlyPlan}
                onChange={(e) => setOpPlans((prev) => ({ ...prev, [op.id]: e.target.value }))}
                className="flex-1 rounded-xl border px-3.5 py-2 text-sm outline-none min-w-[160px]"
                style={{ borderColor: COLORS.border }}
              />
              <button
                onClick={() => savingOpPlan(op)}
                className="text-xs font-semibold px-3 py-2 rounded-lg"
                style={{ background: COLORS.primaryLight, color: COLORS.primary }}
              >
                Saqlash
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
