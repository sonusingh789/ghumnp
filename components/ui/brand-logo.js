/**
 * BrandLogo — text-based brand mark for visitNepal77.
 * Works on both dark (green) and light (white) backgrounds.
 *
 * variant="light"  → for green/dark backgrounds (default)
 * variant="dark"   → for white/light backgrounds
 */
export default function BrandLogo({ variant = "light", size = "md" }) {
  const sizes = {
    sm: { fontSize: 18, subSize: 11 },
    md: { fontSize: 24, subSize: 13 },
    lg: { fontSize: 32, subSize: 16 },
  };
  const { fontSize, subSize } = sizes[size] || sizes.md;

  const visitColor = variant === "light" ? "rgba(255,255,255,0.88)" : "#334155";
  const nepalColor = variant === "light" ? "#86efac" : "#059669";
  const num77Color = variant === "light" ? "#ffffff" : "#0f172a";

  return (
    <span style={{ fontSize, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
      <span style={{ color: visitColor }}>visit</span>
      <span style={{ color: nepalColor }}>Nepal</span>
      <span style={{ color: num77Color }}>77</span>
    </span>
  );
}
