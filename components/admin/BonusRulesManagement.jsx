"use client";

import { useState } from "react";
import { Settings2, Plus, Edit2, Trash2, Power } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import { METRICS, COMPARISONS, metricLabel } from "@/lib/customBonus";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Pill from "@/components/ui/Pill";

function emptyForm() {
  return { name: "", metric: METRICS[0].value, comparison: ">=", thresholdMin: "", thresholdMax: "", amountType: "fixed", amount: "" };
}

function RuleForm({ data, onSave, onCancel }) {
  const [form, setForm] = useState(data || emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.thresholdMin === "" || form.amount === "") {
      setError("Barcha maydonlarni to'ldiring.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <Input label="Bonus nomi" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="masalan: 10 ta mijoz olib kelish bonusi" />

      <label className="block">
        <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Qaysi ko'rsatkich bo'yicha</span>
        <select value={form.metric} onChange={(e) => update("metric", e.target.value)} className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: COLORS.border }}>
          {METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Shart</span>
        <select value={form.comparison} onChange={(e) => update("comparison", e.target.value)} className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: COLORS.border }}>
          {COMPARISONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Input label={form.comparison === "between" ? "Boshlanishi" : "Chegara qiymati"} type="number" required value={form.thresholdMin} onChange={(e) => update("thresholdMin", e.target.value)} />
        {form.comparison === "between" && (
          <Input label="Tugashi" type="number" required value={form.thresholdMax} onChange={(e) => update("thresholdMax", e.target.value)} />
        )}
      </div>

      <label className="block">
        <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Bonus turi</span>
        <select value={form.amountType} onChange={(e) => update("amountType", e.target.value)} className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: COLORS.border }}>
          <option value="fixed">Belgilangan summa (so'm)</option>
          <option value="percentage">Foiz (ko'rsatkich qiymatidan %)</option>
        </select>
      </label>

      <Input
        label={form.amountType === "percentage" ? "Foiz (masalan 7)" : "Summa (so'm)"}
        type="number"
        required
        value={form.amount}
        onChange={(e) => update("amount", e.target.value)}
      />

      {error && <p className="text-sm font-medium" style={{ color: COLORS.danger }}>{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1" disabled={saving}>Bekor qilish</Button>
      </div>
    </form>
  );
}

function describeRule(rule) {
  const comp = { ">=": "≥", "<=": "≤", "between": "oralig'ida" }[rule.comparison];
  const range = rule.comparison === "between"
    ? `${rule.threshold_min} — ${rule.threshold_max}`
    : `${comp} ${rule.threshold_min}`;
  const amountStr = rule.amount_type === "percentage" ? `${rule.amount}%` : `${fmt(rule.amount)} so'm`;
  return `${metricLabel(rule.metric)} ${range} bo'lsa → ${amountStr}`;
}

export default function BonusRulesManagement({ rules, onAdd, onUpdate, onToggle, onRemove }) {
  const [modal, setModal] = useState(null);

  const save = async (data) => {
    if (modal.mode === "add") {
      await onAdd(data);
    } else {
      await onUpdate(modal.data.id, data);
    }
    setModal(null);
  };

  const remove = async (id) => {
    if (!confirm("Ushbu bonus qoidasini o'chirmoqchimisiz?")) return;
    await onRemove(id);
  };

  const toRuleFormData = (rule) => ({
    id: rule.id,
    name: rule.name,
    metric: rule.metric,
    comparison: rule.comparison,
    thresholdMin: rule.threshold_min,
    thresholdMax: rule.threshold_max ?? "",
    amountType: rule.amount_type,
    amount: rule.amount,
  });

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings2 size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Bonus qoidalari</h3>
        </div>
        <Button onClick={() => setModal({ mode: "add", data: emptyForm() })}>
          <Plus size={16} /> Yangi qoida
        </Button>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl border" style={{ borderColor: COLORS.border, opacity: rule.active ? 1 : 0.5 }}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm" style={{ color: COLORS.ink }}>{rule.name}</p>
                {!rule.active && <Pill tone="default">O'chirilgan</Pill>}
              </div>
              <p className="text-xs mt-0.5" style={{ color: COLORS.sub }}>{describeRule(rule)}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => onToggle(rule.id, !rule.active)} className="p-1.5 rounded-lg hover:bg-gray-100" title={rule.active ? "O'chirish" : "Yoqish"}>
                <Power size={14} style={{ color: rule.active ? COLORS.success : COLORS.sub }} />
              </button>
              <button onClick={() => setModal({ mode: "edit", data: toRuleFormData(rule) })} className="p-1.5 rounded-lg hover:bg-gray-100">
                <Edit2 size={14} style={{ color: COLORS.sub }} />
              </button>
              <button onClick={() => remove(rule.id)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <Trash2 size={14} style={{ color: COLORS.danger }} />
              </button>
            </div>
          </div>
        ))}
        {rules.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: COLORS.sub }}>
            Hozircha bonus qoidasi yo'q. "Yangi qoida" tugmasi orqali birinchisini yarating.
          </p>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "add" ? "Yangi bonus qoidasi" : "Bonus qoidasini tahrirlash"}>
        {modal && <RuleForm data={modal.data} onSave={save} onCancel={() => setModal(null)} />}
      </Modal>
    </Card>
  );
}
