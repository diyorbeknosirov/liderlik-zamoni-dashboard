"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * RLS o'zi rolga qarab cheklaydi: admin — barchasini, team leader — o'zi
 * va jamoa a'zolarinikini, oddiy operator — faqat o'zinikini ko'radi.
 */
export function useTasks(user) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelNameRef = useRef(`tasks-changes-${Math.random().toString(36).slice(2)}`);

  const load = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("due_date", { ascending: true })
      .order("due_time", { ascending: true });
    if (!error) setTasks(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(channelNameRef.current)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, load]);

  const addTask = useCallback(async ({ operatorId, title, dueTime, dueDate }) => {
    const { error } = await supabase.from("tasks").insert({
      operator_id: operatorId,
      created_by: user?.id,
      title,
      due_time: dueTime || null,
      due_date: dueDate || new Date().toISOString().slice(0, 10),
      status: "pending",
    });
    if (error) throw error;
    await load();
  }, [user, load]);

  const toggleTask = useCallback(async (id, currentStatus) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: currentStatus === "done" ? "pending" : "done" })
      .eq("id", id);
    if (error) throw error;
    await load();
  }, [load]);

  const removeTask = useCallback(async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    await load();
  }, [load]);

  return { tasks, loading, addTask, toggleTask, removeTask, refresh: load };
}
