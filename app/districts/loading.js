import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function DistrictsLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1200px] space-y-5 px-3 pt-4">
        {/* Header + search */}
        <div className="space-y-3">
          <Skel className="h-7 w-44 rounded-xl" />
          <Skel className="h-11 w-full rounded-full" />
        </div>

        {/* Province filter chips */}
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skel key={i} className="h-8 w-24 shrink-0 rounded-full" />
          ))}
        </div>

        {/* District cards grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-[24px] border border-black/5 bg-white p-3">
              <Skel className="h-28 w-full rounded-[18px]" />
              <div className="mt-2 space-y-1.5">
                <Skel className="h-4 w-3/4 rounded-lg" />
                <Skel className="h-3 w-1/2 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
