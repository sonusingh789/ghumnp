import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function FavoritesLoading() {
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
          <Skel className="mb-1.5 h-2.5 w-16 rounded-md bg-white/20" />
          <Skel className="mb-1.5 h-8 w-48 rounded-xl bg-white/20" />
          <Skel className="h-3 w-56 rounded-md bg-white/20" />
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

      {/* ── TAB FILTER ────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-hidden px-5 pt-3.5">
        {[1, 2, 3].map((i) => (
          <Skel key={i} className="h-9 w-20 shrink-0 rounded-full" />
        ))}
      </div>

      {/* ── SAVED DISTRICTS ───────────────────────────────────── */}
      <div className="px-5 pt-5">
        <div className="mb-3.5 flex items-center gap-2">
          <Skel className="h-7 w-7 rounded-lg" />
          <Skel className="h-4 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-sm">
              <Skel className="h-[148px] w-full rounded-none" />
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <Skel className="h-5 w-20 rounded-full" />
                <Skel className="h-4 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SAVED PLACES ──────────────────────────────────────── */}
      <div className="px-5 pb-6 pt-7">
        <div className="mb-3.5 flex items-center gap-2">
          <Skel className="h-7 w-7 rounded-lg" />
          <Skel className="h-4 w-28 rounded-lg" />
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 rounded-[20px] border border-black/5 bg-white p-3 shadow-sm">
              <Skel className="h-24 w-24 shrink-0 rounded-[14px]" />
              <div className="flex-1 space-y-2 pt-1">
                <Skel className="h-4 w-3/4 rounded-lg" />
                <Skel className="h-3 w-full rounded-lg" />
                <Skel className="h-3 w-1/2 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
