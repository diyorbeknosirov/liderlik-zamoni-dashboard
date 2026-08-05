import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTelegramMessage } from "@/lib/telegram";

function fmt(n) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n || 0));
}

function checkAuth(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // sozlanmagan bo'lsa, tekshiruv o'tkazilmaydi (tavsiya etilmaydi)
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function POST(request) {
  return handle(request);
}
export async function GET(request) {
  return handle(request);
}

async function handle(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ ok: false, error: "Ruxsat yo'q." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const monthPrefix = today.slice(0, 7); // YYYY-MM

    const [{ data: sales, error: salesErr }, { data: profiles, error: profErr }] = await Promise.all([
      supabase.from("sales").select("operator_id, amount, sale_date"),
      supabase.from("profiles").select("id, first_name, last_name").eq("role", "operator"),
    ]);
    if (salesErr) throw salesErr;
    if (profErr) throw profErr;

    const namesById = Object.fromEntries((profiles || []).map((p) => [p.id, `${p.first_name} ${p.last_name}`.trim()]));

    const todayByOp = {};
    let todayTotal = 0;
    let monthTotal = 0;

    (sales || []).forEach((s) => {
      const amount = Number(s.amount) || 0;
      if (s.sale_date === today) {
        todayByOp[s.operator_id] = (todayByOp[s.operator_id] || 0) + amount;
        todayTotal += amount;
      }
      if (s.sale_date?.startsWith(monthPrefix)) {
        monthTotal += amount;
      }
    });

    const opLines = Object.entries(todayByOp)
      .sort((a, b) => b[1] - a[1])
      .map(([opId, sum], i) => {
        const medal = ["🥇", "🥈", "🥉"][i] || "▪️";
        const name = namesById[opId] || "Noma'lum";
        return `${medal} ${name} — <b>${fmt(sum)} so'm</b>`;
      });

    const dateLabel = now.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });

    const lines = [
      `📊 <b>Kunlik hisobot — ${dateLabel}</b>`,
      "",
      opLines.length > 0 ? opLines.join("\n") : "Bugun hech kim sotuv kiritmadi.",
      "",
      `💰 Kunlik jami: <b>${fmt(todayTotal)} so'm</b>`,
      `📅 Oylik jami: <b>${fmt(monthTotal)} so'm</b>`,
    ];

    await sendTelegramMessage(lines.join("\n"));
    return NextResponse.json({ ok: true, todayTotal, monthTotal, operators: Object.keys(todayByOp).length });
  } catch (err) {
    console.error("Daily report error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Noma'lum xatolik" }, { status: 500 });
  }
}
