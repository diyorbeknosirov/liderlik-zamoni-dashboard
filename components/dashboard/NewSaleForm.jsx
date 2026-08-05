"use client";

import { useRef, useState } from "react";
import { ClipboardList, Check, User as UserIcon, Phone, ChevronDown, CircleDollarSign, Upload, Plus, Loader2, Calendar } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";
import { useData } from "@/context/DataContext";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const CUSTOM_VALUE = "__custom__";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewSaleForm({ operatorId, operators, isAdmin }) {
  const { tariffs, addInvoice } = useData();
  const [selectedOperatorId, setSelectedOperatorId] = useState(operatorId);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", tariffId: tariffs[0]?.id || "", amount: "", saleDate: todayStr() });
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isCustom = form.tariffId === CUSTOM_VALUE;
  const selectedTariff = tariffs.find((t) => t.id === form.tariffId);
  const finalOperatorId = isAdmin ? selectedOperatorId : operatorId;

  const uploadReceipt = async () => {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const path = `${finalOperatorId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("receipts").upload(path, file);
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("receipts").getPublicUrl(path);
    return data.publicUrl;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (isAdmin && !finalOperatorId) {
      setError("Sotuvchini tanlang.");
      return;
    }

    const finalAmount = Number(form.amount) || Number(selectedTariff?.price) || 0;
    if (isCustom && finalAmount <= 0) {
      setError("Ixtiyoriy summa uchun summani kiriting.");
      return;
    }

    setSubmitting(true);
    try {
      const receiptUrl = await uploadReceipt();
      await addInvoice({
        operatorId: finalOperatorId,
        clientName: `${form.firstName} ${form.lastName}`,
        phone: form.phone,
        tariffId: isCustom ? null : form.tariffId,
        tariffLabel: isCustom ? "Boshqa (ixtiyoriy)" : undefined,
        amount: finalAmount,
        saleDate: form.saleDate,
        receiptUrl,
      });
      setSubmitted(true);
      setForm({ firstName: "", lastName: "", phone: "", tariffId: tariffs[0]?.id || "", amount: "", saleDate: todayStr() });
      setFile(null);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5 sm:p-7 max-w-2xl">
      <div className="flex items-center gap-2 mb-5">
        <ClipboardList size={18} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-base" style={{ color: COLORS.ink }}>Yangi sotuv kiritish</h3>
      </div>

      {submitted && (
        <div className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: COLORS.successBg, color: COLORS.success }}>
          <Check size={16} /> Sotuv muvaffaqiyatli qo'shildi va tasdiqlash uchun yuborildi.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: COLORS.dangerBg, color: COLORS.danger }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {isAdmin && (
          <label className="block">
            <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Sotuvchi</span>
            <select
              value={selectedOperatorId}
              onChange={(e) => setSelectedOperatorId(e.target.value)}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
              style={{ borderColor: COLORS.border }}
            >
              <option value="">Tanlang...</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>{op.firstName} {op.lastName}</option>
              ))}
            </select>
          </label>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Mijoz ismi" icon={UserIcon} required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Aziz" />
          <Input label="Mijoz familiyasi" icon={UserIcon} required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Rahimov" />
        </div>
        <Input label="Telefon raqami" icon={Phone} required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+998 90 123 45 67" />

        <label className="block">
          <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Kurs tarifi</span>
          <div className="relative">
            <select
              value={form.tariffId}
              onChange={(e) => update("tariffId", e.target.value)}
              className="w-full appearance-none rounded-xl border px-3.5 py-2.5 text-sm outline-none"
              style={{ borderColor: COLORS.border }}
            >
              {tariffs.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — {new Intl.NumberFormat("uz-UZ").format(t.price)} so'm</option>
              ))}
              <option value={CUSTOM_VALUE}>Boshqa (ixtiyoriy summa)</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.sub }} />
          </div>
        </label>

        <Input
          label={isCustom ? "Summa (so'm) — majburiy" : "Summa (so'm) — o'zgartirish uchun kiriting"}
          icon={CircleDollarSign}
          type="number"
          required={isCustom}
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
          placeholder={isCustom ? "Masalan: 750000" : String(selectedTariff?.price || "")}
        />

        <Input
          label="Sotuv sanasi"
          icon={Calendar}
          type="date"
          required
          value={form.saleDate}
          onChange={(e) => update("saleDate", e.target.value)}
          max={todayStr()}
        />

        <label className="block">
          <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Chek fayli / rasmi</span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-sm font-medium"
            style={{ borderColor: COLORS.border, color: COLORS.sub }}
          >
            <Upload size={17} />
            {file ? file.name : "Faylni yuklash uchun bosing"}
          </button>
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {submitting ? "Saqlanmoqda..." : "Sotuvni saqlash"}
        </Button>
      </form>
    </Card>
  );
}
