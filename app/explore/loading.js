import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function ExploreLoading() {
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
          <Skel className="mb-1.5 h-2.5 w-12 rounded-md bg-white/20" />
          <Skel className="mb-1.5 h-8 w-52 rounded-xl bg-white/20" />
          <Skel className="mb-1 h-5 w-44 rounded-xl bg-white/20" />
          <Skel className="mb-5 h-3 w-56 rounded-md bg-white/20" />
          <Skel className="h-12 w-full rounded-[14px] bg-white/90" />
        </div>
      </div>

      {/* ── STATS ROW ─────────────────────────────────────────── */}
      <div className="flex gap-2.5 px-5 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 rounded-[14px] border border-slate-200 bg-white p-3 text-center shadow-sm">
            <Skel className="mx-auto h-5 w-10 rounded-lg" />
            <Skel className="mx-auto mt-2 h-2.5 w-14 rounded-md" />
          </div>
        ))}
      </div>

      {/* ── PROVINCE FILTER PILLS ─────────────────────────────── */}
      <div className="flex gap-2 overflow-hidden px-5 pt-3.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skel key={i} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      {/* ── PROVINCE SECTIONS ─────────────────────────────────── */}
      <div className="space-y-8 px-5 pb-6 pt-5">
        {[1, 2].map((p) => (
          <div key={p}>
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skel className="h-10 w-10 shrink-0 rounded-[12px]" />
                <div className="space-y-1.5">
                  <Skel className="h-2.5 w-14 rounded-md" />
                  <Skel className="h-5 w-28 rounded-lg" />
                </div>
              </div>
              <Skel className="h-8 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-sm">
                  <Skel className="h-[148px] w-full rounded-none" />
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <Skel className="h-5 w-20 rounded-full" />
                    <Skel className="h-4 w-16 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
