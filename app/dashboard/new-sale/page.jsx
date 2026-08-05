"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import NewSaleForm from "@/components/dashboard/NewSaleForm";

export default function NewSalePage() {
  const { user } = useAuth();
  const { operators } = useData();

  if (!user) return null;
  const isAdmin = user.role === "admin";
  const operatorId = isAdmin ? "" : user.id;

  if (!isAdmin && !operatorId) {
    return <p className="text-sm text-gray-400">Xatolik: foydalanuvchi aniqlanmadi.</p>;
  }

  return <NewSaleForm operatorId={operatorId} operators={operators} isAdmin={isAdmin} />;
}
