"use client";

/**
 * app/dashboard/telegram-bot/SchedulePostForm.jsx
 * -----------------------------------------------------
 * Post matni, tugma kerak-kerakligi va joylanish vaqtini oladigan forma.
 * Yuborilganda /api/telegram/schedule-post ga POST qiladi.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SchedulePostForm() {
  const router = useRouter();
  const [postText, setPostText] = useState("");
  const [hasButton, setHasButton] = useState(true);
  const [publishAt, setPublishAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/telegram/schedule-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postText, hasButton, publishAt }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Xatolik yuz berdi." });
      } else {
        setMessage({ type: "success", text: "✅ Post muvaffaqiyatli rejalashtirildi!" });
        setPostText("");
        setPublishAt("");
        router.refresh();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server bilan bog'lanishda xatolik." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300 mb-1">Post matni</label>
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          required
          rows={4}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          placeholder="Kanal postining matnini kiriting..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasButton"
          checked={hasButton}
          onChange={(e) => setHasButton(e.target.checked)}
          className="accent-amber-500"
        />
        <label htmlFor="hasButton" className="text-sm text-slate-300">
          Postga "Botda batafsil ma'lumot olish" tugmasini qo'shish
        </label>
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">Joylanish vaqti</label>
        <input
          type="datetime-local"
          value={publishAt}
          onChange={(e) => setPublishAt(e.target.value)}
          required
          className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition"
      >
        {loading ? "Yuborilmoqda..." : "Rejalashtirish"}
      </button>
    </form>
  );
}
