"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useCallAnalyses } from "@/hooks/useCallAnalyses";
import CallAnalysisPanel from "@/components/dashboard/CallAnalysisPanel";

export default function CallAnalysisPage() {
  const { user } = useAuth();
  const { operators } = useData();
  const { analyses, uploadAndAnalyze, removeAnalysis } = useCallAnalyses(user);

  if (!user) return null;

  return (
    <CallAnalysisPanel
      user={user}
      analyses={analyses}
      operators={operators}
      onUpload={uploadAndAnalyze}
      onRemove={removeAnalysis}
    />
  );
}
