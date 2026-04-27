import AppShell from "@/components/layout/app-shell";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import TrekkingClient from "./trekking-client";

const SEO_TREKS = [
  { name: "Everest Base Camp Trek",    district: "Solukhumbu", days: "12–14 days", difficulty: "Hard",     elevation: "5,364 m", description: "Trek to the base of the world's highest peak through Sherpa villages, rhododendron forests and high-altitude glaciers.", href: "/districts/solukhumbu" },
  { name: "Annapurna Circuit Trek",    district: "Kaski / Manang", days: "15–20 days", difficulty: "Hard",     elevation: "5,416 m", description: "Nepal's most diverse trek circling the Annapurna massif, crossing Thorong La Pass and descending into the Kali Gandaki gorge.", href: "/districts/kaski" },
  { name: "Langtang Valley Trek",      district: "Rasuwa",     days: "7–10 days",  difficulty: "Moderate", elevation: "3,870 m", description: "A scenic valley trek north of Kathmandu through Tamang villages and yak pastures below Langtang Lirung (7,227 m).", href: "/districts/rasuwa" },
  { name: "Ghorepani Poon Hill Trek",  district: "Myagdi",     days: "4–5 days",   difficulty: "Easy",     elevation: "3,210 m", description: "The most popular short trek in Nepal offering panoramic sunrise views of Dhaulagiri, Annapurna and Machhapuchhre from Poon Hill.", href: "/districts/myagdi" },
  { name: "Manaslu Circuit Trek",      district: "Gorkha",     days: "14–18 days", difficulty: "Hard",     elevation: "5,160 m", description: "A remote restricted-area circuit around Manaslu (8,163 m) crossing Larkya La Pass — one of Nepal's most rewarding wilderness treks.", href: "/districts/gorkha" },
  { name: "Upper Mustang Trek",        district: "Mustang",    days: "12–16 days", difficulty: "Moderate", elevation: "3,840 m", description: "Journey into the forbidden Lo Kingdom — a high-altitude Tibetan plateau of eroded canyons, cave monasteries and medieval walled cities.", href: "/districts/mustang" },
];

export const metadata = buildMetadata({
  title: "Trekking in Nepal — Best Trails, Routes & Maps | visitNepal77",
  description:
    "Explore Nepal's best trekking routes — Everest Base Camp, Annapurna Circuit, Langtang, Poon Hill & more. View interactive trail maps, waypoints, elevation and season guides.",
  path: "/trekking",
  keywords: [
    "trekking in Nepal",
    "Nepal trekking routes",
    "Everest Base Camp trek route",
    "Annapurna Circuit trail map",
    "Nepal trekking guide 2026",
    "best treks Nepal",
    "Langtang Valley trek",
    "Poon Hill trek",
  ],
});

export default function TrekkingPage() {
  return (
    <AppShell>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)",
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
            <li style={{ color: "#86efac", fontWeight: 600 }}>Trekking</li>
          </ol>
        </nav>

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
            Adventure
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 10, letterSpacing: "-0.02em" }}>
            Trekking in <span style={{ color: "#86efac" }}>Nepal</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, maxWidth: 320, marginBottom: 14 }}>
            From Himalayan giants to hidden hill trails — explore routes, waypoints and trail maps across Nepal&apos;s most iconic treks.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["6 Popular Routes","Trail Maps","Elevation Profiles","Season Guide"].map(label => (
              <span key={label} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE TREK EXPLORER ──────────────────── */}
      <TrekkingClient />

      {/* ── SEO CONTENT (server-rendered, crawlable) ───── */}
      <section style={{ padding: "0 20px 32px" }} aria-label="Nepal trekking routes guide">
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.01em" }}>
          Popular Trekking Routes in Nepal
        </h2>
        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 20 }}>
          Nepal offers some of the world&apos;s greatest trekking experiences across its 77 districts — from 5-day beginner trails to 20-day high-altitude circuits. Below are the six most iconic routes, each linking into the full district guide.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {SEO_TREKS.map(t => (
            <article key={t.name}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>
                <Link href={t.href} style={{ color: "inherit", textDecoration: "none" }}>{t.name}</Link>
              </h3>
              <p style={{ fontSize: 11, color: "#059669", fontWeight: 600, marginBottom: 4 }}>
                {t.district} · {t.days} · {t.difficulty} · Max {t.elevation}
              </p>
              <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{t.description}</p>
            </article>
          ))}
        </div>
      </section>

    </AppShell>
  );
}
