import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function DistrictDetailLoading() {
  return (
    <AppShell contentClassName="!px-0 !pt-0">
      <div className="mx-auto w-full max-w-5xl">
        {/* Hero image */}
        <Skel className="h-64 w-full rounded-none sm:h-80" />

        <div className="space-y-5 px-4 pt-5">
          {/* District name + meta */}
          <div className="space-y-2">
            <Skel className="h-7 w-48 rounded-xl" />
            <Skel className="h-4 w-64 rounded-lg" />
            <div className="flex gap-2 pt-1">
              <Skel className="h-7 w-20 rounded-full" />
              <Skel className="h-7 w-24 rounded-full" />
            </div>
          </div>

          {/* Tab strip */}
          <div className="flex gap-2 border-b border-black/5 pb-3">
            {[1, 2, 3].map((i) => (
              <Skel key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>

          {/* Places grid */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[22px] border border-black/5 bg-white p-3">
                <Skel className="h-28 w-full rounded-[16px]" />
                <div className="mt-2 space-y-1.5">
                  <Skel className="h-4 w-3/4 rounded-lg" />
                  <Skel className="h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
