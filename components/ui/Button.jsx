import { COLORS } from "@/lib/constants";

export default function Button({ children, onClick, variant = "primary", className = "", type = "button", disabled }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: { background: COLORS.primary, color: "#fff" },
    ghost: { background: "#F3F4F6", color: COLORS.ink },
    outline: { background: "#fff", color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` },
    danger: { background: COLORS.dangerBg, color: COLORS.danger },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${className}`} style={variants[variant]}>
      {children}
    </button>
  );
}
