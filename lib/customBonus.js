// Admin o'zi yaratadigan, tahrirlaydigan va o'chira oladigan bonus
// qoidalari tizimi. Har bir qoida: nom + o'lchov mezoni (metric) +
// shart (>= / <= / oraliq) + bonus turi (belgilangan summa yoki foiz).

import { isCheckInOnTime, computeLeadTotals } from "./salary";

export const METRICS = [
  { value: "sales_amount", label: "Sotuv summasi (oylik, so'm)" },
  { value: "customers_brought", label: "Olib kelingan mijozlar soni" },
  { value: "conversion_rate", label: "Konversiya foizi (%)" },
  { value: "attendance_days", label: "O'z vaqtida kelgan kunlar soni" },
  { value: "call_minutes", label: "Qo'ng'iroq daqiqasi (AmoCRM, oylik)" },
  { value: "call_quality_score", label: "Qo'ng'iroq sifati o'rtacha bahosi (1-10)" },
];

export const COMPARISONS = [
  { value: ">=", label: "kattaroq yoki teng (>=)" },
  { value: "<=", label: "kichikroq yoki teng (<=)" },
  { value: "between", label: "oraliqda" },
];

export function metricLabel(metric) {
  return METRICS.find((m) => m.value === metric)?.label || metric;
}

// Berilgan oylik ma'lumotlar (monthData) asosida, bitta operator uchun
// bitta mezonning qiymatini hisoblaydi.
export function computeMetricValue(operator, metric, monthData) {
  const { sales = [], workSessions = [], leadStats = [], amocrmLogs = [], callAnalyses = [] } = monthData;

  switch (metric) {
    case "sales_amount": {
      const opSales = sales.filter((s) => s.operator_id === operator.id);
      return opSales.reduce((sum, s) => sum + Number(s.amount), 0);
    }
    case "customers_brought": {
      const opSales = sales.filter((s) => s.operator_id === operator.id && s.status === "Tasdiqlangan");
      return opSales.length;
    }
    case "conversion_rate": {
      const opStats = leadStats.filter((s) => s.operator_id === operator.id);
      return computeLeadTotals(opStats).conversionRate;
    }
    case "attendance_days": {
      const opSessions = workSessions.filter((s) => s.operator_id === operator.id);
      return opSessions.filter((s) => isCheckInOnTime(s.started_at)).length;
    }
    case "call_minutes": {
      const opLogs = amocrmLogs.filter((l) => l.operator_id === operator.id);
      const totalSeconds = opLogs.reduce((sum, l) => sum + (Number(l.duration_seconds) || 0), 0);
      return Math.round(totalSeconds / 60);
    }
    case "call_quality_score": {
      const opAnalyses = callAnalyses.filter(
        (a) => a.operator_id === operator.id && a.status === "done" && a.score_overall != null
      );
      if (opAnalyses.length === 0) return 0;
      return opAnalyses.reduce((sum, a) => sum + a.score_overall, 0) / opAnalyses.length;
    }
    default:
      return 0;
  }
}

export function ruleApplies(rule, value) {
  if (rule.comparison === ">=") return value >= Number(rule.threshold_min);
  if (rule.comparison === "<=") return value <= Number(rule.threshold_min);
  if (rule.comparison === "between") {
    const max = rule.threshold_max != null ? Number(rule.threshold_max) : Infinity;
    return value >= Number(rule.threshold_min) && value <= max;
  }
  return false;
}

export function computeRuleBonus(rule, value) {
  if (!ruleApplies(rule, value)) return 0;
  if (rule.amount_type === "percentage") {
    return Math.round(value * (Number(rule.amount) / 100));
  }
  return Number(rule.amount);
}

// Operator uchun barcha faol qoidalarni tekshirib, qo'llanadigan
// bonuslarni va ularning jamini qaytaradi.
export function computeOperatorBonuses(operator, rules, monthData) {
  const applied = [];
  let total = 0;

  (rules || []).filter((r) => r.active).forEach((rule) => {
    const value = computeMetricValue(operator, rule.metric, monthData);
    const bonus = computeRuleBonus(rule, value);
    if (bonus > 0) {
      applied.push({ rule, value, bonus });
      total += bonus;
    }
  });

  return { applied, total };
}

// Fiksa baza + barcha qo'llanadigan bonuslar = umumiy oylik daromad.
export function computeOperatorSalary(operator, rules, monthData) {
  const { applied, total: bonusTotal } = computeOperatorBonuses(operator, rules, monthData);
  const base = operator.fixedSalary || 0;
  return { base, appliedBonuses: applied, bonusTotal, total: base + bonusTotal };
}
