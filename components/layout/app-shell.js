import { Suspense } from "react";
import BottomNavigation from "@/components/layout/bottom-navigation";
import SidebarNavigation from "@/components/layout/sidebar-navigation";
import { cn } from "@/lib/utils";

export default function AppShell({
  children,
  className,
  contentClassName,
  showNavigation = true,
}) {
  return (
    <div className={cn("mobile-shell lg:flex lg:min-h-screen", className)}>
      {/* Desktop sidebar — hidden on mobile */}
      {showNavigation ? (
        <Suspense fallback={<div className="hidden lg:block w-[260px] flex-shrink-0" />}>
          <SidebarNavigation />
        </Suspense>
      ) : null}

      {/* Main content */}
      <main
        className={cn(
          // Mobile
          "relative min-h-screen w-full px-1 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6",
          // Tablet
          "md:mx-auto md:max-w-[900px] md:px-2 md:pb-32",
          // Desktop — flex-1 fills sidebar remainder, no bottom-nav padding
          "lg:flex-1 lg:w-auto lg:min-w-0 lg:mx-0 lg:max-w-none lg:px-10 lg:pb-14 lg:pt-0",
          contentClassName
        )}
      >
        {/* Mobile-only top gradient glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.16),_transparent_65%)] lg:hidden" />
        {children}
      </main>

      {/* Mobile bottom navigation — hidden on desktop */}
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
    <nav className="glass-panel fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[calc(78px+env(safe-area-inset-bottom))] w-full items-center border-t border-black/5 px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 md:bottom-5 md:h-[78px] md:max-w-[720px] md:rounded-full md:border md:px-3 md:pb-3 md:pt-3 md:shadow-[0_18px_40px_rgba(17,24,39,0.12)] lg:hidden" />
  );
}
