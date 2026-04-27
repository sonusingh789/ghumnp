import AppShell from "@/components/layout/app-shell";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import CalendarLoader from "./calendar-loader";

export const metadata = buildMetadata({
  title: "Nepal Calendar — BS & AD Dates, Festivals & Public Holidays | visitNepal77",
  description:
    "View the Nepal calendar with Bikram Sambat (BS) and AD dates side by side. Find Nepal public holidays, festivals like Dashain and Tihar, and plan your trip around key events.",
  path: "/calendar",
  keywords: [
    "Nepal calendar BS AD",
    "Bikram Sambat calendar 2082 2083",
    "Nepal public holidays 2026",
    "Nepal festivals calendar",
    "Dashain Tihar dates",
    "Nepal BS calendar",
    "visitNepal77 calendar",
  ],
});

export default function CalendarPage() {
  return (
    <AppShell>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #1e3a5f 0%, #1d4ed8 50%, #3b82f6 100%)",
        margin: "-24px -1px 0",
        padding: "28px 20px 28px",
        borderRadius: "0 0 32px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <nav aria-label="Breadcrumb" style={{ marginBottom: 12, position: "relative", zIndex: 1 }}>
          <ol style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.6)", listStyle: "none", margin: 0, padding: 0 }}>
            <li><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link></li>
            <li aria-hidden="true">/</li>
            <li style={{ color: "#bfdbfe", fontWeight: 600 }}>Calendar</li>
          </ol>
        </nav>

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
            Events & Seasons
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 10, letterSpacing: "-0.02em" }}>
            Nepal <span style={{ color: "#bfdbfe" }}>Calendar</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, maxWidth: 340, marginBottom: 14 }}>
            Bikram Sambat (BS) &amp; AD dates side by side — with Nepal public holidays, Dashain, Tihar, and all major festivals.
          </p>
          {/* SEO keyword chips — server-rendered, crawlable */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["BS 2082 / 2083 / 2084","Public Holidays","Dashain & Tihar","Festival Dates","Nepali New Year"].map(label => (
              <span key={label} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                {label}
              </span>
            ))}</div>
        </div>
      </div>

      {/* ── INTERACTIVE CALENDAR ───────────────────────────── */}
      <CalendarLoader />

    </AppShell>
  );
}
