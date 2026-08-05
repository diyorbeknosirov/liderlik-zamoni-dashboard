"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    let query = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    if (user.role !== "admin") {
      query = query.eq("operator_id", user.id);
    }
    const { data, error } = await query;
    if (!error) setNotifications(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;

    const channel = supabase
      .channel("notifications-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  const markAsRead = useCallback(async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: load };
}
