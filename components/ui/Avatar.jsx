import { COLORS } from "@/lib/constants";

export default function Avatar({ initials, src, size = 40, ring }) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials || "avatar"}
        className="rounded-full object-cover shrink-0"
        style={{
          width: size,
          height: size,
          boxShadow: ring ? `0 0 0 3px ${ring}` : "none",
        }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`,
        boxShadow: ring ? `0 0 0 3px ${ring}` : "none",
      }}
    >
      {initials}
    </div>
  );
}
