// SERVER-ONLY yordamchi. OpenAI API kaliti maxfiy bo'lgani uchun bu faylni
// hech qachon client komponentda import qilmang.

export async function transcribeAudio(audioBlob, filename) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY sozlanmagan.");

  const formData = new FormData();
  formData.append("file", audioBlob, filename);
  formData.append("model", "whisper-1");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Whisper transkripsiya xatosi: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.text;
}

export async function analyzeTranscript(transcript, scriptContent) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY sozlanmagan.");

  const scriptSection = scriptContent
    ? `\n\nKompaniyaning rasmiy sotuv skripti (shu bilan solishtirib bahoing):\n"""\n${scriptContent}\n"""`
    : "\n\n(Rasmiy skript berilmagan — umumiy sotuv andozalariga ko'ra baholang, skript_bajarilishi uchun umumiy professional suhbat tuzilishini asos qiling.)";

  const prompt = `Siz tajribali sotuv bo'yicha auditor va murabbiysiz. Quyida sotuvchi va mijoz
o'rtasidagi qo'ng'iroq transkripsiyasi berilgan (nutqdan matnga aylantirilgan, xatolar
bo'lishi mumkin). Shu asosida QAT'IY JSON formatida javob bering — hech qanday qo'shimcha
matn, izoh, yoki markdown belgisi qo'shmang, FAQAT quyidagi tuzilishdagi JSON qaytaring,
barcha matn maydonlari o'zbek tilida bo'lsin:

{
  "scores": {
    "ovoz_toni": <1 dan 10 gacha butun son>,
    "nutqi": <1 dan 10 gacha butun son>,
    "ishonchi": <1 dan 10 gacha butun son>,
    "skript_bajarilishi": <1 dan 10 gacha butun son>,
    "umumiy_baho": <1 dan 10 gacha butun son>
  },
  "success_rate": <0 dan 100 gacha son — ushbu qo'ng'iroqning sotuvga aylanish ehtimoli foizda>,
  "qisqacha_xulosa": "<2-3 gap>",
  "yaxshi_tomonlar": ["...", "..."],
  "xatolari": ["...", "..."],
  "nega_sota_olmagan": "<agar sotuv bo'lmagan bo'lsa aniq sabab; sotuv muvaffaqiyatli bo'lgan bo'lsa 'Sotuv amalga oshdi' deb yozing>",
  "sotish_uchun_maslahat": "<keyingi safar sotuvchi nima deyishi/qilishi kerakligi, aniq va amaliy>",
  "swot": {
    "kuchli_tomonlar": ["..."],
    "zaif_tomonlar": ["..."],
    "imkoniyatlar": ["..."],
    "tahdidlar": ["..."]
  },
  "keyingi_qadam": "<tavsiya etiladigan aniq keyingi harakat>"
}

Baholash mezonlari:
- ovoz_toni: sotuvchining ovoz ohangi, tabiiyligi, energiyasi, samimiyligi
- nutqi: aniq va tushunarli gapirishi, tez-sekinligi, so'z boyligi
- ishonchi: qat'iyat, tortinmasdan gapirishi, mahsulot/kursga ishonchi
- skript_bajarilishi: berilgan (yoki umumiy) skript bosqichlariga qanchalik amal qilgani
- umumiy_baho: barcha omillar asosida yakuniy, xolis, qat'iy baho (faqat "yaxshi ko'rinish"
  uchun emas, real natijaga qarab baholang)${scriptSection}

Transkripsiya:
"""
${transcript}
"""`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Tahlil xatosi: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw = data.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI javobini o'qib bo'lmadi (JSON format xato).");
  }
  return parsed;
}

// AI'dan kelgan JSON'ni foydalanuvchiga ko'rsatiladigan o'qish qulay matnga aylantiradi.
export function formatAnalysisText(parsed) {
  const s = parsed.scores || {};
  const lines = [];

  lines.push(`## Baholar (1-10)`);
  lines.push(`- Ovoz toni: ${s.ovoz_toni ?? "—"}/10`);
  lines.push(`- Nutqi: ${s.nutqi ?? "—"}/10`);
  lines.push(`- Ishonchi: ${s.ishonchi ?? "—"}/10`);
  lines.push(`- Skript bajarilishi: ${s.skript_bajarilishi ?? "—"}/10`);
  lines.push(`- **Umumiy baho: ${s.umumiy_baho ?? "—"}/10**`);
  lines.push("");
  lines.push(`## Sotuv ehtimoli (Success rate): ${parsed.success_rate ?? "—"}%`);
  lines.push("");
  lines.push(`## Qisqacha xulosa`);
  lines.push(parsed.qisqacha_xulosa || "—");
  lines.push("");
  lines.push(`## Yaxshi tomonlar`);
  (parsed.yaxshi_tomonlar || []).forEach((t) => lines.push(`- ${t}`));
  lines.push("");
  lines.push(`## Xatolari`);
  (parsed.xatolari || []).forEach((t) => lines.push(`- ${t}`));
  lines.push("");
  lines.push(`## Nega sota olmadi / Sotuv holati`);
  lines.push(parsed.nega_sota_olmagan || "—");
  lines.push("");
  lines.push(`## Sotish uchun maslahat`);
  lines.push(parsed.sotish_uchun_maslahat || "—");
  lines.push("");
  lines.push(`## SWOT tahlili`);
  lines.push(`**Kuchli tomonlar:**`);
  (parsed.swot?.kuchli_tomonlar || []).forEach((t) => lines.push(`- ${t}`));
  lines.push(`**Zaif tomonlar:**`);
  (parsed.swot?.zaif_tomonlar || []).forEach((t) => lines.push(`- ${t}`));
  lines.push(`**Imkoniyatlar:**`);
  (parsed.swot?.imkoniyatlar || []).forEach((t) => lines.push(`- ${t}`));
  lines.push(`**Tahdidlar:**`);
  (parsed.swot?.tahdidlar || []).forEach((t) => lines.push(`- ${t}`));
  lines.push("");
  lines.push(`## Keyingi qadam`);
  lines.push(parsed.keyingi_qadam || "—");

  return lines.join("\n");
}
