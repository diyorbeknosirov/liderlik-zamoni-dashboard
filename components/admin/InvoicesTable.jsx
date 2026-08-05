"use client";

import { useState } from "react";
import { FileText, Search, Download, Sheet, Loader2, Check, Edit2, Trash2 } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import { useData } from "@/context/DataContext";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import InvoiceEditForm from "./InvoiceEditForm";

export default function InvoicesTable({ invoices, operators }) {
  const { approveInvoice, updateInvoice, deleteInvoice } = useData();
  const [status, setStatus] = useState("Barchasi");
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const filtered = invoices.filter((inv) => {
    const okStatus = status === "Barchasi" || inv.status === status;
    const okSearch =
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.operatorName || "").toLowerCase().includes(search.toLowerCase());
    return okStatus && okSearch;
  });

  const approve = async (id) => {
    await approveInvoice(id);
  };

  const remove = async (id) => {
    if (!confirm("Haqiqatan ham ushbu sotuvni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.")) return;
    await deleteInvoice(id);
  };

  const saveEdit = async (form) => {
    await updateInvoice(editingInvoice.id, form);
    setEditingInvoice(null);
  };

  const exportCsv = () => {
    const header = "ID,Sotuvchi,Mijoz,Telefon,Tarif,Summa,Sana,Status\n";
    const rows = filtered.map((i) => [i.id, i.operatorName, i.clientName, i.phone, i.tariff, i.amount, i.date, i.status].join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const syncToSheets = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync-all-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoices: filtered }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Xatolik yuz berdi");
      setSyncResult({ ok: true, message: `${data.success}/${data.total} ta yozuv yuborildi.` });
    } catch (err) {
      setSyncResult({ ok: false, message: err.message || "Google Sheets bilan ulanishda xatolik." });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 5000);
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FileText size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Invoices / Xaridorlar</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.sub }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="rounded-xl border pl-9 pr-3 py-2 text-sm outline-none" style={{ borderColor: COLORS.border }} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: COLORS.border }}>
            {["Barchasi", "Tasdiqlangan", "Kutilmoqda"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <Button variant="outline" onClick={exportCsv}><Download size={15} />CSV</Button>
          <Button variant="outline" onClick={syncToSheets} disabled={syncing}>
            {syncing ? <Loader2 size={15} className="animate-spin" /> : <Sheet size={15} />}
            {syncing ? "Yuborilmoqda..." : "Google Sheets'ga yuborish"}
          </Button>
        </div>
      </div>

      {syncResult && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ background: syncResult.ok ? COLORS.successBg : COLORS.dangerBg, color: syncResult.ok ? COLORS.success : COLORS.danger }}
        >
          {syncResult.ok && <Check size={15} />}
          {syncResult.message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="text-left" style={{ color: COLORS.sub }}>
              <th className="py-2 px-1 font-medium">ID</th>
              <th className="py-2 px-1 font-medium">Sotuvchi</th>
              <th className="py-2 px-1 font-medium">Mijoz</th>
              <th className="py-2 px-1 font-medium">Tarif</th>
              <th className="py-2 px-1 font-medium">Summa</th>
              <th className="py-2 px-1 font-medium">Sana</th>
              <th className="py-2 px-1 font-medium">Status</th>
              <th className="py-2 px-1 font-medium">Chek</th>
              <th className="py-2 px-1 font-medium">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-t" style={{ borderColor: COLORS.border }}>
                <td className="py-2.5 px-1 font-mono text-xs" style={{ color: COLORS.sub }}>{inv.id.slice(0, 8)}</td>
                <td className="py-2.5 px-1 whitespace-nowrap" style={{ color: COLORS.ink }}>{inv.operatorName}</td>
                <td className="py-2.5 px-1 whitespace-nowrap font-semibold" style={{ color: COLORS.ink }}>{inv.clientName}</td>
                <td className="py-2.5 px-1 whitespace-nowrap" style={{ color: COLORS.sub }}>{inv.tariff}</td>
                <td className="py-2.5 px-1 font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{fmt(inv.amount)} so'm</td>
                <td className="py-2.5 px-1 whitespace-nowrap" style={{ color: COLORS.sub }}>{inv.date}</td>
                <td className="py-2.5 px-1"><Pill tone={inv.status === "Tasdiqlangan" ? "success" : "default"}>{inv.status}</Pill></td>
                <td className="py-2.5 px-1">
                  {inv.receipt ? (
                    <a href={inv.receipt} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold underline" style={{ color: COLORS.primary }}>
                      Ko'rish
                    </a>
                  ) : (
                    <span className="text-xs" style={{ color: COLORS.sub }}>—</span>
                  )}
                </td>
                <td className="py-2.5 px-1">
                  <div className="flex items-center gap-1.5">
                    {inv.status !== "Tasdiqlangan" && (
                      <button onClick={() => approve(inv.id)} className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: COLORS.successBg, color: COLORS.success }}>
                        Tasdiqlash
                      </button>
                    )}
                    <button onClick={() => setEditingInvoice(inv)} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <Edit2 size={14} style={{ color: COLORS.sub }} />
                    </button>
                    <button onClick={() => remove(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <Trash2 size={14} style={{ color: COLORS.danger }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editingInvoice} onClose={() => setEditingInvoice(null)} title="Sotuvni tahrirlash">
        {editingInvoice && (
          <InvoiceEditForm invoice={editingInvoice} operators={operators} onSave={saveEdit} onCancel={() => setEditingInvoice(null)} />
        )}
      </Modal>
    </Card>
  );
}
