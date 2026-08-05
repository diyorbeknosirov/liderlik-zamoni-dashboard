"use client";

import { useState } from "react";
import { ListTodo, Plus, Check, Trash2, Clock } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminTasksPanel({ operators, tasks, onAdd, onToggle, onRemove }) {
  const [operatorId, setOperatorId] = useState(operators[0]?.id || "");
  const [title, setTitle] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [dueDate, setDueDate] = useState(todayStr());
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !operatorId) return;
    setSubmitting(true);
    try {
      await onAdd({ operatorId, title: title.trim(), dueTime, dueDate });
      setTitle("");
      setDueTime("");
    } finally {
      setSubmitting(false);
    }
  };

  const grouped = operators.map((op) => ({
    operator: op,
    tasks: tasks.filter((t) => t.operator_id === op.id),
  })).filter((g) => g.tasks.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-4 sm:p-5 lg:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <ListTodo size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Xodimga vazifa tayinlash</h3>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Xodim</span>
            <select value={operatorId} onChange={(e) => setOperatorId(e.target.value)} className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: COLORS.border }}>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>{op.firstName} {op.lastName}</option>
              ))}
            </select>
          </label>
          <Input label="Vazifa" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="masalan: hisobotni yuborish" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Vaqt" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            <Input label="Sana" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            <Plus size={15} /> Tayinlash
          </Button>
        </form>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        {grouped.length === 0 && (
          <Card className="p-5">
            <p className="text-sm" style={{ color: COLORS.sub }}>Hozircha hech qanday vazifa yo'q.</p>
          </Card>
        )}
        {grouped.map(({ operator, tasks: opTasks }) => (
          <Card key={operator.id} className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Avatar initials={operator.avatar} src={operator.avatarImage} size={26} />
              <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>{operator.firstName} {operator.lastName}</h3>
            </div>
            <div className="space-y-2">
              {opTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border" style={{ borderColor: COLORS.border }}>
                  <button
                    onClick={() => onToggle(t.id, t.status)}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: t.status === "done" ? COLORS.success : COLORS.border, background: t.status === "done" ? COLORS.success : "transparent" }}
                  >
                    {t.status === "done" && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: t.status === "done" ? COLORS.sub : COLORS.ink, textDecoration: t.status === "done" ? "line-through" : "none" }}>
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px]" style={{ color: COLORS.sub }}>{t.due_date}</span>
                      {t.due_time && (
                        <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: COLORS.sub }}>
                          <Clock size={11} /> {t.due_time}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => onRemove(t.id)} className="p-1 rounded-lg hover:bg-gray-100 shrink-0">
                    <Trash2 size={14} style={{ color: COLORS.danger }} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
