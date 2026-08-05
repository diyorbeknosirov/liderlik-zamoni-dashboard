"use client";

import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import TasksPanel from "@/components/dashboard/TasksPanel";

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, addTask, toggleTask, removeTask } = useTasks(user);

  if (!user) return null;

  return <TasksPanel user={user} tasks={tasks} onAdd={addTask} onToggle={toggleTask} onRemove={removeTask} />;
}
