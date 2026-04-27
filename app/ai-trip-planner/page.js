import AppShell from "@/components/layout/app-shell";
import Link from "next/link";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI Trip Planner for Nepal — Plan Your Perfect Nepal Trip | visitNepal77",
  description:
    "Plan your Nepal trip with AI assistance. Get personalised itineraries, district recommendations, and travel tips tailored to your interests and travel dates on visitNepal77.",
  path: "/ai-trip-planner",
  keywords: [
    "Nepal trip planner",
    "AI travel planner Nepal",
    "Nepal itinerary planner",
    "plan Nepal trip",
    "Nepal travel itinerary",
    "Nepal AI guide",
    "visitNepal77 trip planner",
  ],
});

const FEATURES = [
  { icon: "🗺️", title: "Personalised Itineraries", desc: "Get day-by-day plans based on your interests, budget, and travel dates." },
  { icon: "🏔️", title: "District Recommendations", desc: "AI picks the best districts for your travel style — adventure, culture, food, or relaxation." },
  { icon: "🍜", title: "Local Food Guide", desc: "Discover must-try local dishes and the best food spots in every district you visit." },
  { icon: "📅", title: "Season-Aware Planning", desc: "Plans adapt to the best travel season — monsoon, autumn, spring, or winter." },
];

export default function AITripPlannerPage() {
  return (
    <AppShell>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #2e1065 0%, #4c1d95 50%, #7c3aed 100%)",
        margin: "-24px -1px 0",
        padding: "28px 20px 32px",
        borderRadius: "0 0 32px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <nav aria-label="Breadcrumb" style={{ marginBottom: 12 }}>
          <ol style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.6)", listStyle: "none", margin: 0, padding: 0 }}>
            <li><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link></li>
            <li aria-hidden="true">/</li>
            <li style={{ color: "#c4b5fd", fontWeight: 600 }}>AI Trip Planner</li>
          </ol>
        </nav>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Smart Travel</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 8, letterSpacing: "-0.02em" }}>
          AI Trip <span style={{ color: "#c4b5fd" }}>Planner</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 320 }}>
          Plan your perfect Nepal adventure with personalised AI-powered itineraries.
        </p>
      </div>

      <div style={{ padding: "24px 20px 40px" }}>

        {/* Coming Soon Banner */}
        <div style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", border: "1.5px solid #c4b5fd", borderRadius: 16, padding: "16px 18px", marginBottom: 28, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🤖</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#4c1d95", marginBottom: 4 }}>AI planner launching soon</p>
            <p style={{ fontSize: 12, color: "#6d28d9", lineHeight: 1.6 }}>
              We&apos;re training our AI on Nepal&apos;s 77 districts, thousands of places, and local travel insights. Get notified when it launches.
            </p>
          </div>
        </div>

        {/* Features */}
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 10 }}>What to Expect</p>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 16, letterSpacing: "-0.02em" }}>Plan Smarter, Travel Better</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16, padding: "14px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "8px 0 4px" }}>{title}</p>
              <p style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link href="/explore" style={{ background: "#7c3aed", color: "#fff", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Explore Nepal Now
          </Link>
          <Link href="/districts" style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#0f172a", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Browse Districts
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
