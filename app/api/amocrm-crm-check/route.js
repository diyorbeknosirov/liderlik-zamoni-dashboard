import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { evaluateCrmCompliance } from "@/lib/amocrmTasks";

function checkAuth(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
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
    const admin = getSupabaseAdmin();

    const { data: operators, error } = await admin
      .from("profiles")
      .select("id, amocrm_user_id")
      .eq("role", "operator")
      .not("amocrm_user_id", "is", null);
    if (error) throw error;

    const today = todayStr();
    const results = [];

    for (const op of operators || []) {
      try {
        const evaluation = await evaluateCrmCompliance(op.amocrm_user_id);

        const { data: existing } = await admin
          .from("daily_criteria")
          .select("id")
          .eq("operator_id", op.id)
          .eq("work_date", today)
          .maybeSingle();

        if (existing) {
          await admin.from("daily_criteria").update({ crm_ok: evaluation.compliant, updated_at: new Date().toISOString() }).eq("id", existing.id);
        } else {
          await admin.from("daily_criteria").insert({ operator_id: op.id, work_date: today, crm_ok: evaluation.compliant });
        }

        results.push({ operatorId: op.id, ...evaluation });
      } catch (opErr) {
        results.push({ operatorId: op.id, error: opErr.message });
      }
    }

    return NextResponse.json({ ok: true, checked: results.length, results });
  } catch (err) {
    console.error("amocrm-crm-check error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Noma'lum xatolik" }, { status: 500 });
  }
}
