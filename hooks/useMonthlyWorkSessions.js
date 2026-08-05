"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function monthStart() {
  return new Date().toISOString().slice(0, 7) + "-01";
}

/**
 * Joriy oy uchun work_sessions qatorlarini oladi.
 * Admin — barcha operatorlarniki, operator — faqat o'ziniki.
 */
export function useMonthlyWorkSessions(user) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }
    let query = supabase.from("work_sessions").select("*").gte("work_date", monthStart());
    if (user.role !== "admin") {
      query = query.eq("operator_id", user.id);
    }
    const { data, error } = await query;
    if (!error) setSessions(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { sessions, loading, refresh: load };
}
