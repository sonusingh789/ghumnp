import AppShell from "@/components/layout/app-shell";

function Skel({ style }) {
  return <div className="img-skeleton" style={{ borderRadius: 8, ...style }} />;
}

function AvatarSkel({ size }) {
  return <Skel style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0 }} />;
}

export default function LeaderboardLoading() {
  return (
    <AppShell>

      {/* ════════════════════════════════════════════════════════
          DESKTOP SKELETON
      ════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">

        {/* Green header banner */}
        <div style={{
          background: "linear-gradient(105deg, #059669 0%, #065f46 100%)",
          borderRadius: 24, padding: "36px 40px",
          marginBottom: 32, overflow: "hidden", position: "relative",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Skel style={{ width: 220, height: 40, background: "rgba(255,255,255,0.18)" }} />
              <Skel style={{ width: 360, height: 14, background: "rgba(255,255,255,0.12)" }} />
              <Skel style={{ width: 280, height: 14, background: "rgba(255,255,255,0.12)" }} />
            </div>
            {/* Period tabs */}
            <div style={{ display: "flex", gap: 6, background: "rgba(0,0,0,0.18)", borderRadius: 999, padding: 4 }}>
              {[80, 90, 70].map((w, i) => (
                <Skel key={i} style={{ width: w, height: 38, borderRadius: 999, background: i === 1 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Two-column */}
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>

          {/* Main column */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Podium */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", padding: "32px 24px", marginBottom: 24 }}>
              <Skel style={{ width: 140, height: 11, margin: "0 auto 28px" }} />
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 20 }}>
                {/* 2nd */}
                <div style={{ flex: 1, maxWidth: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <AvatarSkel size={70} />
                  <Skel style={{ width: "100%", height: 88, borderRadius: 16 }} />
                </div>
                {/* 1st */}
                <div style={{ flex: 1, maxWidth: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <AvatarSkel size={90} />
                  <Skel style={{ width: "100%", height: 112, borderRadius: 16, background: "#d1fae5" }} />
                </div>
                {/* 3rd */}
                <div style={{ flex: 1, maxWidth: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <AvatarSkel size={70} />
                  <Skel style={{ width: "100%", height: 72, borderRadius: 16 }} />
                </div>
              </div>
            </div>

            {/* Ranked rows #4+ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <Skel style={{ width: 24, height: 18, borderRadius: 4 }} />
                  <AvatarSkel size={44} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                    <Skel style={{ width: "45%", height: 14 }} />
                    <Skel style={{ width: "60%", height: 11 }} />
                  </div>
                  <Skel style={{ width: 72, height: 24, borderRadius: 999 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", padding: 18, marginBottom: 18 }}>
              <Skel style={{ width: 110, height: 10, marginBottom: 12 }} />
              <Skel style={{ width: "100%", height: 44, borderRadius: 12 }} />
            </div>
            <Skel style={{ width: "100%", height: 200, borderRadius: 18, background: "#d1fae5" }} />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE SKELETON
      ════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">

        {/* Green header */}
        <div style={{
          background: "linear-gradient(135deg, #059669 0%, #065f46 100%)",
          margin: "-24px -1px 0", padding: "28px 20px 32px",
          borderRadius: "0 0 28px 28px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Skel style={{ width: 160, height: 28, background: "rgba(255,255,255,0.25)" }} />
            <Skel style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
          </div>
          <Skel style={{ width: "80%", height: 13, background: "rgba(255,255,255,0.18)", marginBottom: 18 }} />
          {/* Period tabs */}
          <div style={{ display: "flex", gap: 6, background: "rgba(0,0,0,0.18)", borderRadius: 999, padding: 4 }}>
            {[1, 2, 3].map((i) => (
              <Skel key={i} style={{ flex: 1, height: 34, borderRadius: 999, background: i === 2 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>
        </div>

        <div style={{ padding: "0 16px 32px" }}>

          {/* District filter */}
          <div style={{ margin: "20px 0 24px" }}>
            <Skel style={{ width: 110, height: 12, marginBottom: 8 }} />
            <Skel style={{ width: "100%", height: 44, borderRadius: 12 }} />
          </div>

          {/* Podium */}
          <Skel style={{ width: 120, height: 11, marginBottom: 16 }} />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12, marginBottom: 28 }}>
            {/* 2nd */}
            <div style={{ flex: 1, maxWidth: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <AvatarSkel size={60} />
              <Skel style={{ width: "100%", height: 88, borderRadius: 16 }} />
            </div>
            {/* 1st */}
            <div style={{ flex: 1, maxWidth: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <AvatarSkel size={78} />
              <Skel style={{ width: "100%", height: 112, borderRadius: 16, background: "#d1fae5" }} />
            </div>
            {/* 3rd */}
            <div style={{ flex: 1, maxWidth: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <AvatarSkel size={60} />
              <Skel style={{ width: "100%", height: 72, borderRadius: 16 }} />
            </div>
          </div>

          {/* Ranked rows #4+ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <Skel style={{ width: 22, height: 16, borderRadius: 4 }} />
                <AvatarSkel size={40} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                  <Skel style={{ width: "50%", height: 13 }} />
                  <Skel style={{ width: "65%", height: 11 }} />
                </div>
                <Skel style={{ width: 60, height: 22, borderRadius: 999 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

    </AppShell>
  );
}
