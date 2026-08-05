import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { transcribeAudio, analyzeTranscript, formatAnalysisText } from "@/lib/callAnalysis";

export const maxDuration = 300;

export async function POST(request) {
  let callId;
  try {
    const body = await request.json();
    callId = body.callId;
    if (!callId) {
      return NextResponse.json({ ok: false, error: "callId kerak." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { data: record, error: fetchErr } = await admin
      .from("call_analyses")
      .select("*")
      .eq("id", callId)
      .single();
    if (fetchErr || !record) throw new Error("Yozuv topilmadi.");

    const { data: fileData, error: downloadErr } = await admin.storage
      .from("call-recordings")
      .download(record.audio_path);
    if (downloadErr) throw downloadErr;

    const filename = record.audio_path.split("/").pop();
    const transcript = await transcribeAudio(fileData, filename);

    if (!transcript || transcript.trim().length < 5) {
      throw new Error("Transkripsiya bo'sh yoki juda qisqa chiqdi — audio sifatini tekshiring.");
    }

    // Kompaniyaning asosiy sotuv skriptini olamiz (agar mavjud bo'lsa) —
    // AI shu bilan solishtirib baholaydi.
    const { data: scriptRow } = await admin
      .from("scripts")
      .select("content")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const parsed = await analyzeTranscript(transcript, scriptRow?.content);
    const analysisText = formatAnalysisText(parsed);
    const s = parsed.scores || {};

    await admin
      .from("call_analyses")
      .update({
        transcript,
        analysis: analysisText,
        analysis_json: parsed,
        score_voice_tone: s.ovoz_toni ?? null,
        score_speech: s.nutqi ?? null,
        score_confidence: s.ishonchi ?? null,
        score_script_adherence: s.skript_bajarilishi ?? null,
        score_overall: s.umumiy_baho ?? null,
        success_rate: parsed.success_rate ?? null,
        status: "done",
      })
      .eq("id", callId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("analyze-call error:", err);
    try {
      const admin = getSupabaseAdmin();
      if (callId) {
        await admin
          .from("call_analyses")
          .update({ status: "error", error_message: err.message || "Noma'lum xatolik" })
          .eq("id", callId);
      }
    } catch {
      // ikkinchi xatoni e'tiborsiz qoldiramiz
    }
    return NextResponse.json({ ok: false, error: err.message || "Noma'lum xatolik" }, { status: 500 });
  }
}
