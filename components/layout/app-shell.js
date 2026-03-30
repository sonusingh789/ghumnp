import { Suspense } from "react";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { cn } from "@/lib/utils";

export default function AppShell({
  children,
  className,
  contentClassName,
  showNavigation = true,
}) {
  return (
    <div className={cn("mobile-shell", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.16),_transparent_65%)]" />
      <main
        className={cn(
          "relative mx-auto min-h-screen w-full max-w-[1200px] px-1 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 md:px-1.5 md:pb-32 lg:px-2",
          contentClassName
        )}
      >
        {children}
      </main>
      {showNavigation ? (
        <Suspense fallback={<StaticNav />}>
          <BottomNavigation />
        </Suspense>
      ) : null}
    </div>
  );
}

function StaticNav() {
  return (
    <nav className="glass-panel fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[calc(78px+env(safe-area-inset-bottom))] w-full items-center border-t border-black/5 px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 md:bottom-5 md:h-[78px] md:max-w-[720px] md:rounded-full md:border md:px-3 md:pb-3 md:pt-3 md:shadow-[0_18px_40px_rgba(17,24,39,0.12)]" />
  );
}
