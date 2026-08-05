// Umumiy yordamchi funksiyalar — davomat va lid/konversiya hisoblash.
// Qattiq belgilangan bonus miqdorlari endi lib/customBonus.js orqali,
// admin o'zi belgilaydigan qoidalar asosida hisoblanadi.

const CHECK_IN_DEADLINE_MIN = 10 * 60 + 10; // 10:10 — hamma uchun bir xil

export function isCheckInOnTime(startedAt) {
  if (!startedAt) return false;
  const d = new Date(startedAt);
  const minutes = d.getHours() * 60 + d.getMinutes();
  return minutes <= CHECK_IN_DEADLINE_MIN;
}

// Lid statistikasi qatorlaridan umumiy lid, "won" (yutilgan) va
// konversiyani hisoblaydi — yangi voronka bosqichlari asosida.
export function computeLeadTotals(leadStats) {
  let stageLeads = 0;
  let totalWon = 0;
  let totalLost = 0;
  (leadStats || []).forEach((r) => {
    stageLeads += (r.yangi_lid || 0) + (r.qayta_aloqa || 0) + (r.aloqa_ornatildi || 0)
      + (r.malumot_berildi || 0) + (r.demoga_yozildi || 0) + (r.demoga_keladi || 0)
      + (r.shartnoma || 0) + (r.won || 0);
    totalWon += r.won || 0;
    totalLost += (r.lost_sabab_nomalum || 0) + (r.lost_qimmat || 0) + (r.lost_nedozvon || 0)
      + (r.lost_kerak_emas || 0) + (r.lost_dubl || 0) + (r.lost_adashib_otgan || 0)
      + (r.lost_kontaktda_xatolik || 0) + (r.lost_hozir_emas || 0);
  });
  // Umumiy lid — voronka bosqichlari + lost (otkaz ham lid hisoblanadi).
  const totalLeads = stageLeads + totalLost;
  const conversionRate = totalLeads ? (totalWon / totalLeads) * 100 : 0;
  return { totalLeads, totalSales: totalWon, totalRejections: totalLost, conversionRate };
}
