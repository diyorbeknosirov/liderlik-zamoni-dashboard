"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProfile = async (authUser) => {
    if (!authUser) {
      setUser(null);
      return;
    }
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error || !profile) {
      setUser(null);
      return;
    }

    setUser({
      id: authUser.id,
      email: authUser.email,
      role: profile.role,
      isTeamLeader: !!profile.is_team_leader,
      firstName: profile.first_name,
      lastName: profile.last_name,
      team: profile.team,
      avatar: ((profile.first_name?.[0] || "") + (profile.last_name?.[0] || "")).toUpperCase() || "US",
      avatarImage: profile.avatar_url,
      monthlyPlan: profile.monthly_plan,
      fixedSalary: profile.fixed_salary,
      bonusRate: profile.bonus_rate,
    });
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      loadProfile(session?.user || null).finally(() => setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user || null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (identifier, password) => {
    // Supabase Auth email orqali ishlaydi. Agar telefon kiritilsa,
    // ilova email formatiga aylantirmaydi — shuning uchun email talab qilinadi.
    const email = identifier.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: trimmedPassword });

    if (error) {
      console.error("Login error:", error.message);
      if (error.message?.toLowerCase().includes("confirm")) {
        return { ok: false, error: "Email hali tasdiqlanmagan. Administratorga murojaat qiling." };
      }
      if (error.message?.toLowerCase().includes("invalid login credentials")) {
        return { ok: false, error: "Email yoki parol noto'g'ri. Katta-kichik harflarni va bo'shliqlarni tekshiring." };
      }
      return { ok: false, error: `Kirishda xatolik: ${error.message}` };
    }

    await loadProfile(data.user);
    router.push("/dashboard");
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  const updateUser = (patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await loadProfile(session?.user || null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
