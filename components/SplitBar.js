import { CATEGORIES } from "../lib/categories";

export default function SplitBar({ allocation }) {
  return (
    <div>
      <div className="flex h-3.5 rounded-lg overflow-hidden my-3">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.key}
            style={{ width: `${allocation[cat.key]}%`, background: cat.hex }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted">
        {CATEGORIES.map((cat) => (
          <span key={cat.key}>
            <span
              className="inline-block w-2 h-2 rounded-sm mr-1"
              style={{ background: cat.hex }}
            />
            {cat.label} {allocation[cat.key]}%
          </span>
        ))}
      </div>
    </div>
  );
}
