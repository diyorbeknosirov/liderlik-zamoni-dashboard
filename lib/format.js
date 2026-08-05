export function fmt(n) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n || 0));
}

export function fmtCompact(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + " mln";
  if (n >= 1000) return (n / 1000).toFixed(0) + " ming";
  return String(n);
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
