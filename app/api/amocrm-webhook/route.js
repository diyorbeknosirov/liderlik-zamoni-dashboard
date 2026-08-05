import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// AmoCRM'ning haqiqiy qo'ng'iroq webhook formati:
// contacts.note.0.note (yoki leads.note / companies.note) ichida keladi.
// Qo'ng'iroqning o'zi haqidagi ma'lumot (DURATION va h.k.) "text" maydoni
// ichida YANA BIR JSON MATN sifatida keladi — uni alohida JSON.parse
// qilish kerak.
//
// MUHIM: note_type kodi kiruvchi/chiquvchi qo'ng'iroqlar uchun farq
// qilishi mumkin (masalan "10" va "11"), shuning uchun note_type kodiga
// tayanmaymiz — buning o'rniga "text" ichida DURATION maydoni bor-yo'qligi
// orqali "bu qo'ng'iroqmi" ekanligini aniqlaymiz. Bu ancha ishonchli.
//
// Masalan: note.text = '{"SRC":"moizvonkiru","DURATION":216,"PHONE":"+998..."}'
// Foydalanuvchi (xodim) ID'si: note.main_user_id yoki note.created_by

function parseNestedFormData(formData) {
  const result = {};
  for (const [key, value] of formData.entries()) {
    const parts = key.replace(/\]/g, "").split("[");
    let node = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!node[part]) node[part] = {};
      node = node[part];
    }
    node[parts[parts.length - 1]] = value;
  }
  return result;
}

function extractCandidateNotes(parsed) {
  const entityGroups = ["contacts", "leads", "companies"];
  const notes = [];
  entityGroups.forEach((group) => {
    const noteGroup = parsed?.[group]?.note;
    if (!noteGroup) return;
    Object.values(noteGroup).forEach((item) => {
      const note = item?.note;
      if (note) notes.push(note);
    });
  });
  return notes;
}

function tryParseCallData(text) {
  try {
    const data = JSON.parse(text);
    if (data && typeof data.DURATION !== "undefined") return data;
    return null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const parsed = parseNestedFormData(formData);
    const admin = getSupabaseAdmin();

    const candidateNotes = extractCandidateNotes(parsed);
    const callRecords = [];
    candidateNotes.forEach((note) => {
      const callData = tryParseCallData(note.text || "");
      if (callData) callRecords.push({ note, callData });
    });

    if (callRecords.length === 0) {
      // Qo'ng'iroq ma'lumoti topilmadi (ehtimol oddiy matn izohi edi) —
      // shunchaki e'tiborsiz qoldiramiz, xatolik emas.
      return NextResponse.json({ ok: true, note: "no_call_data_in_payload" });
    }

    for (const { note, callData } of callRecords) {
      const durationSeconds = Number(callData.DURATION) || 0;
      const amocrmUserId = note.main_user_id || note.created_by || null;
      const callDate = note.created_at
        ? new Date(Number(note.created_at) * 1000).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      let operatorId = null;
      if (amocrmUserId) {
        const { data: op } = await admin
          .from("profiles")
          .select("id")
          .eq("amocrm_user_id", String(amocrmUserId))
          .maybeSingle();
        operatorId = op?.id || null;
      }

      await admin.from("amocrm_call_logs").insert({
        operator_id: operatorId,
        amocrm_user_id: amocrmUserId ? String(amocrmUserId) : null,
        call_date: callDate,
        duration_seconds: durationSeconds,
        raw_payload: { note, callData },
      });
    }

    return NextResponse.json({ ok: true, processed: callRecords.length });
  } catch (err) {
    console.error("amocrm-webhook error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "amoCRM webhook endpoint ishlayapti" });
}
