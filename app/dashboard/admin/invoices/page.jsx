"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import InvoicesTable from "@/components/admin/InvoicesTable";

export default function AdminInvoicesPage() {
  const { user } = useAuth();
  const { invoices, operators } = useData();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;
  return <InvoicesTable invoices={invoices} operators={operators} />;
}
