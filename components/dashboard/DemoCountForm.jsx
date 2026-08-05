"use client";

import { useEffect, useState } from "react";
import { UserCheck, Check } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DemoCountForm({ userId, dailyCriteria, onSave }) {
  const todayRow = dailyCriteria.find((c) => c.operator_id === userId && c.work_date === todayStr());
  const [count, setCount] = useState(todayRow?.demo_count ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCount(todayRow?.demo_count ?? 0);
  }, [todayRow?.demo_count]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(userId, Number(count) || 0);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <UserCheck size={16} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Bugungi demo mijozlar</h3>
      </div>
      {saved && (
        <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold" style={{ background: COLORS.successBg, color: COLORS.success }}>
          <Check size={13} /> Saqlandi
        </div>
      )}
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none"
          style={{ borderColor: COLORS.border }}
        />
        <Button type="submit" disabled={saving}>{saving ? "..." : "Saqlash"}</Button>
      </form>
      <p className="text-[11px] mt-2" style={{ color: COLORS.sub }}>
        Har bir demo darsga kelgan mijoz uchun +10 000 so'm bonus.
      </p>
    </Card>
  );
}
