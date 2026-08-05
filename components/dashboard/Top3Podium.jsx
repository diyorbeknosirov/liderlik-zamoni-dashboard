import { Trophy, Crown, Medal } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";

function PodiumCard({ operator, rank }) {
  const cfg = {
    1: { bg: COLORS.goldBg, border: COLORS.goldBorder, icon: Crown, iconColor: COLORS.gold, label: "1-o'rin" },
    2: { bg: COLORS.silverBg, border: COLORS.silverBorder, icon: Medal, iconColor: COLORS.silver, label: "2-o'rin" },
    3: { bg: COLORS.bronzeBg, border: COLORS.bronzeBorder, icon: Medal, iconColor: COLORS.bronze, label: "3-o'rin" },
  }[rank];
  const Icon = cfg.icon;
  const pct = Math.min(100, (operator.sold / operator.monthlyPlan) * 100);

  return (
    <div
      className={`relative flex flex-col items-center text-center rounded-2xl border-2 px-3 py-4 ${rank === 1 ? "sm:-translate-y-2" : ""}`}
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <Icon size={rank === 1 ? 26 : 20} style={{ color: cfg.iconColor }} className="mb-1" />
      <Avatar initials={operator.avatar} src={operator.avatarImage} size={rank === 1 ? 56 : 46} ring={cfg.border} />
      <p className="mt-2 font-bold text-sm truncate max-w-full" style={{ color: COLORS.ink }}>
        {operator.firstName} {operator.lastName}
      </p>
      <p className="text-xs font-semibold" style={{ color: cfg.iconColor }}>{cfg.label}</p>
      <p className="text-sm font-extrabold mt-1.5" style={{ color: COLORS.ink }}>{fmt(operator.sold)} so'm</p>
      <p className="text-[11px]" style={{ color: COLORS.sub }}>{pct.toFixed(0)}% bajarildi</p>
    </div>
  );
}

export default function Top3Podium({ operators }) {
  const top3 = [...operators].sort((a, b) => b.sold - a.sold).slice(0, 3);
  return (
    <Card className="p-4 sm:p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} style={{ color: COLORS.gold }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Eng kuchli Top-3</h3>
      </div>
      <div className="grid grid-cols-3 gap-2.5 items-end">
        {top3[1] && <PodiumCard operator={top3[1]} rank={2} />}
        {top3[0] && <PodiumCard operator={top3[0]} rank={1} />}
        {top3[2] && <PodiumCard operator={top3[2]} rank={3} />}
      </div>
    </Card>
  );
}
