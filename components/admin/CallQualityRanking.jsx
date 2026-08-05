"use client";

import { Award, AlertTriangle } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import { computeOperatorCallRating, needsDismissalWarning } from "@/lib/callQuality";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";

export default function CallQualityRanking({ operators, analyses }) {
  const rows = operators
    .map((op) => {
      const rating = computeOperatorCallRating(analyses, op.id, 0);
      const dismissalWarning = needsDismissalWarning(analyses, op.id);
      return { op, rating, dismissalWarning };
    })
    .sort((a, b) => (b.rating.avgScore || 0) - (a.rating.avgScore || 0));

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award size={18} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Qo'ng'iroq sifati reytingi (joriy oy)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left" style={{ color: COLORS.sub }}>
              <th className="py-2 px-1 font-medium">#</th>
              <th className="py-2 px-1 font-medium">Xodim</th>
              <th className="py-2 px-1 font-medium">Tahlil qilingan qo'ng'iroqlar</th>
              <th className="py-2 px-1 font-medium">O'rtacha baho</th>
              <th className="py-2 px-1 font-medium">Holat</th>
              <th className="py-2 px-1 font-medium">Bonus</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ op, rating, dismissalWarning }, i) => (
              <tr key={op.id} className="border-t" style={{ borderColor: COLORS.border }}>
                <td className="py-2.5 px-1 font-bold" style={{ color: COLORS.sub }}>{i + 1}</td>
                <td className="py-2.5 px-1">
                  <div className="flex items-center gap-2">
                    <Avatar initials={op.avatar} src={op.avatarImage} size={28} />
                    <span className="font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{op.firstName} {op.lastName}</span>
                  </div>
                </td>
                <td className="py-2.5 px-1" style={{ color: COLORS.sub }}>{rating.count}</td>
                <td className="py-2.5 px-1 font-bold" style={{ color: COLORS.ink }}>
                  {rating.avgScore != null ? rating.avgScore.toFixed(1) : "—"}
                </td>
                <td className="py-2.5 px-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Pill tone={rating.tone}>{rating.label}</Pill>
                    {dismissalWarning && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: COLORS.danger }}>
                        <AlertTriangle size={12} /> 2 oy ketma-ket past!
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-1 font-semibold whitespace-nowrap" style={{ color: rating.bonus > 0 ? COLORS.success : COLORS.sub }}>
                  {rating.bonus > 0 ? `+${fmt(rating.bonus)} so'm` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs space-y-1" style={{ color: COLORS.sub }}>
        <p>• 8-10 baho: +500 000 so'm bonus</p>
        <p>• 5-8 baho: +250 000 so'm bonus</p>
        <p>• 3-5 baho: qat'iy ogohlantirish + qo'shimcha o'qitish</p>
        <p>• 0-3 baho: qat'iy ogohlantirish + hayfsan</p>
        <p>• 0-3 baho 2 oy ketma-ket bo'lsa: ishdan bo'shatish tavsiya etiladi (yakuniy qaror — admin qo'lida)</p>
      </div>
    </Card>
  );
}
