import AppShell from "@/components/layout/app-shell";
import Link from "next/link";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Nepal Travel Blog — Stories, Tips & District Guides | visitNepal77",
  description:
    "Read Nepal travel stories, trip reports, local guides, and hidden gem discoveries from travellers across all 77 districts on the visitNepal77 blog.",
  path: "/blog",
  keywords: [
    "Nepal travel blog",
    "Nepal travel stories",
    "Nepal trip report",
    "Nepal district guides",
    "Nepal travel tips",
    "Nepal hidden gems blog",
    "visitNepal77 blog",
  ],
});

const TOPICS = [
  { icon: "🏔️", label: "Trekking & Hiking",   href: "/trekking"  },
  { icon: "🍜", label: "Local Food",           href: "/allplaces" },
  { icon: "🏛️", label: "Culture & Heritage",  href: "/allplaces" },
  { icon: "💎", label: "Hidden Gems",          href: "/allplaces" },
  { icon: "🗺️", label: "District Guides",      href: "/districts" },
  { icon: "📸", label: "Travel Photography",   href: "/allplaces" },
];

export default function BlogPage() {
  return (
    <AppShell>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
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
            <li style={{ color: "#fed7aa", fontWeight: 600 }}>Blog</li>
          </ol>
        </nav>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Travel Stories</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Nepal <span style={{ color: "#fed7aa" }}>Travel Blog</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 320 }}>
          Stories, guides, and discoveries from Nepal&apos;s 77 districts — written by local explorers.
        </p>
      </div>

      <div style={{ padding: "24px 20px 40px" }}>

        {/* Coming Soon Banner */}
        <div style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1.5px solid #fed7aa", borderRadius: 16, padding: "16px 18px", marginBottom: 28, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>✍️</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#7c2d12", marginBottom: 4 }}>Blog stories coming soon</p>
            <p style={{ fontSize: 12, color: "#9a3412", lineHeight: 1.6 }}>
              We&apos;re collecting trip reports, district guides, and local stories from contributors across Nepal. The blog launches soon.
            </p>
          </div>
        </div>

        {/* Topics */}
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#ea580c", marginBottom: 10 }}>Browse by Topic</p>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 16, letterSpacing: "-0.02em" }}>What We&apos;ll Cover</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
          {TOPICS.map(({ icon, label, href }) => (
            <Link
              key={label}
              href={href}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16, padding: "14px", textDecoration: "none", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{label}</span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link href="/allplaces" style={{ background: "#ea580c", color: "#fff", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Explore Places
          </Link>
          <Link href="/add" style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#0f172a", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Share Your Story
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
