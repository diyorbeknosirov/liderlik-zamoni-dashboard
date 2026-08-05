"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import OperatorsManagement from "@/components/admin/OperatorsManagement";

export default function AdminOperatorsPage() {
  const { user } = useAuth();
  const { operators } = useData();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;
  return <OperatorsManagement operators={operators} />;
}
