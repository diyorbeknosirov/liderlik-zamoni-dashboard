"use client";

import { useAuth } from "@/context/AuthContext";
import { useScripts } from "@/hooks/useScripts";
import ScriptsViewer from "@/components/dashboard/ScriptsViewer";

export default function ScriptsPage() {
  const { user } = useAuth();
  const { scripts } = useScripts(user);

  if (!user) return null;
  return <ScriptsViewer scripts={scripts} />;
}
