"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useScripts(user) {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setScripts([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("scripts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setScripts(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`scripts-changes-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "scripts" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, load]);

  const addScript = useCallback(async ({ title, content }) => {
    const { error } = await supabase.from("scripts").insert({
      title,
      content,
      created_by: user?.id,
    });
    if (error) throw error;
    await load();
  }, [user, load]);

  const updateScript = useCallback(async (id, { title, content }) => {
    const { error } = await supabase
      .from("scripts")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    await load();
  }, [load]);

  const removeScript = useCallback(async (id) => {
    const { error } = await supabase.from("scripts").delete().eq("id", id);
    if (error) throw error;
    await load();
  }, [load]);

  return { scripts, loading, addScript, updateScript, removeScript, refresh: load };
}
