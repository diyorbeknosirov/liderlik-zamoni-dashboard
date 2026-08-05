import { COLORS } from "@/lib/constants";

export default function Input({ label, icon: Icon, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>
          {label}
        </span>
      )}
      <div className="relative">
        {Icon && <Icon size={17} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.sub }} />}
        <input
          {...props}
          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 ${Icon ? "pl-10" : ""}`}
          style={{ borderColor: COLORS.border }}
        />
      </div>
    </label>
  );
}
