"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import OperatorsManagement from "@/components/admin/OperatorsManagement";

export default function TeamOperatorsPage() {
  const { user } = useAuth();
  const { operators } = useData();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin" && !user.isTeamLeader) router.replace("/dashboard");
  }, [user, router]);

  if (!user || (user.role !== "admin" && !user.isTeamLeader)) return null;

  return (
    <OperatorsManagement
      operators={operators}
      lockedTeam={user.team}
      isTeamLeaderView
      title={`${user.team} jamoasi a'zolari`}
    />
  );
}
