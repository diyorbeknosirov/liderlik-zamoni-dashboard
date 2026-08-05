"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useCallAnalyses(user) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setAnalyses([]);
      setLoading(false);
      return;
    }
    let query = supabase.from("call_analyses").select("*").order("created_at", { ascending: false });
    if (user.role !== "admin") {
      query = query.eq("operator_id", user.id);
    }
    const { data, error } = await query;
    if (!error) setAnalyses(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`call-analyses-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "call_analyses" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, load]);

  const uploadAndAnalyze = useCallback(async (operatorId, { clientName, phone, file }) => {
    const ext = file.name.split(".").pop();
    const path = `${operatorId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from("call-recordings").upload(path, file);
    if (uploadErr) throw uploadErr;

    const { data: row, error: insertErr } = await supabase
      .from("call_analyses")
      .insert({
        operator_id: operatorId,
        client_name: clientName || null,
        phone: phone || null,
        audio_path: path,
        status: "processing",
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    // Fon rejimida tahlilni ishga tushiramiz — foydalanuvchi kutib turishi shart emas.
    fetch("/api/analyze-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId: row.id }),
    }).catch((err) => console.warn("analyze-call so'rovi yuborilmadi:", err));

    await load();
    return row;
  }, [load]);

  const removeAnalysis = useCallback(async (id) => {
    const { error } = await supabase.from("call_analyses").delete().eq("id", id);
    if (error) throw error;
    await load();
  }, [load]);

  return { analyses, loading, uploadAndAnalyze, removeAnalysis, refresh: load };
}
