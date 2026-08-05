"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Oddiy check-in / check-out tizimi (taymer o'rniga).
 * Operator kunni boshlaganda "check-in" tugmasini bosadi (started_at
 * yoziladi), ishni tugatganda "check-out" tugmasini bosadi (ended_at
 * yoziladi, active_seconds = ended_at - started_at sifatida hisoblanadi).
 */
export function useCheckIn(user) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user || user.role !== "operator") {
      setLoading(false);
      return;
    }
    const today = todayStr();
    const { data } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("operator_id", user.id)
      .eq("work_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSession(data || null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const checkIn = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("work_sessions")
      .insert({
        operator_id: user.id,
        work_date: todayStr(),
        status: "running",
        active_seconds: 0,
      })
      .select()
      .single();
    if (error) throw error;
    setSession(data);
  }, [user]);

  const checkOut = useCallback(async () => {
    if (!session) return;
    const endedAt = new Date();
    const startedAt = new Date(session.started_at);
    const seconds = Math.max(0, Math.round((endedAt - startedAt) / 1000));
    const { data, error } = await supabase
      .from("work_sessions")
      .update({ ended_at: endedAt.toISOString(), active_seconds: seconds, status: "stopped" })
      .eq("id", session.id)
      .select()
      .single();
    if (error) throw error;
    setSession(data);
  }, [session]);

  return {
    session,
    loading,
    checkIn,
    checkOut,
    hasCheckedIn: !!session,
    hasCheckedOut: !!session?.ended_at,
  };
}
