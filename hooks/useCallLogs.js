"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useCallLogs(operatorId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!operatorId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("call_logs")
      .select("*")
      .eq("operator_id", operatorId)
      .order("created_at", { ascending: false });
    if (!error) setLogs(data || []);
    setLoading(false);
  }, [operatorId]);

  useEffect(() => {
    load();
  }, [load]);

  const addCallLog = useCallback(async ({ durationMinutes, isLead, resultedInSale, note }) => {
    const { error } = await supabase.from("call_logs").insert({
      operator_id: operatorId,
      call_date: new Date().toISOString().slice(0, 10),
      duration_minutes: durationMinutes,
      is_lead: !!isLead,
      resulted_in_sale: !!resultedInSale,
      note: note || null,
    });
    if (error) throw error;
    await load();
  }, [operatorId, load]);

  const removeCallLog = useCallback(async (id) => {
    const { error } = await supabase.from("call_logs").delete().eq("id", id);
    if (error) throw error;
    await load();
  }, [load]);

  return { logs, loading, addCallLog, removeCallLog, refresh: load };
}
