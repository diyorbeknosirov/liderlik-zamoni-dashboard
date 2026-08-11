/**
 * app/api/telegram/generate-link-code/route.js
 * -------------------------------------------------
 * Dashboard'dagi "Profil sozlamalari" sahifasidan chaqiriladi (operator/admin
 * tizimga kirgan holda). Bir martalik kod yaratadi va Telegram botga
 * to'g'ridan-to'g'ri deep-link havolasini qaytaradi.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/telegramBot/supabaseAdmin";

const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || "LiderlikZamoniadminbot";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ ok: false, error: "Tizimga kirilmagan." }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ ok: false, error: "Sessiya yaroqsiz." }, { status: 401 });
    }

    const profileId = userData.user.id;

    // Eski ishlatilmagan kodlarni tozalaymiz
    await supabaseAdmin
      .from("telegram_link_codes")
      .delete()
      .eq("profile_id", profileId)
      .eq("used", false);

    const code = generateCode();

    const { error: insertErr } = await supabaseAdmin
      .from("telegram_link_codes")
      .insert({ code, profile_id: profileId });

    if (insertErr) throw insertErr;

    const linkUrl = `https://t.me/${BOT_USERNAME}?start=link_${code}`;

    return NextResponse.json({ ok: true, code, linkUrl });
  } catch (err) {
    console.error("generate-link-code error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Xatolik" }, { status: 500 });
  }
}
