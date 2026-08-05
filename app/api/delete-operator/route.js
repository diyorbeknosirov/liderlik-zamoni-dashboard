import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

async function verifyAuthorized(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return { ok: false, error: "Tizimga kirilmagan." };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData?.user) return { ok: false, error: "Sessiya yaroqsiz." };

  const { data: profile, error: profErr } = await userClient
    .from("profiles")
    .select("role, is_team_leader, team")
    .eq("id", userData.user.id)
    .single();

  if (profErr || !profile) return { ok: false, error: "Profil topilmadi." };

  if (profile.role === "admin") {
    return { ok: true, isAdmin: true, callerId: userData.user.id, lockedTeam: null };
  }
  if (profile.is_team_leader) {
    return { ok: true, isAdmin: false, callerId: userData.user.id, lockedTeam: profile.team };
  }
  return { ok: false, error: "Faqat admin yoki jamoa rahbari sotuvchini o'chira oladi." };
}

export async function POST(request) {
  try {
    const auth = await verifyAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: 403 });
    }

    const { operatorId } = await request.json();
    if (!operatorId) {
      return NextResponse.json({ ok: false, error: "operatorId kerak." }, { status: 400 });
    }
    if (operatorId === auth.callerId) {
      return NextResponse.json({ ok: false, error: "O'zingizni o'chira olmaysiz." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Team leader faqat o'z jamoasidagi operatorni o'chira oladi.
    if (!auth.isAdmin) {
      const { data: target } = await admin.from("profiles").select("team").eq("id", operatorId).single();
      if (!target || target.team !== auth.lockedTeam) {
        return NextResponse.json({ ok: false, error: "Bu operator sizning jamoangizga tegishli emas." }, { status: 403 });
      }
    }

    const { error } = await admin.auth.admin.deleteUser(operatorId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete-operator error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Noma'lum xatolik" }, { status: 500 });
  }
}
