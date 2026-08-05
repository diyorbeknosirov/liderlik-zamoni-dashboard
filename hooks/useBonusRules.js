"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useBonusRules(user) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setRules([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("bonus_rules").select("*").order("created_at", { ascending: false });
    if (!error) setRules(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`bonus-rules-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bonus_rules" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, load]);

  const addRule = useCallback(async (data) => {
    const { error } = await supabase.from("bonus_rules").insert({
      name: data.name,
      metric: data.metric,
      comparison: data.comparison,
      threshold_min: Number(data.thresholdMin) || 0,
      threshold_max: data.comparison === "between" ? Number(data.thresholdMax) || null : null,
      amount_type: data.amountType,
      amount: Number(data.amount) || 0,
      active: true,
      created_by: user?.id,
    });
    if (error) throw error;
    await load();
  }, [user, load]);

  const updateRule = useCallback(async (id, data) => {
    const { error } = await supabase.from("bonus_rules").update({
      name: data.name,
      metric: data.metric,
      comparison: data.comparison,
      threshold_min: Number(data.thresholdMin) || 0,
      threshold_max: data.comparison === "between" ? Number(data.thresholdMax) || null : null,
      amount_type: data.amountType,
      amount: Number(data.amount) || 0,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) throw error;
    await load();
  }, [load]);

  const toggleRule = useCallback(async (id, active) => {
    const { error } = await supabase.from("bonus_rules").update({ active }).eq("id", id);
    if (error) throw error;
    await load();
  }, [load]);

  const removeRule = useCallback(async (id) => {
    const { error } = await supabase.from("bonus_rules").delete().eq("id", id);
    if (error) throw error;
    await load();
  }, [load]);

  return { rules, loading, addRule, updateRule, toggleRule, removeRule, refresh: load };
}
