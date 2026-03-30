import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function FavoritesLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-6 px-3 pt-4">
        {/* Header */}
        <div className="space-y-2">
          <Skel className="h-7 w-40 rounded-xl" />
          <Skel className="h-4 w-60 rounded-lg" />
        </div>

        {/* Favorite places section */}
        <div className="space-y-3">
          <Skel className="h-5 w-36 rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[24px] border border-black/5 bg-white p-3">
                <Skel className="h-32 w-full rounded-[18px]" />
                <div className="mt-3 space-y-2">
                  <Skel className="h-4 w-3/4 rounded-lg" />
                  <Skel className="h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite districts section */}
        <div className="space-y-3">
          <Skel className="h-5 w-44 rounded-lg" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 rounded-[22px] border border-black/5 bg-white p-3">
                <Skel className="h-14 w-14 shrink-0 rounded-[16px]" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skel className="h-4 w-2/3 rounded-lg" />
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
