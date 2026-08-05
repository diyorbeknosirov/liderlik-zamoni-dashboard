import { COLORS } from "@/lib/constants";

export default function Pill({ children, tone = "default" }) {
  const tones = {
    default: { bg: "#F3F4F6", color: COLORS.sub },
    success: { bg: COLORS.successBg, color: COLORS.success },
    danger: { bg: COLORS.dangerBg, color: COLORS.danger },
    primary: { bg: COLORS.primaryLight, color: COLORS.primary },
  };
  const t = tones[tone];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: t.bg, color: t.color }}
    >
      {children}
    </span>
  );
}
