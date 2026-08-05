"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function monthStart() {
  return new Date().toISOString().slice(0, 7) + "-01";
}

export function useAmocrmCallLogs(user) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }
    let query = supabase.from("amocrm_call_logs").select("*").gte("call_date", monthStart());
    if (user.role !== "admin") {
      query = query.eq("operator_id", user.id);
    }
    const { data, error } = await query;
    if (!error) setLogs(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`amocrm-call-logs-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "amocrm_call_logs" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, load]);

  return { logs, loading, refresh: load };
}
