"use client";

import { useState } from "react";
import { ClipboardCheck, Check, X, Minus } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function ThreeStateButton({ value, onChange, positiveLabel, negativeLabel }) {
  return (
    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: COLORS.border }}>
      <button
        onClick={() => onChange(true)}
        className="flex-1 py-1.5 flex items-center justify-center gap-1 text-xs font-semibold"
        style={{ background: value === true ? COLORS.successBg : "white", color: value === true ? COLORS.success : COLORS.sub }}
        title={positiveLabel}
      >
        <Check size={13} /> Ha
      </button>
      <button
        onClick={() => onChange(null)}
        className="px-2 py-1.5 flex items-center justify-center"
        style={{ background: value == null ? "#F3F4F6" : "white", color: COLORS.sub }}
        title="Hali belgilanmagan"
      >
        <Minus size={13} />
      </button>
      <button
        onClick={() => onChange(false)}
        className="flex-1 py-1.5 flex items-center justify-center gap-1 text-xs font-semibold"
        style={{ background: value === false ? COLORS.dangerBg : "white", color: value === false ? COLORS.danger : COLORS.sub }}
        title={negativeLabel}
      >
        <X size={13} /> Yo'q
      </button>
    </div>
  );
}

export default function DailyEvaluationPanel({ operators, dailyCriteria, onEvaluate }) {
  const [date, setDate] = useState(todayStr());

  const rowFor = (operatorId) => dailyCriteria.find((c) => c.operator_id === operatorId && c.work_date === date);

  const update = async (operatorId, field, value) => {
    await onEvaluate(operatorId, date, { [field]: value });
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Kunlik nazorat (CRM va Trening)</h3>
        </div>
        <input
          type="date"
          value={date}
          max={todayStr()}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={{ borderColor: COLORS.border }}
        />
      </div>

      <p className="text-[11px] mb-4" style={{ color: COLORS.sub }}>
        * CRM ustuni AmoCRM'dagi vazifalar asosida avtomatik tekshiriladi (har 3 soatda),
        lekin kerak bo'lsa qo'lda ham o'zgartirishingiz mumkin. Trening — faqat qo'lda belgilanadi.
      </p>

      <div className="space-y-2">
        {operators.map((op) => {
          const row = rowFor(op.id);
          return (
            <div key={op.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-4 items-center p-3 rounded-xl border" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center gap-2">
                <Avatar initials={op.avatar} src={op.avatarImage} size={28} />
                <span className="font-semibold text-sm" style={{ color: COLORS.ink }}>{op.firstName} {op.lastName}</span>
              </div>
              <div className="w-full sm:w-44">
                <p className="text-[10px] mb-1" style={{ color: COLORS.sub }}>CRM talablari bajarildimi</p>
                <ThreeStateButton
                  value={row?.crm_ok ?? null}
                  onChange={(v) => update(op.id, "crm_ok", v)}
                  positiveLabel="Barcha talablar bajarilgan"
                  negativeLabel="Kamida bitta talab buzilgan"
                />
              </div>
              <div className="w-full sm:w-44">
                <p className="text-[10px] mb-1" style={{ color: COLORS.sub }}>Trening/roleplay bajarildimi</p>
                <ThreeStateButton
                  value={row?.training_ok ?? null}
                  onChange={(v) => update(op.id, "training_ok", v)}
                  positiveLabel="To'liq qatnashgan"
                  negativeLabel="Sababsiz qatnashmagan"
                />
              </div>
            </div>
          );
        })}
        {operators.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: COLORS.sub }}>Xodimlar topilmadi.</p>
        )}
      </div>
    </Card>
  );
}
