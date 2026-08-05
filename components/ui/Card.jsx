import { COLORS } from "@/lib/constants";

export default function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`bg-white rounded-2xl border ${className}`}
      style={{ borderColor: COLORS.border, boxShadow: "0 1px 2px rgba(16,24,40,0.04)", ...style }}
    >
      {children}
    </div>
  );
}
