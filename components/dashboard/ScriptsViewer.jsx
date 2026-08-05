"use client";

import { useState } from "react";
import { FileText, Search, Copy, Check } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";

export default function ScriptsViewer({ scripts }) {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filtered = scripts.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));
  const active = scripts.find((s) => s.id === activeId) || filtered[0];

  const copy = (s) => {
    navigator.clipboard.writeText(s.content).then(() => {
      setCopiedId(s.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-4 sm:p-5 lg:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Skriptlar</h3>
        </div>
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.sub }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="w-full rounded-xl border pl-9 pr-3 py-2 text-sm outline-none"
            style={{ borderColor: COLORS.border }}
          />
        </div>
        <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: (active?.id === s.id) ? COLORS.primaryLight : "transparent",
                color: (active?.id === s.id) ? COLORS.primary : COLORS.ink,
              }}
            >
              {s.title}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: COLORS.sub }}>Skript topilmadi.</p>
          )}
        </div>
      </Card>

      <Card className="p-4 sm:p-5 lg:col-span-2">
        {active ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base" style={{ color: COLORS.ink }}>{active.title}</h3>
              <button
                onClick={() => copy(active)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: COLORS.primaryLight, color: COLORS.primary }}
              >
                {copiedId === active.id ? <Check size={13} /> : <Copy size={13} />}
                {copiedId === active.id ? "Nusxalandi" : "Nusxalash"}
              </button>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: COLORS.ink }}>{active.content}</p>
          </>
        ) : (
          <p className="text-sm" style={{ color: COLORS.sub }}>Chapdan skript tanlang.</p>
        )}
      </Card>
    </div>
  );
}
