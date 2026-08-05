import { COLORS } from "./constants";

// Reja bajarilish foizi bo'yicha rang: 0-90% qizil, 90-100% sariq, 100%+ yashil.
export function planStatusColor(pct) {
  if (pct >= 100) return COLORS.success;
  if (pct >= 90) return "#F5B301";
  return COLORS.danger;
}

export function planStatusBg(pct) {
  if (pct >= 100) return COLORS.successBg;
  if (pct >= 90) return "#FFF8E1";
  return COLORS.dangerBg;
}
