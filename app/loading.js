import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function HomeLoading() {
  return (
    <AppShell showTopBar={false} className="bg-transparent">
      {/* ── HERO BANNER ──────────────────────────────────────── */}
      <div style={{
        margin: "-24px -1px 0",
        padding: "20px 24px 80px",
        borderRadius: "0 0 36px 36px",
        background: "#064e35",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: 220,
      }}>
        <Skel className="h-[180px] w-[180px] rounded-full bg-white/10" />
        <Skel className="mt-3 h-5 w-52 rounded-lg bg-white/10" />
        <Skel className="mt-2 h-3 w-40 rounded-lg bg-white/10" />
        <div className="mt-2 flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-1.5 w-4 animate-pulse rounded-full bg-white/20" />
          ))}
        </div>
        <Skel className="mt-3 h-7 w-28 rounded-full bg-white/10" />
      </div>

      {/* ── SEARCH PILL ──────────────────────────────────────── */}
      <div style={{ margin: "-28px 16px 0", position: "relative", zIndex: 10 }}>
        <Skel className="h-14 w-full rounded-[20px]" />
      </div>

      {/* ── QUICK STATS ──────────────────────────────────────── */}
      <div className="flex gap-2.5 overflow-hidden px-5 pt-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-100 bg-white shadow-sm">
            <Skel className="h-5 w-7 rounded-md" />
            <Skel className="h-3.5 w-8 rounded-md" />
            <Skel className="h-2.5 w-10 rounded-md" />
          </div>
        ))}
      </div>

      {/* ── FEATURED DISTRICTS ───────────────────────────────── */}
      <div className="mt-7 px-5">
        <div className="mb-3.5 flex items-end justify-between">
          <div className="space-y-1.5">
            <Skel className="h-2.5 w-14 rounded-md" />
            <Skel className="h-5 w-44 rounded-lg" />
          </div>
          <Skel className="h-4 w-12 rounded-lg" />
        </div>
        <div className="flex gap-3 overflow-hidden py-1">
          {[1, 2, 3].map((i) => (
            <Skel key={i} className="h-[168px] w-[280px] shrink-0 rounded-[20px]" />
          ))}
        </div>
      </div>

      {/* ── LEADERBOARD WIDGET ───────────────────────────────── */}
      <div className="mt-7 px-5">
        <div className="mb-3.5 flex items-end justify-between">
          <div className="space-y-1.5">
            <Skel className="h-2.5 w-20 rounded-md" />
            <Skel className="h-5 w-44 rounded-lg" />
          </div>
          <Skel className="h-4 w-20 rounded-lg" />
        </div>
        <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
          <Skel className="h-14 w-full rounded-none" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 border-t border-slate-100 px-4 py-3">
              <Skel className="h-6 w-6 shrink-0 rounded-full" />
              <Skel className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skel className="h-3.5 w-28 rounded-lg" />
                <Skel className="h-3 w-36 rounded-lg" />
              </div>
              <Skel className="h-5 w-8 rounded-full" />
            </div>
          ))}
          <Skel className="h-11 w-full rounded-none border-t border-slate-100" />
        </div>
      </div>

      {/* ── POPULAR DISTRICTS ────────────────────────────────── */}
      <div className="mt-7 px-5">
        <div className="mb-3.5 flex items-end justify-between">
          <div className="space-y-1.5">
            <Skel className="h-2.5 w-16 rounded-md" />
            <Skel className="h-5 w-44 rounded-lg" />
          </div>
          <Skel className="h-4 w-14 rounded-lg" />
        </div>
        <div className="flex gap-3 overflow-hidden py-1">
          {[1, 2, 3].map((i) => (
            <Skel key={i} className="h-[168px] w-[280px] shrink-0 rounded-[20px]" />
          ))}
        </div>
      </div>

      {/* ── TOP PLACES ───────────────────────────────────────── */}
      <div className="mt-7 px-5">
        <div className="mb-3.5 flex items-end justify-between">
          <div className="space-y-1.5">
            <Skel className="h-2.5 w-20 rounded-md" />
            <Skel className="h-5 w-28 rounded-lg" />
          </div>
          <Skel className="h-4 w-14 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 rounded-[20px] border border-slate-100 bg-white p-3">
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

      {/* ── CONTRIBUTE CTA ───────────────────────────────────── */}
      <div className="mx-5 mb-2 mt-7">
        <Skel className="h-44 w-full rounded-[24px]" />
      </div>
    </AppShell>
  );
}
