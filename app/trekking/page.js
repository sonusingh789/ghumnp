import AppShell from "@/components/layout/app-shell";
import Link from "next/link";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Trekking in Nepal — Best Trails Across All 77 Districts | visitNepal77",
  description:
    "Explore the best trekking trails in Nepal across all 77 districts. From Everest Base Camp to Annapurna Circuit, discover routes, tips, and hidden trails on visitNepal77.",
  path: "/trekking",
  keywords: [
    "trekking in Nepal",
    "Nepal trekking trails",
    "best treks in Nepal",
    "Everest Base Camp trek",
    "Annapurna Circuit",
    "Nepal hiking",
    "Nepal trekking guide",
    "Nepal adventure travel",
  ],
});

const POPULAR_TREKS = [
  { name: "Everest Base Camp", district: "Solukhumbu", days: "12–14 days", difficulty: "Hard", href: "/districts/solukhumbu" },
  { name: "Annapurna Circuit", district: "Kaski / Manang", days: "15–20 days", difficulty: "Hard", href: "/districts/kaski" },
  { name: "Langtang Valley", district: "Rasuwa", days: "7–10 days", difficulty: "Moderate", href: "/districts/rasuwa" },
  { name: "Ghorepani Poon Hill", district: "Myagdi", days: "4–5 days", difficulty: "Easy", href: "/districts/myagdi" },
  { name: "Manaslu Circuit", district: "Gorkha", days: "14–18 days", difficulty: "Hard", href: "/districts/gorkha" },
  { name: "Upper Mustang", district: "Mustang", days: "12–16 days", difficulty: "Moderate", href: "/districts/mustang" },
];

const DIFFICULTY_COLOR = {
  Easy:     { bg: "#dcfce7", color: "#15803d" },
  Moderate: { bg: "#fef9c3", color: "#a16207" },
  Hard:     { bg: "#fee2e2", color: "#dc2626" },
};

export default function TrekkingPage() {
  return (
    <AppShell>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)",
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
            <li style={{ color: "#86efac", fontWeight: 600 }}>Trekking</li>
          </ol>
        </nav>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Adventure</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Trekking in <span style={{ color: "#86efac" }}>Nepal</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 320 }}>
          From Himalayan giants to hidden hill trails — find your perfect trek across all 77 districts.
        </p>
      </div>

      <div style={{ padding: "24px 20px 40px" }}>

        {/* Coming Soon Banner */}
        <div style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", border: "1.5px solid #a7f3d0", borderRadius: 16, padding: "16px 18px", marginBottom: 28, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🏗️</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 4 }}>Full trekking guide coming soon</p>
            <p style={{ fontSize: 12, color: "#047857", lineHeight: 1.6 }}>
              We&apos;re building detailed trail maps, difficulty ratings, and season guides for every district. For now, explore treks through our district pages.
            </p>
          </div>
        </div>

        {/* Popular Treks */}
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 10 }}>Popular Treks</p>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 16, letterSpacing: "-0.02em" }}>Best Treks in Nepal</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {POPULAR_TREKS.map((trek) => {
            const diff = DIFFICULTY_COLOR[trek.difficulty];
            return (
              <Link
                key={trek.name}
                href={trek.href}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16, padding: "14px 16px", textDecoration: "none", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{trek.name}</p>
                  <p style={{ fontSize: 12, color: "#6b7280" }}>{trek.district} · {trek.days}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: diff.bg, color: diff.color, borderRadius: 999, padding: "4px 10px", flexShrink: 0 }}>
                  {trek.difficulty}
                </span>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link href="/districts" style={{ background: "#059669", color: "#fff", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Browse All Districts
          </Link>
          <Link href="/allplaces" style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#0f172a", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            All Places
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
