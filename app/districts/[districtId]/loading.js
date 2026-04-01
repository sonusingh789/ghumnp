import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function DistrictDetailLoading() {
  return (
    <AppShell contentClassName="pt-0">
      {/* ── HERO IMAGE ────────────────────────────────────────── */}
      <div style={{ margin: "0 -1px" }}>
        <Skel className="h-[300px] w-full rounded-none sm:h-80" />
      </div>

      {/* ── PULL-UP WHITE CONTENT ─────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", marginTop: -20, position: "relative", zIndex: 1 }}>
        {/* Breadcrumb */}
        <div className="px-5 pt-4">
          <Skel className="h-3 w-48 rounded-lg" />
        </div>

        {/* Stats chips */}
        <div className="flex flex-wrap gap-2 px-5 pt-3.5">
          <Skel className="h-9 w-24 rounded-full" />
          <Skel className="h-9 w-28 rounded-full" />
          <Skel className="h-9 w-24 rounded-full" />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-hidden px-5 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skel key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>

        {/* Section header */}
        <div className="px-5 pt-5">
          <Skel className="mb-1.5 h-2.5 w-24 rounded-md" />
          <Skel className="h-5 w-56 rounded-lg" />
        </div>

        {/* Places list */}
        <div className="flex flex-col gap-2.5 px-4 pb-6 pt-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 rounded-[20px] border border-black/5 bg-white p-3 shadow-sm">
              <Skel className="h-24 w-24 shrink-0 rounded-[14px]" />
              <div className="flex-1 space-y-2 pt-1">
                <Skel className="h-4 w-3/4 rounded-lg" />
                <Skel className="h-3 w-full rounded-lg" />
                <Skel className="h-3 w-1/2 rounded-lg" />
                <div className="flex gap-2 pt-0.5">
                  <Skel className="h-4 w-10 rounded-lg" />
                  <Skel className="h-4 w-20 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
