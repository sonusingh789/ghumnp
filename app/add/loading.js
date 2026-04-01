import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function AddLoading() {
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
          <Skel className="mb-1.5 h-2.5 w-20 rounded-md bg-white/20" />
          <Skel className="mb-1.5 h-8 w-40 rounded-xl bg-white/20" />
          <Skel className="h-3 w-64 rounded-md bg-white/20" />
        </div>
      </div>

      {/* ── FORM CONTENT ──────────────────────────────────────── */}
      <div className="space-y-4 px-4 pb-10 pt-5">
        {/* Mode toggle */}
        <Skel className="h-12 w-full rounded-[14px]" />

        {/* Form sections */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-sm">
            {/* Section header */}
            <div className="flex items-center gap-2.5 border-b border-black/5 px-4.5 py-4" style={{ padding: "16px 18px 14px" }}>
              <Skel className="h-9 w-9 shrink-0 rounded-[10px]" />
              <div className="space-y-1.5">
                <Skel className="h-4 w-32 rounded-lg" />
                <Skel className="h-3 w-48 rounded-lg" />
              </div>
            </div>
            {/* Section fields */}
            <div className="space-y-3 p-4" style={{ padding: "16px 18px 20px" }}>
              <Skel className="h-11 w-full rounded-[14px]" />
              <Skel className="h-11 w-full rounded-[14px]" />
              {i === 1 && <Skel className="h-24 w-full rounded-[14px]" />}
            </div>
          </div>
        ))}

        {/* Submit button */}
        <Skel className="h-12 w-full rounded-full" />
      </div>
    </AppShell>
  );
}
