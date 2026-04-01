import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function ProfileLoading() {
  return (
    <AppShell>
      {/* ── GREEN BANNER ──────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)",
        margin: "-24px -1px 0",
        padding: "28px 20px 72px",
        borderRadius: "0 0 32px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }} className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Skel className="h-2.5 w-16 rounded-md bg-white/20" />
            <Skel className="h-8 w-40 rounded-xl bg-white/20" />
          </div>
          <div className="flex gap-2">
            <Skel className="h-9 w-20 rounded-full bg-white/20" />
            <Skel className="h-9 w-20 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      <div className="px-4 pb-10">
        {/* ── PROFILE CARD (overlaps banner) ──────────────────── */}
        <div style={{ margin: "-52px 0 0", background: "#fff", borderRadius: 24, padding: "20px", boxShadow: "0 8px 32px rgba(15,23,42,0.1)", position: "relative", zIndex: 1, border: "1.5px solid #f1f5f9" }}>
          <div className="flex items-start gap-3.5">
            <Skel className="h-[72px] w-[72px] shrink-0 rounded-full" />
            <div className="flex-1 space-y-2 pt-1">
              <Skel className="h-5 w-36 rounded-lg" />
              <Skel className="h-3.5 w-48 rounded-lg" />
              <Skel className="h-3 w-40 rounded-lg" />
            </div>
            <Skel className="h-9 w-16 shrink-0 rounded-full" />
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[
              "bg-emerald-50",
              "bg-blue-50",
              "bg-amber-50",
            ].map((bg, i) => (
              <div key={i} className={`${bg} rounded-[14px] p-3 text-center`}>
                <Skel className="mx-auto h-6 w-10 rounded-lg" />
                <Skel className="mx-auto mt-2 h-2.5 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* ── SAVED PLACES SECTION ────────────────────────────── */}
        <div className="mt-3 rounded-[20px] border border-slate-200 bg-white p-4.5 shadow-sm" style={{ padding: "18px" }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skel className="h-6 w-6 rounded-lg" />
              <Skel className="h-4 w-28 rounded-lg" />
            </div>
            <Skel className="h-4 w-14 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skel className="h-16 w-16 shrink-0 rounded-[14px]" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <Skel className="h-4 w-3/4 rounded-lg" />
                  <Skel className="h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTRIBUTIONS SECTION ───────────────────────────── */}
        <div className="mt-3 rounded-[20px] border border-slate-200 bg-white shadow-sm" style={{ padding: "18px" }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skel className="h-6 w-6 rounded-lg" />
              <Skel className="h-4 w-32 rounded-lg" />
            </div>
            <Skel className="h-4 w-14 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skel className="h-16 w-16 shrink-0 rounded-[14px]" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <Skel className="h-4 w-3/4 rounded-lg" />
                  <Skel className="h-3 w-1/2 rounded-lg" />
                  <Skel className="h-3 w-1/3 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
