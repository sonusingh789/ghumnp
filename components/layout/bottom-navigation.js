"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CompassIcon,
  HeartIcon,
  HomeIcon,
  PlusCircleIcon,
  UserIcon,
} from "@/components/ui/icons";

const navItems = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: CompassIcon },
  { href: "/add", label: "Add", icon: PlusCircleIcon },
  { href: "/favorites", label: "Favorites", icon: HeartIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="glass-panel fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[78px] w-full items-center border-t border-black/5 px-2 pb-4 pt-2 md:bottom-5 md:max-w-[720px] md:rounded-full md:border md:px-3 md:pb-3 md:pt-3 md:shadow-[0_18px_40px_rgba(17,24,39,0.12)]">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-all md:flex-row md:gap-2 md:text-sm",
              active ? "text-primary" : "text-slate-500"
            )}
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-full transition-all",
                active ? "bg-primary-soft text-primary" : "bg-transparent"
              )}
            >
              <Icon className="size-5" filled={active} />
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
