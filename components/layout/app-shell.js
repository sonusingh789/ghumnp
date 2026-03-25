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
      {showNavigation ? <BottomNavigation /> : null}
    </div>
  );
}
