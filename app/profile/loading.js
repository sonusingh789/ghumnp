import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function ProfileLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-5 px-3 pt-4">
        {/* Profile card */}
        <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <Skel className="h-16 w-16 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skel className="h-5 w-40 rounded-lg" />
              <Skel className="h-3 w-56 rounded-lg" />
            </div>
          </div>
          {/* Stats row */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[18px] bg-slate-50 p-3">
                <Skel className="mx-auto h-6 w-10 rounded-lg" />
                <Skel className="mx-auto mt-2 h-3 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skel key={i} className="h-9 flex-1 rounded-full" />
          ))}
        </div>

        {/* Content list */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[24px] border border-black/5 bg-white p-4">
              <div className="flex gap-3">
                <Skel className="h-14 w-14 shrink-0 rounded-[16px]" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skel className="h-4 w-3/4 rounded-lg" />
                  <Skel className="h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
