import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function AllPlacesLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-5 px-3 pt-4">
        <div className="space-y-2">
          <Skel className="h-7 w-36 rounded-xl" />
          <Skel className="h-4 w-52 rounded-lg" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-[22px] border border-black/5 bg-white p-3">
              <Skel className="h-16 w-16 shrink-0 rounded-[16px]" />
              <div className="flex-1 space-y-2 pt-1">
                <Skel className="h-4 w-3/4 rounded-lg" />
                <Skel className="h-3 w-1/2 rounded-lg" />
                <Skel className="h-3 w-1/3 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
