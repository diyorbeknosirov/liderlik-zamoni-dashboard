"use client";

import { useState } from "react";
import { ListTodo, Plus, Check, Trash2, Clock } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function TasksPanel({ user, tasks, onAdd, onToggle, onRemove }) {
  const [title, setTitle] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [dueDate, setDueDate] = useState(todayStr());
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({ operatorId: user.id, title: title.trim(), dueTime, dueDate });
      setTitle("");
      setDueTime("");
    } finally {
      setSubmitting(false);
    }
  };

  const today = todayStr();
  const todayTasks = tasks.filter((t) => t.due_date === today);
  const upcomingTasks = tasks.filter((t) => t.due_date > today);
  const pastTasks = tasks.filter((t) => t.due_date < today && t.status !== "done");

  const renderTask = (t) => {
    const isAdminAssigned = t.created_by && t.created_by !== t.operator_id;
    return (
      <div
        key={t.id}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border"
        style={{ borderColor: COLORS.border, background: t.status === "done" ? "#F9FAFB" : "white" }}
      >
        <button
          onClick={() => onToggle(t.id, t.status)}
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
          style={{ borderColor: t.status === "done" ? COLORS.success : COLORS.border, background: t.status === "done" ? COLORS.success : "transparent" }}
        >
          {t.status === "done" && <Check size={12} className="text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: t.status === "done" ? COLORS.sub : COLORS.ink, textDecoration: t.status === "done" ? "line-through" : "none" }}
          >
            {t.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {t.due_time && (
              <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: COLORS.sub }}>
                <Clock size={11} /> {t.due_time}
              </span>
            )}
            {isAdminAssigned && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
                Admin tayinlagan
              </span>
            )}
          </div>
        </div>
        <button onClick={() => onRemove(t.id)} className="p-1 rounded-lg hover:bg-gray-100 shrink-0">
          <Trash2 size={14} style={{ color: COLORS.danger }} />
        </button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-4 sm:p-5 lg:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <ListTodo size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Yangi task qo'shish</h3>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input label="Vazifa" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="masalan: +998901234567 ga qo'ng'iroq qilish" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Vaqt" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            <Input label="Sana" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            <Plus size={15} /> Qo'shish
          </Button>
        </form>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        {pastTasks.length > 0 && (
          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-sm mb-3" style={{ color: COLORS.danger }}>O'tib ketgan vazifalar</h3>
            <div className="space-y-2">{pastTasks.map(renderTask)}</div>
          </Card>
        )}

        <Card className="p-4 sm:p-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: COLORS.ink }}>Bugungi kun tartibi</h3>
          {todayTasks.length === 0 ? (
            <p className="text-sm" style={{ color: COLORS.sub }}>Bugunga hech qanday vazifa yo'q.</p>
          ) : (
            <div className="space-y-2">{todayTasks.map(renderTask)}</div>
          )}
        </Card>

        {upcomingTasks.length > 0 && (
          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-sm mb-3" style={{ color: COLORS.ink }}>Kelgusi vazifalar</h3>
            <div className="space-y-2">{upcomingTasks.map(renderTask)}</div>
          </Card>
        )}
      </div>
    </div>
  );
}
