"use client";

import { useState } from "react";
import { FileText, Plus, Edit2, Trash2 } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

function ScriptForm({ data, onSave, onCancel }) {
  const [title, setTitle] = useState(data.title || "");
  const [content, setContent] = useState(data.content || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Sarlavha va matnni to'ldiring.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave({ title: title.trim(), content: content.trim() });
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <Input label="Sarlavha" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="masalan: Birinchi qo'ng'iroq skripti" />
      <label className="block">
        <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Skript matni</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none resize-y"
          style={{ borderColor: COLORS.border }}
          placeholder="Salom, mening ismim... Sizga qo'ng'iroq qilyapman chunki..."
        />
      </label>
      {error && <p className="text-sm font-medium" style={{ color: COLORS.danger }}>{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1" disabled={saving}>Bekor qilish</Button>
      </div>
    </form>
  );
}

export default function ScriptsManagement({ scripts, onAdd, onUpdate, onRemove }) {
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
    if (!confirm("Ushbu skriptni o'chirmoqchimisiz?")) return;
    await onRemove(id);
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Sotuv skriptlari</h3>
        </div>
        <Button onClick={() => setModal({ mode: "add", data: {} })}>
          <Plus size={16} /> Yangi skript
        </Button>
      </div>

      <div className="space-y-2">
        {scripts.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-3 p-3.5 rounded-xl border" style={{ borderColor: COLORS.border }}>
            <div className="min-w-0">
              <p className="font-semibold text-sm" style={{ color: COLORS.ink }}>{s.title}</p>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: COLORS.sub }}>{s.content}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => setModal({ mode: "edit", data: s })} className="p-1.5 rounded-lg hover:bg-gray-100">
                <Edit2 size={14} style={{ color: COLORS.sub }} />
              </button>
              <button onClick={() => remove(s.id)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <Trash2 size={14} style={{ color: COLORS.danger }} />
              </button>
            </div>
          </div>
        ))}
        {scripts.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: COLORS.sub }}>Hozircha skript yo'q.</p>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "add" ? "Yangi skript" : "Skriptni tahrirlash"} wide>
        {modal && <ScriptForm data={modal.data} onSave={save} onCancel={() => setModal(null)} />}
      </Modal>
    </Card>
  );
}
