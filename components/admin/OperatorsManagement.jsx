"use client";

import { useState } from "react";
import { Users, Search, Plus, Edit2, Trash2, Crown } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import { useData } from "@/context/DataContext";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import OperatorForm from "./OperatorForm";

export default function OperatorsManagement({ operators, lockedTeam, isTeamLeaderView, title }) {
  const { addOperator, updateOperator, removeOperator } = useData();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");

  const scopedOperators = lockedTeam ? operators.filter((o) => o.team === lockedTeam) : operators;

  const openAdd = () =>
    setModal({
      mode: "add",
      data: { firstName: "", lastName: "", email: "", password: "", team: lockedTeam || "Kunduzgi", monthlyPlan: "", fixedSalary: "", bonusRate: 0.07, isTeamLeader: false },
    });
  const openEdit = (op) => setModal({ mode: "edit", data: { ...op } });

  const save = async (data) => {
    if (modal.mode === "add") {
      await addOperator({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        team: data.team,
        monthlyPlan: Number(data.monthlyPlan),
        fixedSalary: Number(data.fixedSalary),
        bonusRate: 0.07,
      });
    } else {
      const patch = {
        firstName: data.firstName,
        lastName: data.lastName,
        team: data.team,
        monthlyPlan: Number(data.monthlyPlan),
        fixedSalary: Number(data.fixedSalary),
      };
      if (!isTeamLeaderView) {
        patch.isTeamLeader = !!data.isTeamLeader;
        patch.amocrmUserId = data.amocrmUserId || null;
      }
      await updateOperator(data.id, patch);
    }
    setModal(null);
  };

  const remove = async (id) => {
    if (!confirm("Haqiqatan ham ushbu sotuvchini o'chirmoqchimisiz?")) return;
    await removeOperator(id);
  };

  const filtered = scopedOperators.filter((o) => `${o.firstName} ${o.lastName}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>{title || "Sotuvchilar boshqaruvi"}</h3>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.sub }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="rounded-xl border pl-9 pr-3 py-2 text-sm outline-none" style={{ borderColor: COLORS.border }} />
          </div>
          <Button onClick={openAdd}><Plus size={16} />Qo'shish</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left" style={{ color: COLORS.sub }}>
              <th className="py-2 px-1 font-medium">Sotuvchi</th>
              <th className="py-2 px-1 font-medium">Jamoa</th>
              <th className="py-2 px-1 font-medium">Oylik reja</th>
              <th className="py-2 px-1 font-medium">Sotildi</th>
              <th className="py-2 px-1 font-medium">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((op) => (
              <tr key={op.id} className="border-t" style={{ borderColor: COLORS.border }}>
                <td className="py-2.5 px-1">
                  <div className="flex items-center gap-2">
                    <Avatar initials={op.avatar} src={op.avatarImage} size={30} />
                    <span className="font-semibold whitespace-nowrap flex items-center gap-1" style={{ color: COLORS.ink }}>
                      {op.firstName} {op.lastName}
                      {op.isTeamLeader && <Crown size={13} style={{ color: COLORS.gold }} />}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-1"><Pill>{op.team}</Pill></td>
                <td className="py-2.5 px-1" style={{ color: COLORS.sub }}>{fmt(op.monthlyPlan)}</td>
                <td className="py-2.5 px-1 font-semibold" style={{ color: COLORS.ink }}>{fmt(op.sold)}</td>
                <td className="py-2.5 px-1">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(op)} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit2 size={14} style={{ color: COLORS.sub }} /></button>
                    <button onClick={() => remove(op.id)} className="p-1.5 rounded-lg hover:bg-gray-100"><Trash2 size={14} style={{ color: COLORS.danger }} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "add" ? "Yangi sotuvchi qo'shish" : "Sotuvchini tahrirlash"}>
        {modal && (
          <OperatorForm
            data={modal.data}
            isNew={modal.mode === "add"}
            lockedTeam={lockedTeam}
            showTeamLeaderToggle={!isTeamLeaderView}
            onSave={save}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </Card>
  );
}
