import AppShell from "@/components/layout/app-shell";

function Skel({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function AddLoading() {
  return (
    <AppShell className="bg-[#f5f6f8]">
      <div className="mx-auto w-full max-w-3xl px-3 pt-5">
        <div className="mb-6 space-y-2">
          <Skel className="h-3 w-20 rounded-full" />
          <Skel className="h-8 w-36 rounded-xl" />
          <Skel className="h-4 w-64 rounded-lg" />
        </div>

        {/* Form card skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mb-4 rounded-[30px] border border-black/8 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1.5">
                <Skel className="h-5 w-24 rounded-lg" />
                <Skel className="h-3 w-40 rounded-lg" />
              </div>
            </div>
            <div className="space-y-3">
              <Skel className="h-11 w-full rounded-[18px]" />
              <Skel className="h-11 w-full rounded-[18px]" />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
