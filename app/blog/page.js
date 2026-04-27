import AppShell from "@/components/layout/app-shell";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import BlogClient from "./blog-client";

export const metadata = buildMetadata({
  title: "Nepal Travel Blog — Stories, Tips & District Guides | visitNepal77",
  description:
    "Read Nepal travel stories, trek reports, food guides and hidden gem discoveries from travellers across all 77 districts. Log in to share your own Nepal story.",
  path: "/blog",
  keywords: [
    "Nepal travel blog",
    "Nepal travel stories",
    "Nepal trek report",
    "Nepal district guides",
    "Nepal food blog",
    "Nepal hidden gems",
    "visitNepal77 blog",
  ],
});

export default function BlogPage() {
  return (
    <AppShell>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
        margin: "-24px -1px 0",
        padding: "28px 20px 28px",
        borderRadius: "0 0 32px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

        <nav aria-label="Breadcrumb" style={{ marginBottom: 12, position: "relative", zIndex: 1 }}>
          <ol style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.6)", listStyle: "none", margin: 0, padding: 0 }}>
            <li><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link></li>
            <li aria-hidden="true">/</li>
            <li style={{ color: "#fed7aa", fontWeight: 600 }}>Blog</li>
          </ol>
        </nav>

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
            Travel Stories
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 10, letterSpacing: "-0.02em" }}>
            Nepal <span style={{ color: "#fed7aa" }}>Travel Blog</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, maxWidth: 320, marginBottom: 14 }}>
            Stories, guides and discoveries from Nepal&apos;s 77 districts — written by local explorers and travellers.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Trekking", "Food & Culture", "Hidden Gems", "Heritage", "Photography"].map(label => (
              <span key={label} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE BLOG LIST ──────────────────────────── */}
      <BlogClient />

      {/* ── SEO CONTENT ───────────────────────────────────── */}
      <section style={{ padding: "0 20px 40px" }} aria-label="Nepal travel blog topics">
        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.01em" }}>
          What Nepal Travellers Write About
        </h2>
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, marginBottom: 16 }}>
          The visitNepal77 blog covers all corners of Nepal — from first-hand trekking accounts on the Everest Base Camp and Annapurna Circuit to off-the-beaten-path village stays, local food journeys through the Newari kitchens of Bhaktapur, and photography guides in Mustang&apos;s canyon country.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { emoji: "🏔️", label: "Trekking Stories",    desc: "EBC, Annapurna, Langtang and beyond" },
            { emoji: "🍜", label: "Local Food Guides",    desc: "Dal bhat, momos, Newari cuisine" },
            { emoji: "🏛️", label: "Culture & Heritage",  desc: "Temples, festivals and traditions" },
            { emoji: "💎", label: "Hidden Gems",          desc: "Places most tourists never find" },
            { emoji: "🗺️", label: "District Guides",      desc: "Deep-dives into all 77 districts" },
            { emoji: "📸", label: "Photography Tips",     desc: "Landscapes, light and local life" },
          ].map(({ emoji, label, desc }) => (
            <article key={label} style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 14, padding: "12px 13px" }}>
              <p style={{ fontSize: 18, marginBottom: 4 }}>{emoji}</p>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{label}</h3>
              <p style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.5 }}>{desc}</p>
            </article>
          ))}
        </div>
      </section>

    </AppShell>
  );
}
