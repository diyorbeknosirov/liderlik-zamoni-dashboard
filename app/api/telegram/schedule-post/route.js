/**
 * app/api/telegram/schedule-post/route.js
 * ------------------------------------------
 * Dashboard'dagi "Telegram Bot" sahifasidan chaqiriladi. Admin post matnini,
 * vaqtini va tugma kerak-kerak emasligini yuborsa, shu route uni
 * channel_posts jadvaliga yozadi - keyin pg_cron o'zi vaqti kelganda yuboradi.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/telegramBot/supabaseAdmin";

export async function POST(req) {
  const body = await req.json();
  const { postText, hasButton, publishAt, createdBy } = body;

  if (!postText || !publishAt) {
    return NextResponse.json(
      { error: "postText va publishAt majburiy." },
      { status: 400 }
    );
  }

  const publishDate = new Date(publishAt);
  if (publishDate.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "Joylanish vaqti kelajakda bo'lishi kerak." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("channel_posts")
    .insert({
      post_text: postText,
      has_button: hasButton ?? true,
      publish_at: publishDate.toISOString(),
      created_by: createdBy || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, post: data });
}

export async function GET() {
  // Rejalashtirilgan (hali yuborilmagan) postlar ro'yxati
  const { data, error } = await supabaseAdmin
    .from("channel_posts")
    .select("*")
    .eq("published", false)
    .order("publish_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}
