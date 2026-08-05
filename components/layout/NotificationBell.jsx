"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, GraduationCap, X } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "hozir";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full"
        style={{ background: COLORS.primaryLight }}
        aria-label="Bildirishnomalar"
      >
        <Bell size={17} style={{ color: COLORS.primary }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: COLORS.danger }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[28rem] overflow-y-auto rounded-2xl border bg-white z-50"
          style={{ borderColor: COLORS.border, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white" style={{ borderColor: COLORS.border }}>
            <p className="font-bold text-sm" style={{ color: COLORS.ink }}>Bildirishnomalar</p>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-semibold" style={{ color: COLORS.primary }}>
                Barchasini o'qilgan deb belgilash
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: COLORS.sub }}>
              Hozircha bildirishnoma yo'q.
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className="w-full text-left px-4 py-3 border-b flex items-start gap-3 hover:bg-gray-50"
                  style={{ borderColor: COLORS.border, background: n.is_read ? "transparent" : COLORS.primaryLight }}
                >
                  <div className="mt-0.5 shrink-0">
                    <GraduationCap size={16} style={{ color: n.is_read ? COLORS.sub : COLORS.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: COLORS.ink, fontWeight: n.is_read ? 400 : 600 }}>{n.message}</p>
                    <p className="text-[11px] mt-1" style={{ color: COLORS.sub }}>{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: COLORS.primary }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
