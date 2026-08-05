"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useScripts } from "@/hooks/useScripts";
import ScriptsManagement from "@/components/admin/ScriptsManagement";

export default function AdminScriptsPage() {
  const { user } = useAuth();
  const { scripts, addScript, updateScript, removeScript } = useScripts(user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return <ScriptsManagement scripts={scripts} onAdd={addScript} onUpdate={updateScript} onRemove={removeScript} />;
}
