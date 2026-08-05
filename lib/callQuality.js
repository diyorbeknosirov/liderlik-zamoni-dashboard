// Qo'ng'iroq sifati reytingi asosida bonus/ogohlantirish darajalari.

export const CALL_QUALITY_BONUS_HIGH = 500000; // 8-10 baho
export const CALL_QUALITY_BONUS_MID = 250000;  // 5-8 baho

export function callQualityTier(avgScore) {
  if (avgScore == null) return { tier: "none", bonus: 0, label: "Ma'lumot yo'q", tone: "default" };
  if (avgScore >= 8) return { tier: "high", bonus: CALL_QUALITY_BONUS_HIGH, label: "A'lo", tone: "success" };
  if (avgScore >= 5) return { tier: "mid", bonus: CALL_QUALITY_BONUS_MID, label: "Yaxshi", tone: "primary" };
  if (avgScore >= 3) return { tier: "warning", bonus: 0, label: "Ogohlantirish", tone: "danger" };
  return { tier: "severe", bonus: 0, label: "Jiddiy ogohlantirish", tone: "danger" };
}

function monthPrefix(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return d.toISOString().slice(0, 7);
}

// Operatorning berilgan oy (offset=0 joriy oy, 1 o'tgan oy) uchun
// o'rtacha qo'ng'iroq bahosini hisoblaydi.
export function computeOperatorCallRating(analyses, operatorId, monthOffset = 0) {
  const prefix = monthPrefix(monthOffset);
  const done = (analyses || []).filter(
    (a) => a.operator_id === operatorId && a.status === "done" && a.score_overall != null && a.created_at?.slice(0, 7) === prefix
  );
  if (done.length === 0) return { avgScore: null, count: 0, ...callQualityTier(null) };
  const avgScore = done.reduce((s, a) => s + a.score_overall, 0) / done.length;
  return { avgScore, count: done.length, ...callQualityTier(avgScore) };
}

// Agar operator joriy VA o'tgan oyda ham "jiddiy ogohlantirish" (0-3) darajasida
// bo'lsa — bu ishdan bo'shatish tavsiyasini bildiradi (qaror admin qo'lida).
export function needsDismissalWarning(analyses, operatorId) {
  const current = computeOperatorCallRating(analyses, operatorId, 0);
  const previous = computeOperatorCallRating(analyses, operatorId, 1);
  return current.tier === "severe" && previous.tier === "severe";
}
