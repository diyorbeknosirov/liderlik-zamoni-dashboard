"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useLeadStats } from "@/hooks/useLeadStats";
import AnalyticsTable from "@/components/admin/AnalyticsTable";

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const { operators } = useData();
  const { stats: leadStats } = useLeadStats(user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;
  return <AnalyticsTable operators={operators} leadStats={leadStats} />;
}
