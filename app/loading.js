import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function HomeLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1200px] space-y-8 px-3 pt-4">
        {/* Search bar */}
        <Skel className="h-12 w-full rounded-full" />

        {/* Featured districts strip */}
        <div className="space-y-3">
          <Skel className="h-5 w-40 rounded-lg" />
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Skel key={i} className="h-44 w-36 shrink-0 rounded-[28px]" />
            ))}
          </div>
        </div>

        {/* Popular districts */}
        <div className="space-y-3">
          <Skel className="h-5 w-44 rounded-lg" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skel key={i} className="h-32 rounded-[24px]" />
            ))}
          </div>
        </div>

        {/* Top places */}
        <div className="space-y-3">
          <Skel className="h-5 w-32 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <Skel className="h-20 w-20 shrink-0 rounded-[20px]" />
                <div className="flex-1 space-y-2 pt-1">
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
