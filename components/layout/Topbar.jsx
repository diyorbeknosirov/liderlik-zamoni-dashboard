"use client";

import { LayoutGrid, Calendar } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Topbar({ setMobileOpen }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg" style={{ background: "#F3F4F6" }}>
          <LayoutGrid size={18} />
        </button>
        <div>
          <p className="text-xs" style={{ color: COLORS.sub }}>Xush kelibsiz,</p>
          <h1 className="text-lg font-extrabold" style={{ color: COLORS.ink }}>
            {user.firstName} {user.lastName}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
          <Calendar size={14} />
          Bugun: {new Date().toLocaleDateString("uz-UZ", { day: "numeric", month: "long" })}
        </div>
        <NotificationBell />
      </div>
    </div>
  );
}
