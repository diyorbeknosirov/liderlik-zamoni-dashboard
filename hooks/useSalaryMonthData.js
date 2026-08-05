"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function monthRange(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  const start = `${monthStr}-01`;
  const end = new Date(y, m, 0).toISOString().slice(0, 10); // oyning oxirgi kuni
  return { start, end };
}

// Tanlangan oy (masalan "2026-07") bo'yicha barcha maosh hisob-kitobi
// uchun kerakli ma'lumotlarni oladi. RLS o'zi cheklaydi: admin —
// barchasini, operator — faqat o'zinikini ko'radi.
export function useSalaryMonthData(user, monthStr) {
  const [data, setData] = useState({ sales: [], workSessions: [], leadStats: [], callAnalyses: [], amocrmLogs: [], dailyCriteria: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !monthStr) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { start, end } = monthRange(monthStr);

      const [salesRes, sessionsRes, leadRes, callRes, amoRes, criteriaRes] = await Promise.all([
        supabase.from("sales").select("*").gte("sale_date", start).lte("sale_date", end),
        supabase.from("work_sessions").select("*").gte("work_date", start).lte("work_date", end),
        supabase.from("daily_lead_stats").select("*").gte("stat_date", start).lte("stat_date", end),
        supabase.from("call_analyses").select("*").gte("created_at", start).lte("created_at", end + "T23:59:59"),
        supabase.from("amocrm_call_logs").select("*").gte("call_date", start).lte("call_date", end),
        supabase.from("daily_criteria").select("*").gte("work_date", start).lte("work_date", end),
      ]);

      if (cancelled) return;
      setData({
        sales: salesRes.data || [],
        workSessions: sessionsRes.data || [],
        leadStats: leadRes.data || [],
        callAnalyses: callRes.data || [],
        amocrmLogs: amoRes.data || [],
        dailyCriteria: criteriaRes.data || [],
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, monthStr]);

  return { ...data, loading };
}
