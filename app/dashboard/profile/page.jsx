"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import ProfileSettings from "@/components/dashboard/ProfileSettings";

export default function ProfilePage() {
  const { user, updateUser, refreshProfile } = useAuth();
  const { updateOperator } = useData();

  if (!user) return null;

  const handleSave = async (patch) => {
    await updateOperator(user.id, patch);
    updateUser(patch);
    await refreshProfile();
  };

  return <ProfileSettings user={user} onSave={handleSave} />;
}
