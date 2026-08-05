"use client";

import { useState } from "react";
import { COLORS } from "@/lib/constants";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function OperatorForm({ data, isNew, lockedTeam, showTeamLeaderToggle, onSave, onCancel }) {
  const [form, setForm] = useState(data);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(lockedTeam ? { ...form, team: lockedTeam } : form);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Ism" required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
        <Input label="Familiya" required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
      </div>

      {isNew && (
        <>
          <Input label="Email" type="email" required value={form.email || ""} onChange={(e) => update("email", e.target.value)} placeholder="ism@start.uz" />
          <Input label="Vaqtinchalik parol" type="text" required minLength={6} value={form.password || ""} onChange={(e) => update("password", e.target.value)} placeholder="Kamida 6 ta belgi" />
        </>
      )}

      {lockedTeam ? (
        <div className="rounded-xl px-3.5 py-2.5 text-sm" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
          Jamoa: <strong>{lockedTeam}</strong> (jamoa rahbari sifatida faqat shu jamoaga qo'shishingiz mumkin)
        </div>
      ) : (
        <label className="block">
          <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Jamoa</span>
          <select value={form.team} onChange={(e) => update("team", e.target.value)} className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: COLORS.border }}>
            {["Kunduzgi", "Kechki"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input label="Oylik reja (so'm)" type="number" required value={form.monthlyPlan} onChange={(e) => update("monthlyPlan", e.target.value)} />
        <Input label="Fiksa oylik (so'm)" type="number" required value={form.fixedSalary} onChange={(e) => update("fixedSalary", e.target.value)} />
      </div>

      {!isNew && (
        <Input
          label="AmoCRM foydalanuvchi ID (qo'ng'iroq vaqti uchun)"
          value={form.amocrmUserId || ""}
          onChange={(e) => update("amocrmUserId", e.target.value)}
          placeholder="masalan 1234567"
        />
      )}

      {showTeamLeaderToggle && (
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: COLORS.ink }}>
          <input type="checkbox" checked={!!form.isTeamLeader} onChange={(e) => update("isTeamLeader", e.target.checked)} className="w-4 h-4" />
          Jamoa rahbari (Team Leader) qilib tayinlash
        </label>
      )}

      {error && <p className="text-sm font-medium" style={{ color: COLORS.danger }}>{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1" disabled={saving}>Bekor qilish</Button>
      </div>
    </form>
  );
}
