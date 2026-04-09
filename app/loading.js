import AppShell from "@/components/layout/app-shell";
import Image from "next/image";

function Skel({ style }) {
  return <div className="img-skeleton" style={{ borderRadius: 8, ...style }} />;
}

export default function HomeLoading() {
  return (
    <AppShell showTopBar={false} className="bg-transparent">

      {/* ── HERO — matches real hero exactly ─────────────────── */}
      <div style={{ position: "relative" }}>
        <div style={{
          margin: "-24px -1px 0",
          padding: "74px 24px 80px",
          borderRadius: "0 0 36px 36px",
          position: "relative",
          overflow: "hidden",
          minHeight: 260,
          background: "#1a4a2e",
        }}>
          {/* Faint image-like shimmer background */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #1e5c38 0%, #0d3322 50%, #153d28 100%)" }} />

          {/* White gradient + logo — exactly like real hero */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 104,
            background: "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0) 100%)",
            zIndex: 2, pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            height: 74, display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 3,
          }}>
            <div style={{ width: 160, height: 56, position: "relative" }}>
              <Image src="/logo.png" alt="visitNepal77" fill sizes="160px" style={{ objectFit: "contain" }} priority />
            </div>
          </div>

          {/* Hero content — no skeleton bars, just empty space matching real layout */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ height: 22, marginBottom: 8 }} />
            <div style={{ height: 13, marginBottom: 12 }} />
            <div style={{ height: 24, marginBottom: 10 }} />
            <div style={{ height: 6,  marginBottom: 10 }} />
            <div style={{ height: 30 }} />
          </div>
        </div>

        {/* Search bar */}
        <div style={{ margin: "-28px 16px 0", position: "relative", zIndex: 10 }}>
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(6,78,53,0.18)", height: 56 }} />
        </div>
      </div>

      {/* ── QUICK STATS ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, padding: "20px 20px 0", overflow: "hidden" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flexShrink: 0, width: 76, height: 76, borderRadius: 16, background: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(15,23,42,0.04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Skel style={{ width: 28, height: 14 }} />
            <Skel style={{ width: 32, height: 10 }} />
            <Skel style={{ width: 40, height: 9 }} />
          </div>
        ))}
      </div>

      {/* ── FEATURED DISTRICTS ───────────────────────────────── */}
      <div style={{ marginTop: 28, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skel style={{ width: 56, height: 10 }} />
            <Skel style={{ width: 176, height: 20 }} />
          </div>
          <Skel style={{ width: 48, height: 14 }} />
        </div>
        <div style={{ display: "flex", gap: 12, overflow: "hidden", paddingBottom: 4 }}>
          {[1, 2, 3].map((i) => (
            <Skel key={i} style={{ width: 280, height: 168, flexShrink: 0, borderRadius: 20 }} />
          ))}
        </div>
      </div>

      {/* ── LEADERBOARD ──────────────────────────────────────── */}
      <div style={{ marginTop: 28, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skel style={{ width: 80, height: 10 }} />
            <Skel style={{ width: 176, height: 20 }} />
          </div>
          <Skel style={{ width: 80, height: 14 }} />
        </div>
        <div style={{ borderRadius: 20, border: "1px solid #f1f5f9", background: "#fff", overflow: "hidden" }}>
          <Skel style={{ width: "100%", height: 56, borderRadius: 0 }} />
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #f1f5f9", padding: "12px 16px" }}>
              <Skel style={{ width: 24, height: 24, flexShrink: 0, borderRadius: "50%" }} />
              <Skel style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skel style={{ width: 112, height: 12 }} />
                <Skel style={{ width: 144, height: 10 }} />
              </div>
              <Skel style={{ width: 32, height: 20, borderRadius: 999 }} />
            </div>
          ))}
          <Skel style={{ width: "100%", height: 44, borderRadius: 0, borderTop: "1px solid #f1f5f9" }} />
        </div>
      </div>

      {/* ── POPULAR DISTRICTS ────────────────────────────────── */}
      <div style={{ marginTop: 28, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skel style={{ width: 64, height: 10 }} />
            <Skel style={{ width: 176, height: 20 }} />
          </div>
          <Skel style={{ width: 56, height: 14 }} />
        </div>
        <div style={{ display: "flex", gap: 12, overflow: "hidden", paddingBottom: 4 }}>
          {[1, 2, 3].map((i) => (
            <Skel key={i} style={{ width: 280, height: 168, flexShrink: 0, borderRadius: 20 }} />
          ))}
        </div>
      </div>

      {/* ── TOP PLACES ───────────────────────────────────────── */}
      <div style={{ marginTop: 28, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skel style={{ width: 80, height: 10 }} />
            <Skel style={{ width: 112, height: 20 }} />
          </div>
          <Skel style={{ width: 56, height: 14 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", gap: 12, borderRadius: 20, border: "1px solid #f1f5f9", background: "#fff", padding: 12 }}>
              <Skel style={{ width: 96, height: 96, flexShrink: 0, borderRadius: 14 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
                <Skel style={{ width: "75%", height: 14 }} />
                <Skel style={{ width: "100%", height: 11 }} />
                <Skel style={{ width: "50%", height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTRIBUTE CTA ───────────────────────────────────── */}
      <div style={{ margin: "28px 20px 8px" }}>
        <Skel style={{ width: "100%", height: 176, borderRadius: 24 }} />
      </div>

    </AppShell>
  );
}
