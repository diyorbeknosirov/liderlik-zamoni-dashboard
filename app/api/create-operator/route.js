import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// So'rovni yuborgan foydalanuvchi admin yoki team leader ekanligini tekshiradi.
// Team leader bo'lsa, uning jamoasi qaytariladi (yangi a'zo shu jamoaga qo'shiladi).
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
    return { ok: true, isAdmin: true, lockedTeam: null };
  }
  if (profile.is_team_leader) {
    return { ok: true, isAdmin: false, lockedTeam: profile.team };
  }
  return { ok: false, error: "Faqat admin yoki jamoa rahbari yangi sotuvchi qo'sha oladi." };
}

export async function POST(request) {
  try {
    const auth = await verifyAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: 403 });
    }

    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();
    const { firstName, lastName, monthlyPlan, fixedSalary, bonusRate } = body;
    // Team leader faqat o'z jamoasiga qo'sha oladi — team majburan shu qiymatga tenglashtiriladi.
    const team = auth.isAdmin ? (body.team || "Kunduzgi") : auth.lockedTeam;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ ok: false, error: "Barcha maydonlarni to'ldiring." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Yangi hisobni yaratamiz — email darhol tasdiqlangan holda (email tekshiruvi kerak emas).
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "operator", first_name: firstName, last_name: lastName },
    });
    if (createErr) throw createErr;

    // Trigger avtomatik profil yaratadi; endi qo'shimcha maydonlarni to'ldiramiz.
    const { error: updateErr } = await admin
      .from("profiles")
      .update({
        team,
        monthly_plan: Number(monthlyPlan) || 0,
        fixed_salary: Number(fixedSalary) || 0,
        bonus_rate: Number(bonusRate) || 0.07,
      })
      .eq("id", created.user.id);
    if (updateErr) throw updateErr;

    return NextResponse.json({ ok: true, id: created.user.id });
  } catch (err) {
    console.error("create-operator error:", err);
    const message = err.message?.includes("already been registered")
      ? "Bu email allaqachon ro'yxatdan o'tgan."
      : err.message || "Noma'lum xatolik";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
