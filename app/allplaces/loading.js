import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function AllPlacesLoading() {
  return (
    <AppShell>
      {/* ── GREEN BANNER ──────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)",
        margin: "-24px -1px 0",
        padding: "28px 20px 32px",
        borderRadius: "0 0 32px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Skel className="mb-1.5 h-2.5 w-28 rounded-md bg-white/20" />
          <Skel className="mb-1.5 h-8 w-52 rounded-xl bg-white/20" />
          <Skel className="mb-5 h-3 w-64 rounded-md bg-white/20" />
          <Skel className="h-12 w-full rounded-[14px] bg-white/90" />
        </div>
      </div>

      {/* ── CATEGORY TABS ─────────────────────────────────────── */}
      <div className="flex gap-2 overflow-hidden px-5 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skel key={i} className="h-9 w-28 shrink-0 rounded-full" />
        ))}
      </div>

      {/* ── COUNT ─────────────────────────────────────────────── */}
      <div className="px-5 pt-3">
        <Skel className="h-4 w-24 rounded-lg" />
      </div>

      {/* ── PLACE LIST ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-5 pb-6 pt-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-[20px] border border-black/5 bg-white p-3 shadow-sm">
            <Skel className="h-24 w-24 shrink-0 rounded-[14px]" />
            <div className="flex-1 space-y-2 pt-1">
              <Skel className="h-4 w-3/4 rounded-lg" />
              <Skel className="h-3 w-full rounded-lg" />
              <Skel className="h-3 w-1/2 rounded-lg" />
              <div className="flex gap-2 pt-0.5">
                <Skel className="h-4 w-10 rounded-lg" />
                <Skel className="h-4 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
