"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function monthStart() {
  return new Date().toISOString().slice(0, 7) + "-01";
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useDailyCriteria(user) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    let query = supabase.from("daily_criteria").select("*").gte("work_date", monthStart());
    if (user.role !== "admin") {
      query = query.eq("operator_id", user.id);
    }
    const { data, error } = await query;
    if (!error) setRows(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`daily-criteria-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_criteria" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, load]);

  // Admin: bugungi kun uchun CRM/Trening bahosini belgilaydi.
  const setDailyEvaluation = useCallback(async (operatorId, workDate, patch) => {
    const { data: existing } = await supabase
      .from("daily_criteria")
      .select("id")
      .eq("operator_id", operatorId)
      .eq("work_date", workDate)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("daily_criteria")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("daily_criteria")
        .insert({ operator_id: operatorId, work_date: workDate, ...patch });
      if (error) throw error;
    }
    await load();
  }, [load]);

  // Operator: bugungi demo mijozlar sonini kiritadi/yangilaydi.
  const setTodayDemoCount = useCallback(async (operatorId, demoCount) => {
    await setDailyEvaluation(operatorId, todayStr(), { demo_count: demoCount });
  }, [setDailyEvaluation]);

  return { rows, loading, setDailyEvaluation, setTodayDemoCount, refresh: load };
}
