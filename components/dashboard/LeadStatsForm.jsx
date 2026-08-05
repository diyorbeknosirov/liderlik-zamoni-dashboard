"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Check, Calendar } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const STAGE_FIELDS = [
  { key: "yangi_lid", label: "Yangi lid" },
  { key: "qayta_aloqa", label: "Qayta aloqa" },
  { key: "aloqa_ornatildi", label: "Aloqa o'rnatildi" },
  { key: "malumot_berildi", label: "Ma'lumot berildi" },
  { key: "demoga_yozildi", label: "Demoga yozildi" },
  { key: "demoga_keladi", label: "Demoga keladi" },
  { key: "shartnoma", label: "Shartnoma" },
  { key: "won", label: "Won (yutildi)" },
];

const REJECTION_FIELDS = [
  { key: "lost_sabab_nomalum", label: "Sabab noma'lum" },
  { key: "lost_qimmat", label: "Qimmat" },
  { key: "lost_nedozvon", label: "Nedozvon" },
  { key: "lost_kerak_emas", label: "Kerak emas" },
  { key: "lost_dubl", label: "Dubl" },
  { key: "lost_adashib_otgan", label: "Adashib o'tgan" },
  { key: "lost_kontaktda_xatolik", label: "Kontaktda xatolik" },
  { key: "lost_hozir_emas", label: "Hozir emas" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function monthStartStr() {
  return todayStr().slice(0, 7) + "-01";
}

function emptyForm() {
  const base = {};
  [...STAGE_FIELDS, ...REJECTION_FIELDS].forEach((f) => { base[f.key] = 0; });
  return base;
}

export default function LeadStatsForm({ user, stats, onSave }) {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const row = stats.find((s) => s.operator_id === user.id && s.stat_date === selectedDate);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const next = emptyForm();
    if (row) {
      Object.keys(next).forEach((k) => { next[k] = row[k] ?? 0; });
    }
    setForm(next);
  }, [selectedDate, row?.id]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: Math.max(0, Number(v) || 0) }));

  const totalRejections = REJECTION_FIELDS.reduce((s, f) => s + (form[f.key] || 0), 0);
  const totalLeads = STAGE_FIELDS.reduce((s, f) => s + (form[f.key] || 0), 0) + totalRejections;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(selectedDate, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Lead stats save error:", err);
      setError(err.message || "Saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Lid statistikasi</h3>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={15} style={{ color: COLORS.sub }} />
          <input
            type="date"
            value={selectedDate}
            min={monthStartStr()}
            max={todayStr()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border px-2.5 py-1.5 text-sm outline-none"
            style={{ borderColor: COLORS.border }}
          />
        </div>
      </div>

      {saved && (
        <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold" style={{ background: COLORS.successBg, color: COLORS.success }}>
          <Check size={14} /> Saqlandi
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-xl px-3 py-2 text-sm font-semibold" style={{ background: COLORS.dangerBg, color: COLORS.danger }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: COLORS.sub }}>Lid bosqichlari</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STAGE_FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="block text-xs mb-1" style={{ color: COLORS.sub }}>{f.label}</span>
                <input
                  type="number"
                  min="0"
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none"
                  style={{ borderColor: COLORS.border }}
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: COLORS.danger }}>Lost sabablari</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {REJECTION_FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="block text-xs mb-1" style={{ color: COLORS.sub }}>{f.label}</span>
                <input
                  type="number"
                  min="0"
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none"
                  style={{ borderColor: COLORS.border }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: COLORS.primaryLight }}>
            <p className="text-xs" style={{ color: COLORS.primary }}>Umumiy lid (avtomatik)</p>
            <p className="font-bold text-lg" style={{ color: COLORS.primary }}>{totalLeads}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: COLORS.dangerBg }}>
            <p className="text-xs" style={{ color: COLORS.danger }}>Umumiy Lost (avtomatik)</p>
            <p className="font-bold text-lg" style={{ color: COLORS.danger }}>{totalRejections}</p>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saqlanmoqda..." : `${selectedDate === todayStr() ? "Bugungi" : selectedDate} kunni saqlash`}
        </Button>
      </form>
    </Card>
  );
}
