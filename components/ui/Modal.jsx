"use client";

import { X } from "lucide-react";
import { COLORS } from "@/lib/constants";

export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(17,24,39,0.5)" }}>
      <div className={`bg-white rounded-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: COLORS.border }}>
          <h3 className="font-bold text-lg" style={{ color: COLORS.ink }}>
            {title}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
