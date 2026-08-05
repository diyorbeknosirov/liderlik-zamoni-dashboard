"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function monthStart() {
  return todayStr().slice(0, 7) + "-01";
}

/**
 * Joriy oy uchun daily_lead_stats qatorlarini oladi.
 * Admin — barcha operatorlarniki, operator — faqat o'ziniki.
 */
export function useLeadStats(user) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setStats([]);
      setLoading(false);
      return;
    }
    let query = supabase.from("daily_lead_stats").select("*").gte("stat_date", monthStart());
    if (user.role !== "admin") {
      query = query.eq("operator_id", user.id);
    }
    const { data, error } = await query;
    if (!error) setStats(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`lead-stats-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_lead_stats" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, load]);

  const upsertForDate = useCallback(async (operatorId, date, patch) => {
    const { data: existing, error: selectErr } = await supabase
      .from("daily_lead_stats")
      .select("id")
      .eq("operator_id", operatorId)
      .eq("stat_date", date)
      .maybeSingle();

    if (selectErr) throw selectErr;

    if (existing) {
      const { error } = await supabase
        .from("daily_lead_stats")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("daily_lead_stats")
        .insert({ operator_id: operatorId, stat_date: date, ...patch });
      if (error) throw error;
    }

    await load();
  }, [load]);

  return { stats, loading, upsertForDate, refresh: load };
}
