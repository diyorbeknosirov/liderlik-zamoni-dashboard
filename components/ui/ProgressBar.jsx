import { COLORS } from "@/lib/constants";

export default function ProgressBar({ percent, color = COLORS.primary, height = 10 }) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full rounded-full bg-gray-100 overflow-hidden" style={{ height }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p}%`, background: color }} />
    </div>
  );
}
