// Istalgan tanlangan oy uchun operatorning to'liq maosh hisobotini
// hisoblaydi — rasmiy Liderlik Zamoni reglamenti (FIX + Komissiya +
// qo'shimcha bonuslar) + admin qo'shimcha belgilagan maxsus bonus
// qoidalari (agar mavjud bo'lsa).

import { computeLiderlikMonthlySalary } from "./liderlikSalary";
import { computeOperatorSalary } from "./customBonus";

export function computeOperatorMonthlySalary(operator, monthData, rules) {
  const official = computeLiderlikMonthlySalary(operator, monthData);
  const extra = computeOperatorSalary(operator, rules, monthData);

  return {
    ...official,
    appliedBonuses: extra.appliedBonuses,
    extraBonusTotal: extra.bonusTotal,
    total: official.totalIncome + extra.bonusTotal,
  };
}
