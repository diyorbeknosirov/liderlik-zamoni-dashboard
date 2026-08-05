"use client";

import { useState } from "react";
import { Phone, Plus, Check } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CallLogForm({ onAdd }) {
  const [duration, setDuration] = useState("");
  const [isLead, setIsLead] = useState(false);
  const [resultedInSale, setResultedInSale] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const mins = Number(duration);
    if (!mins || mins <= 0) {
      setError("Suhbat davomiyligini (daqiqada) kiriting.");
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({ durationMinutes: mins, isLead, resultedInSale, note });
      setDuration("");
      setIsLead(false);
      setResultedInSale(false);
      setNote("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Phone size={18} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Qo'ng'iroqni qayd etish</h3>
      </div>

      {saved && (
        <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold" style={{ background: COLORS.successBg, color: COLORS.success }}>
          <Check size={14} /> Saqlandi
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <Input
          label="Suhbat davomiyligi (daqiqa)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="masalan 7"
        />

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: COLORS.ink }}>
            <input type="checkbox" checked={isLead} onChange={(e) => setIsLead(e.target.checked)} className="w-4 h-4" />
            Lid oldim
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: COLORS.ink }}>
            <input type="checkbox" checked={resultedInSale} onChange={(e) => setResultedInSale(e.target.checked)} className="w-4 h-4" />
            Sotuvga aylandi
          </label>
        </div>

        <Input label="Izoh (ixtiyoriy)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="masalan mijoz ismi" />

        {error && <p className="text-xs font-medium" style={{ color: COLORS.danger }}>{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          <Plus size={15} /> {submitting ? "Saqlanmoqda..." : "Qo'shish"}
        </Button>
      </form>
    </Card>
  );
}
