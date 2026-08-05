// "Liderlik Zamoni" rasmiy oylik daromad reglamenti — to'liq avtomatik
// hisoblash. Har bir ish kuni 4 ta ko'rsatkich (Davomat, Call Time, CRM
// nazorati, Trening) tekshiriladi, so'ngra oylik Sotuv KPI (bosqichli
// komissiya) va qo'shimcha bonuslar qo'shiladi.

// ---- 1. FIX kunlik ko'rsatkichlar (har biri kuniga alohida hisoblanadi) ----
export const ATTENDANCE_BONUS = 20000;
export const ATTENDANCE_PENALTY = -20000;
export const CALLTIME_BONUS = 25000;
export const CALLTIME_PENALTY = -25000;
export const CRM_BONUS = 15000;
export const CRM_PENALTY = -15000;
export const TRAINING_BONUS = 10000;
export const TRAINING_PENALTY = -10000;
export const MAX_DAILY_FIX = ATTENDANCE_BONUS + CALLTIME_BONUS + CRM_BONUS + TRAINING_BONUS; // 70 000

// ---- 2. Qo'shimcha bonuslar ----
export const DAILY_SALES_BONUS = 100000;       // 1-3 ta to'liq to'lov/kun
export const DEMO_BONUS_PER_CLIENT = 10000;
export const CONSULTATION_REFERRAL_BONUS = 70000;

// ---- 3. Sotuv KPI (komissiya) — oylik umumiy sotuv aylanmasiga qarab ----
export const COMMISSION_TIERS = [
  { min: 0, max: 29_000_000, rate: 0.00, label: "0 – 29 mln" },
  { min: 30_000_000, max: 39_000_000, rate: 0.01, label: "30 – 39 mln" },
  { min: 40_000_000, max: 59_000_000, rate: 0.02, label: "40 – 59 mln" },
  { min: 60_000_000, max: 69_000_000, rate: 0.03, label: "60 – 69 mln" },
  { min: 70_000_000, max: 89_000_000, rate: 0.04, label: "70 – 89 mln" },
  { min: 90_000_000, max: 109_000_000, rate: 0.05, label: "90 – 109 mln" },
  { min: 110_000_000, max: 129_000_000, rate: 0.06, label: "110 – 129 mln" },
  { min: 130_000_000, max: 149_000_000, rate: 0.07, label: "130 – 149 mln" },
  { min: 150_000_000, max: 179_000_000, rate: 0.08, label: "150 – 179 mln" },
  { min: 180_000_000, max: 199_000_000, rate: 0.09, label: "180 – 199 mln" },
  { min: 200_000_000, max: Infinity, rate: 0.10, label: "200 mln+" },
];

export function commissionRateFor(amount) {
  const tier = COMMISSION_TIERS.find((t) => amount >= t.min && amount <= t.max);
  return (tier || COMMISSION_TIERS[COMMISSION_TIERS.length - 1]).rate;
}

// ---- Kunlik ko'rsatkich ballari ----

// Ish vaqti: 09:30–19:00. 09:30–10:00 — trening/tayyorgarlik.
// 09:30–09:40: +20 000 | 09:40–10:00: 0 (neytral) | 10:00 dan keyin: −20 000
export function attendanceScore(startedAt) {
  if (!startedAt) return null; // o'sha kuni check-in bo'lmagan — kunni hisobga olmaymiz
  const d = new Date(startedAt);
  const minutes = d.getHours() * 60 + d.getMinutes();
  if (minutes <= 9 * 60 + 40) return ATTENDANCE_BONUS;
  if (minutes <= 10 * 60) return 0;
  return ATTENDANCE_PENALTY;
}

// 0–89 daqiqa: −25 000 | 90–149 daqiqa: 0 | 150+ daqiqa: +25 000
export function callTimeScore(minutes) {
  if (minutes >= 150) return CALLTIME_BONUS;
  if (minutes >= 90) return 0;
  return CALLTIME_PENALTY;
}

export function crmScore(crmOk) {
  if (crmOk === true) return CRM_BONUS;
  if (crmOk === false) return CRM_PENALTY;
  return 0; // hali baholanmagan
}

export function trainingScore(trainingOk) {
  if (trainingOk === true) return TRAINING_BONUS;
  if (trainingOk === false) return TRAINING_PENALTY;
  return 0; // hali baholanmagan
}

// ---- To'liq oylik hisobot ----
export function computeLiderlikMonthlySalary(operator, monthData) {
  const { sales = [], workSessions = [], amocrmLogs = [], dailyCriteria = [] } = monthData;

  const operatorSales = sales.filter((s) => s.operator_id === operator.id);
  const confirmedSales = operatorSales.filter((s) => s.status === "Tasdiqlangan");
  const referralSales = confirmedSales.filter((s) => s.is_consultation_referral);
  const commissionSales = confirmedSales.filter((s) => !s.is_consultation_referral);

  // --- Sotuv KPI (komissiya) ---
  const soldForCommission = commissionSales.reduce((s, x) => s + Number(x.amount), 0);
  const commissionRate = commissionRateFor(soldForCommission);
  const commission = Math.round(soldForCommission * commissionRate);

  // --- Konsultatsiya rag'batlantirish puli ---
  const referralBonus = referralSales.length * CONSULTATION_REFERRAL_BONUS;

  // --- Kunlik FIX hisob-kitobi ---
  const opSessions = workSessions.filter((s) => s.operator_id === operator.id);
  const callSecondsByDay = {};
  amocrmLogs.filter((l) => l.operator_id === operator.id).forEach((l) => {
    callSecondsByDay[l.call_date] = (callSecondsByDay[l.call_date] || 0) + (Number(l.duration_seconds) || 0);
  });
  const criteriaByDay = {};
  dailyCriteria.filter((c) => c.operator_id === operator.id).forEach((c) => {
    criteriaByDay[c.work_date] = c;
  });

  let fixTotal = 0;
  const dailyBreakdown = [];

  opSessions.forEach((session) => {
    const day = session.work_date;
    const att = attendanceScore(session.started_at);
    if (att === null) return; // check-in bo'lmagan kun hisobga kirmaydi

    const callMin = Math.round((callSecondsByDay[day] || 0) / 60);
    const call = callTimeScore(callMin);
    const crit = criteriaByDay[day];
    const crm = crmScore(crit?.crm_ok ?? null);
    const training = trainingScore(crit?.training_ok ?? null);
    const dayTotal = att + call + crm + training;
    fixTotal += dayTotal;
    dailyBreakdown.push({ day, att, callMin, call, crm, training, dayTotal });
  });

  // --- Kunlik sotuv bonusi (1-3 ta to'liq to'lov/kun) ---
  const salesCountByDay = {};
  commissionSales.forEach((s) => {
    salesCountByDay[s.sale_date] = (salesCountByDay[s.sale_date] || 0) + 1;
  });
  let dailySalesBonusTotal = 0;
  let bonusDaysCount = 0;
  Object.values(salesCountByDay).forEach((count) => {
    if (count >= 1 && count <= 3) {
      dailySalesBonusTotal += DAILY_SALES_BONUS;
      bonusDaysCount += 1;
    }
  });

  // --- Demo bonusi ---
  const demoTotal = dailyCriteria
    .filter((c) => c.operator_id === operator.id)
    .reduce((s, c) => s + (Number(c.demo_count) || 0), 0);
  const demoBonus = demoTotal * DEMO_BONUS_PER_CLIENT;

  const totalIncome = fixTotal + commission + dailySalesBonusTotal + demoBonus + referralBonus;

  return {
    fixTotal,
    dailyBreakdown,
    workedDays: dailyBreakdown.length,
    soldForCommission,
    commissionRate,
    commission,
    dailySalesBonusTotal,
    bonusDaysCount,
    demoTotal,
    demoBonus,
    referralCount: referralSales.length,
    referralBonus,
    totalIncome,
  };
}
