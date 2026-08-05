"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useCallAnalyses } from "@/hooks/useCallAnalyses";
import CallQualityRanking from "@/components/admin/CallQualityRanking";

export default function CallQualityPage() {
  const { user } = useAuth();
  const { operators } = useData();
  const { analyses } = useCallAnalyses(user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return <CallQualityRanking operators={operators} analyses={analyses} />;
}
