export const CATEGORIES = [
  { key: "emergency", label: "Emergency", hex: "#FF6B4A", dim: "#3A2620" },
  { key: "saving", label: "Saving", hex: "#3DDC97", dim: "#123328" },
  { key: "enjoyment", label: "Enjoyment", hex: "#FFC845", dim: "#3A2E0C" }
];

export function formatINR(n) {
  return "\u20B9" + Math.round(n || 0).toLocaleString("en-IN");
}
