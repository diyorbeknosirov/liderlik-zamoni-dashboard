"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useTasks } from "@/hooks/useTasks";
import AdminTasksPanel from "@/components/admin/AdminTasksPanel";

export default function TeamTasksPage() {
  const { user } = useAuth();
  const { operators } = useData();
  const { tasks, addTask, toggleTask, removeTask } = useTasks(user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin" && !user.isTeamLeader) router.replace("/dashboard");
  }, [user, router]);

  if (!user || (user.role !== "admin" && !user.isTeamLeader)) return null;

  const teamOperators = operators.filter((o) => o.team === user.team);

  return <AdminTasksPanel operators={teamOperators} tasks={tasks} onAdd={addTask} onToggle={toggleTask} onRemove={removeTask} />;
}
