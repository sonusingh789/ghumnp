import AppShell from "@/components/layout/app-shell";
import Link from "next/link";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Nepal Events Calendar — Festivals, Fairs & Travel Events | visitNepal77",
  description:
    "Discover Nepal's upcoming festivals, cultural fairs, trekking seasons, and local events across all 77 districts. Plan your trip around Nepal's best events on visitNepal77.",
  path: "/calendar",
  keywords: [
    "Nepal events calendar",
    "Nepal festivals 2026",
    "Nepal cultural events",
    "Nepal travel events",
    "Nepal festival dates",
    "Dashain Tihar Nepal",
    "Nepal trekking season",
    "visitNepal77 events",
  ],
});

const FESTIVALS = [
  { name: "Dashain",        month: "October",   desc: "Nepal's biggest festival — 15 days of worship, family gatherings, and celebrations.", type: "Festival" },
  { name: "Tihar",          month: "October / November", desc: "Festival of lights honoring Laxmi, crows, dogs, and brothers.", type: "Festival" },
  { name: "Holi",           month: "March",     desc: "Vibrant festival of colors celebrated across Nepal.", type: "Festival" },
  { name: "Buddha Jayanti", month: "May",       desc: "Celebration of the Buddha's birth in Lumbini and Kathmandu.", type: "Cultural" },
  { name: "Indra Jatra",    month: "September", desc: "Kathmandu's spectacular chariot festival with the living goddess Kumari.", type: "Cultural" },
  { name: "Trekking Season (Autumn)", month: "Oct – Nov", desc: "Best weather for Everest, Annapurna, and Langtang treks.", type: "Season" },
  { name: "Trekking Season (Spring)", month: "Mar – May", desc: "Rhododendron blooms and clear skies across high-altitude trails.", type: "Season" },
];

const TYPE_COLOR = {
  Festival: { bg: "#fef3c7", color: "#92400e" },
  Cultural:  { bg: "#ede9fe", color: "#5b21b6" },
  Season:    { bg: "#dcfce7", color: "#166534" },
};

export default function CalendarPage() {
  return (
    <AppShell>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #1e3a5f 0%, #1d4ed8 50%, #3b82f6 100%)",
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
            <li style={{ color: "#bfdbfe", fontWeight: 600 }}>Calendar</li>
          </ol>
        </nav>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Events & Seasons</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Nepal <span style={{ color: "#bfdbfe" }}>Events Calendar</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 320 }}>
          Plan your trip around Nepal&apos;s festivals, trekking seasons, and cultural events.
        </p>
      </div>

      <div style={{ padding: "24px 20px 40px" }}>

        {/* Coming Soon Banner */}
        <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1.5px solid #bfdbfe", borderRadius: 16, padding: "16px 18px", marginBottom: 28, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>📅</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f", marginBottom: 4 }}>Full events calendar coming soon</p>
            <p style={{ fontSize: 12, color: "#1d4ed8", lineHeight: 1.6 }}>
              We&apos;re building a live events calendar with festival dates, trekking season alerts, and local event listings across all 77 districts.
            </p>
          </div>
        </div>

        {/* Events List */}
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2563eb", marginBottom: 10 }}>Key Dates</p>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 16, letterSpacing: "-0.02em" }}>Nepal Festivals & Seasons</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {FESTIVALS.map((event) => {
            const style = TYPE_COLOR[event.type];
            return (
              <div key={event.name} style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16, padding: "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{event.name}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, background: style.bg, color: style.color, borderRadius: 999, padding: "3px 9px", flexShrink: 0 }}>{event.type}</span>
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#2563eb", marginBottom: 4 }}>{event.month}</p>
                <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.55 }}>{event.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link href="/explore" style={{ background: "#2563eb", color: "#fff", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Plan Your Trip
          </Link>
          <Link href="/districts" style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#0f172a", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Browse Districts
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
