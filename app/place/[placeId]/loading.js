import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function PlaceDetailLoading() {
  return (
    <AppShell contentClassName="!px-0 !pt-0">
      <div className="mx-auto w-full max-w-5xl">
        {/* Image carousel area */}
        <Skel className="h-72 w-full rounded-none sm:h-96" />

        <div className="space-y-5 px-4 pt-5">
          {/* Category + title */}
          <div className="space-y-2">
            <Skel className="h-3 w-24 rounded-lg" />
            <Skel className="h-7 w-56 rounded-xl" />
            <Skel className="h-4 w-40 rounded-lg" />
          </div>

          {/* Rating + action buttons */}
          <div className="flex items-center gap-3">
            <Skel className="h-9 w-20 rounded-full" />
            <Skel className="h-9 w-9 rounded-full" />
            <Skel className="h-9 w-9 rounded-full" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skel className="h-3 w-full rounded-lg" />
            <Skel className="h-3 w-full rounded-lg" />
            <Skel className="h-3 w-3/4 rounded-lg" />
          </div>

          {/* Nearby spots */}
          <div className="space-y-3">
            <Skel className="h-5 w-32 rounded-lg" />
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 rounded-[22px] border border-black/5 bg-white p-3">
                <Skel className="h-20 w-20 shrink-0 rounded-[16px]" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skel className="h-3 w-1/3 rounded-lg" />
                  <Skel className="h-4 w-2/3 rounded-lg" />
                  <Skel className="h-3 w-full rounded-lg" />
                </div>
              </div>
            ))}
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
      </div>
    </AppShell>
  );
}
