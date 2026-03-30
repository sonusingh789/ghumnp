import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function ExploreLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1200px] space-y-5 px-3 pt-4">
        {/* Header + search */}
        <div className="space-y-3">
          <Skel className="h-7 w-44 rounded-xl" />
          <Skel className="h-11 w-full rounded-full" />
        </div>

        {/* Province tabs */}
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skel key={i} className="h-9 w-20 shrink-0 rounded-full" />
          ))}
        </div>

        {/* Province section */}
        {[1, 2].map((p) => (
          <div key={p} className="space-y-3">
            <Skel className="h-5 w-36 rounded-lg" />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skel key={i} className="h-24 rounded-[20px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
