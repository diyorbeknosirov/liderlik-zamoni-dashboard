"use client";

import { useRef, useState } from "react";
import { Mic, Upload, Loader2, Check, ChevronDown, ChevronUp, Trash2, AlertCircle, Clock, Play } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";

function UploadForm({ operatorId, onUpload }) {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Audio faylni tanlang.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onUpload({ clientName, phone, file });
      setClientName("");
      setPhone("");
      setFile(null);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Mic size={18} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Qo'ng'iroqni tahlil qilish</h3>
      </div>
      <p className="text-xs mb-4" style={{ color: COLORS.sub }}>
        Qo'ng'iroqni telefoningizning ovoz yozish ilovasi orqali yozib oling,
        so'ng shu yerga yuklang — AI transkripsiya qilib, tahlil beradi
        (1-3 daqiqa vaqt olishi mumkin).
      </p>
      <form onSubmit={submit} className="space-y-3">
        <Input label="Mijoz ismi (ixtiyoriy)" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Aziz Rahimov" />
        <Input label="Telefon (ixtiyoriy)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" />
        <label className="block">
          <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Audio fayl</span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-sm font-medium"
            style={{ borderColor: COLORS.border, color: COLORS.sub }}
          >
            <Upload size={17} />
            {file ? file.name : "MP3, M4A, WAV va h.k. yuklash"}
          </button>
          <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        {error && <p className="text-sm font-medium" style={{ color: COLORS.danger }}>{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {submitting ? "Yuklanmoqda..." : "Yuklash va tahlil qilish"}
        </Button>
      </form>
    </Card>
  );
}

function AnalysisRow({ item, onRemove, showOperatorName }) {
  const [open, setOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const loadAudio = async () => {
    if (audioUrl || loadingAudio) return;
    setLoadingAudio(true);
    const { data } = await supabase.storage.from("call-recordings").createSignedUrl(item.audio_path, 3600);
    if (data?.signedUrl) setAudioUrl(data.signedUrl);
    setLoadingAudio(false);
  };

  const statusPill = {
    processing: <Pill tone="default"><Clock size={11} className="inline mr-1" />Tahlil qilinmoqda...</Pill>,
    done: <Pill tone="success"><Check size={11} className="inline mr-1" />Tayyor</Pill>,
    error: <Pill tone="danger"><AlertCircle size={11} className="inline mr-1" />Xatolik</Pill>,
  }[item.status];

  return (
    <div className="rounded-xl border" style={{ borderColor: COLORS.border }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 p-3.5 text-left">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: COLORS.ink }}>
            {item.client_name || "Nomsiz mijoz"}
            {showOperatorName && item.operatorName && (
              <span className="font-normal" style={{ color: COLORS.sub }}> — {item.operatorName}</span>
            )}
          </p>
          <p className="text-xs mt-0.5" style={{ color: COLORS.sub }}>
            {new Date(item.created_at).toLocaleString("uz-UZ")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusPill}
          {open ? <ChevronUp size={16} style={{ color: COLORS.sub }} /> : <ChevronDown size={16} style={{ color: COLORS.sub }} />}
        </div>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 space-y-3">
          {item.status === "processing" && (
            <p className="text-sm" style={{ color: COLORS.sub }}>Audio tahlil qilinmoqda, sahifani yangilash shart emas — natija avtomatik paydo bo'ladi.</p>
          )}
          {item.status === "error" && (
            <p className="text-sm font-medium" style={{ color: COLORS.danger }}>{item.error_message || "Noma'lum xatolik."}</p>
          )}
          {item.status === "done" && (
            <>
              <div>
                {item.score_overall != null && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                    {[
                      ["Ovoz toni", item.score_voice_tone],
                      ["Nutqi", item.score_speech],
                      ["Ishonchi", item.score_confidence],
                      ["Skript", item.score_script_adherence],
                      ["Umumiy", item.score_overall],
                    ].map(([label, val]) => (
                      <div key={label} className="text-center rounded-lg p-2" style={{ background: label === "Umumiy" ? COLORS.primary : COLORS.primaryLight }}>
                        <p className="text-[10px]" style={{ color: label === "Umumiy" ? "white" : COLORS.primary }}>{label}</p>
                        <p className="font-bold text-sm" style={{ color: label === "Umumiy" ? "white" : COLORS.primary }}>{val ?? "—"}/10</p>
                      </div>
                    ))}
                  </div>
                )}
                {item.success_rate != null && (
                  <p className="text-xs font-semibold mb-3" style={{ color: COLORS.success }}>
                    Sotuvga aylanish ehtimoli: {item.success_rate}%
                  </p>
                )}
                {audioUrl ? (
                  <audio controls src={audioUrl} className="w-full mb-3" />
                ) : (
                  <button
                    onClick={loadAudio}
                    disabled={loadingAudio}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg mb-3"
                    style={{ background: COLORS.primaryLight, color: COLORS.primary }}
                  >
                    {loadingAudio ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                    {loadingAudio ? "Yuklanmoqda..." : "Yozuvni tinglash"}
                  </button>
                )}
                <p className="text-xs font-semibold mb-1" style={{ color: COLORS.sub }}>AI tahlili</p>
                <div className="text-sm whitespace-pre-wrap leading-relaxed rounded-xl p-3" style={{ background: COLORS.primaryLight, color: COLORS.ink }}>
                  {item.analysis}
                </div>
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer font-semibold" style={{ color: COLORS.primary }}>To'liq transkripsiyani ko'rish</summary>
                <p className="mt-2 whitespace-pre-wrap" style={{ color: COLORS.sub }}>{item.transcript}</p>
              </details>
            </>
          )}
          <button onClick={() => onRemove(item.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: COLORS.danger }}>
            <Trash2 size={13} /> O'chirish
          </button>
        </div>
      )}
    </div>
  );
}

export default function CallAnalysisPanel({ user, analyses, operators, onUpload, onRemove }) {
  const operatorsById = Object.fromEntries((operators || []).map((o) => [o.id, `${o.firstName} ${o.lastName}`]));
  const enriched = analyses.map((a) => ({ ...a, operatorName: operatorsById[a.operator_id] }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {user.role !== "admin" && (
        <div className="lg:col-span-1">
          <UploadForm operatorId={user.id} onUpload={(data) => onUpload(user.id, data)} />
        </div>
      )}

      <Card className={`p-4 sm:p-5 ${user.role === "admin" ? "lg:col-span-3" : "lg:col-span-2"}`}>
        <h3 className="font-bold text-sm mb-4" style={{ color: COLORS.ink }}>
          {user.role === "admin" ? "Barcha qo'ng'iroq tahlillari" : "Tarix"}
        </h3>
        <div className="space-y-2">
          {enriched.map((item) => (
            <AnalysisRow key={item.id} item={item} onRemove={onRemove} showOperatorName={user.role === "admin"} />
          ))}
          {enriched.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: COLORS.sub }}>Hozircha tahlil qilingan qo'ng'iroq yo'q.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
