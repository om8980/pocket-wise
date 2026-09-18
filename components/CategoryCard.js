import { formatINR } from "../lib/categories";

export default function CategoryCard({ cat, allocAmt, spentAmt, mode }) {
  const remAmt = allocAmt - spentAmt;
  const pct = allocAmt > 0 ? Math.min(100, Math.round((spentAmt / allocAmt) * 100)) : 0;
  return (
    <div
      className="rounded-2xl p-4 mb-3 border"
      style={{ background: cat.dim, borderColor: cat.hex + "33" }}
    >
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-semibold text-sm">{cat.label}</span>
        <span className="font-semibold text-sm">
          {formatINR(remAmt)} {mode === "student" ? "bacha" : "left"}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: cat.hex }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted">
        <span>{formatINR(spentAmt)} kharch hua</span>
        <span>of {formatINR(allocAmt)}</span>
      </div>
    </div>
  );
}
