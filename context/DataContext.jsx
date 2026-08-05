"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

const DataContext = createContext(null);

function mapProfileToOperator(p) {
  return {
    id: p.id,
    firstName: p.first_name,
    lastName: p.last_name,
    team: p.team,
    monthlyPlan: Number(p.monthly_plan) || 0,
    sold: 0, // hisoblanadi (sales dan)
    avatar: ((p.first_name?.[0] || "") + (p.last_name?.[0] || "")).toUpperCase() || "US",
    avatarImage: p.avatar_url,
    fixedSalary: Number(p.fixed_salary) || 0,
    bonusRate: Number(p.bonus_rate) || 0.07,
    isTeamLeader: !!p.is_team_leader,
    amocrmUserId: p.amocrm_user_id || "",
  };
}

function mapSaleToInvoice(s, operatorsById, tariffsById) {
  const op = operatorsById[s.operator_id];
  const tariff = tariffsById[s.tariff_id];
  return {
    id: s.id,
    operatorId: s.operator_id,
    operatorName: op ? `${op.firstName} ${op.lastName}` : "",
    clientName: s.client_name,
    phone: s.phone,
    tariff: tariff?.name || s.tariff_label || "Boshqa",
    amount: Number(s.amount),
    date: s.sale_date,
    status: s.status,
    receipt: s.receipt_url || "",
    isConsultationReferral: !!s.is_consultation_referral,
  };
}

export function DataProvider({ children }) {
  const [operators, setOperators] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [teamPlan, setTeamPlan] = useState(0);
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSaleEvent, setNewSaleEvent] = useState(null); // live toast trigger

  const loadAll = useCallback(async () => {
    const [{ data: profiles }, { data: sales }, { data: settings }, { data: tariffRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "operator"),
      supabase.from("sales").select("*").order("created_at", { ascending: false }),
      supabase.from("team_settings").select("*").eq("id", 1).single(),
      supabase.from("tariffs").select("*"),
    ]);

    const tariffList = tariffRows || [];
    const tariffsById = Object.fromEntries(tariffList.map((t) => [t.id, t]));

    const opsById = {};
    const ops = (profiles || []).map((p) => {
      const o = mapProfileToOperator(p);
      opsById[o.id] = o;
      return o;
    });

    const monthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    (sales || []).forEach((s) => {
      if (opsById[s.operator_id] && s.sale_date?.startsWith(monthPrefix)) {
        opsById[s.operator_id].sold += Number(s.amount);
      }
    });

    setTariffs(tariffList);
    setOperators(Object.values(opsById));
    setInvoices((sales || []).map((s) => mapSaleToInvoice(s, opsById, tariffsById)));
    setTeamPlan(Number(settings?.monthly_plan) || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();

    // Realtime: yangi sotuv qo'shilganda darhol qayta yuklash + toast trigger
    const channel = supabase
      .channel("sales-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sales" }, (payload) => {
        setNewSaleEvent(payload.new);
        loadAll();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sales" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "team_settings" }, () => loadAll())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  const addInvoice = useCallback(async (inv) => {
    const saleDate = inv.saleDate || new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase.from("sales").insert({
      operator_id: inv.operatorId,
      client_name: inv.clientName,
      phone: inv.phone,
      tariff_id: inv.tariffId || null,
      tariff_label: inv.tariffLabel || null,
      amount: inv.amount,
      status: "Kutilmoqda",
      receipt_url: inv.receiptUrl || null,
      sale_date: saleDate,
    }).select().single();

    if (error) throw error;
    await loadAll();

    // Operator ma'lumotini TO'G'RIDAN-TO'G'RI bazadan olamiz (eskirgan
    // "operators" state'iga tayanmasdan) — bu ism ko'rinmasligi xatosining
    // oldini oladi, ayniqsa yangi qo'shilgan operatorlar uchun.
    const { data: freshOp } = await supabase
      .from("profiles")
      .select("first_name, last_name, team")
      .eq("id", inv.operatorId)
      .single();

    const operatorName = freshOp ? `${freshOp.first_name} ${freshOp.last_name}`.trim() : "Noma'lum sotuvchi";
    const tariff = tariffs.find((t) => t.id === inv.tariffId);

    // Google Sheets'ga sinxronlash — fon rejimida, UI'ni bloklamaydi.
    fetch("/api/sync-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: data.id,
        operatorName,
        clientName: inv.clientName,
        phone: inv.phone,
        tariff: tariff?.name || inv.tariffLabel || "",
        amount: inv.amount,
        date: data.sale_date,
        status: data.status,
        receipt: inv.receiptUrl || "",
      }),
    }).catch((err) => console.warn("Google Sheets sync (invoice) failed:", err));

    // Telegram guruhiga darhol xabar — fon rejimida, chek fayli yuborilmaydi.
    fetch("/api/notify-sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operatorName,
        team: freshOp?.team || "",
        tariff: tariff?.name || inv.tariffLabel || "",
        amount: inv.amount,
        clientName: inv.clientName,
      }),
    }).catch((err) => console.warn("Telegram notify (invoice) failed:", err));
  }, [loadAll, tariffs]);

  const updateInvoice = useCallback(async (id, patch) => {
    const dbPatch = {};
    if (patch.clientName !== undefined) dbPatch.client_name = patch.clientName;
    if (patch.phone !== undefined) dbPatch.phone = patch.phone;
    if (patch.amount !== undefined) dbPatch.amount = Number(patch.amount);
    if (patch.saleDate !== undefined) dbPatch.sale_date = patch.saleDate;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.operatorId !== undefined) dbPatch.operator_id = patch.operatorId;
    if (patch.isConsultationReferral !== undefined) dbPatch.is_consultation_referral = patch.isConsultationReferral;

    const { error } = await supabase.from("sales").update(dbPatch).eq("id", id);
    if (error) throw error;
    await loadAll();
  }, [loadAll]);

  const deleteInvoice = useCallback(async (id) => {
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) throw error;
    await loadAll();
  }, [loadAll]);

  const approveInvoice = useCallback(async (id) => {
    const { error } = await supabase.from("sales").update({ status: "Tasdiqlangan" }).eq("id", id);
    if (error) throw error;
    await loadAll();
  }, [loadAll]);

  const updateOperator = useCallback(async (id, patch) => {
    const dbPatch = {};
    if (patch.firstName !== undefined) dbPatch.first_name = patch.firstName;
    if (patch.lastName !== undefined) dbPatch.last_name = patch.lastName;
    if (patch.team !== undefined) dbPatch.team = patch.team;
    if (patch.monthlyPlan !== undefined) dbPatch.monthly_plan = patch.monthlyPlan;
    if (patch.fixedSalary !== undefined) dbPatch.fixed_salary = patch.fixedSalary;
    if (patch.bonusRate !== undefined) dbPatch.bonus_rate = patch.bonusRate;
    if (patch.avatarImage !== undefined) dbPatch.avatar_url = patch.avatarImage;
    if (patch.isTeamLeader !== undefined) dbPatch.is_team_leader = patch.isTeamLeader;
    if (patch.amocrmUserId !== undefined) dbPatch.amocrm_user_id = patch.amocrmUserId;

    const { error } = await supabase.from("profiles").update(dbPatch).eq("id", id);
    if (error) throw error;
    await loadAll();
  }, [loadAll]);

  const addOperator = useCallback(async ({ email, password, firstName, lastName, team, monthlyPlan, fixedSalary, bonusRate }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Tizimga qayta kiring.");

    const res = await fetch("/api/create-operator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email, password, firstName, lastName, team, monthlyPlan, fixedSalary, bonusRate }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Sotuvchi qo'shishda xatolik yuz berdi.");
    await loadAll();
  }, [loadAll]);

  const removeOperator = useCallback(async (id) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Tizimga qayta kiring.");

    const res = await fetch("/api/delete-operator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ operatorId: id }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Sotuvchini o'chirishda xatolik yuz berdi.");
    await loadAll();
  }, [loadAll]);

  const updateTeamPlan = useCallback(async (value) => {
    const { error } = await supabase.from("team_settings").update({ monthly_plan: value }).eq("id", 1);
    if (error) throw error;
    setTeamPlan(value);
  }, []);

  return (
    <DataContext.Provider
      value={{
        operators, invoices, teamPlan, tariffs, loading, newSaleEvent,
        addInvoice, updateInvoice, deleteInvoice, approveInvoice, updateOperator, addOperator, removeOperator, updateTeamPlan,
        refresh: loadAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
