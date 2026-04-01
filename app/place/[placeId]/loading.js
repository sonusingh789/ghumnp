import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function PlaceDetailLoading() {
  return (
    <AppShell>
      {/* ── HERO IMAGE ────────────────────────────────────────── */}
      <div style={{ margin: "-24px -1px 0" }}>
        <Skel className="h-[420px] w-full rounded-none" />
      </div>

      {/* ── PULL-UP CONTENT ───────────────────────────────────── */}
      <div className="space-y-5 px-5 pt-5">
        {/* Breadcrumb */}
        <Skel className="h-3 w-56 rounded-lg" />

        {/* Stats chips */}
        <div className="flex flex-wrap gap-2">
          <Skel className="h-9 w-20 rounded-full" />
          <Skel className="h-9 w-24 rounded-full" />
          <Skel className="h-9 w-20 rounded-full" />
          <Skel className="h-9 w-24 rounded-full" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skel className="h-3.5 w-full rounded-lg" />
          <Skel className="h-3.5 w-full rounded-lg" />
          <Skel className="h-3.5 w-3/4 rounded-lg" />
        </div>

        {/* Contributor card */}
        <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-sm">
          <Skel className="mb-3 h-2.5 w-24 rounded-md" />
          <div className="flex items-center gap-3">
            <Skel className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skel className="h-3.5 w-28 rounded-lg" />
              <Skel className="h-3 w-24 rounded-lg" />
            </div>
          </div>
          <div className="mt-3 flex gap-2.5 border-t border-black/5 pt-3">
            <Skel className="h-10 flex-1 rounded-full" />
            <Skel className="h-10 flex-1 rounded-full" />
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-3">
          <Skel className="h-5 w-24 rounded-lg" />
          {[1, 2].map((i) => (
            <div key={i} className="rounded-[22px] border border-black/5 bg-white p-4">
              <div className="flex gap-3">
                <Skel className="h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skel className="h-4 w-32 rounded-lg" />
                  <Skel className="h-3 w-full rounded-lg" />
                  <Skel className="h-3 w-3/4 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
