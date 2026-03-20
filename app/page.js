"use client";

import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "@/components/ui/icons";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="mobile-shell bg-black">
      <div
        className="relative min-h-screen"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.26), rgba(0,0,0,0.72)), url('https://images.unsplash.com/photo-1469521669194-babb45599def?w=1400&auto=format&fit=crop')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-x-0 bottom-0 p-6 pb-12 text-white">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur">
            Nepal Tourism Platform
          </div>
          <h1 className="mt-5 max-w-sm text-5xl font-semibold leading-[1.02] tracking-[-0.06em]">
            Explore All 77 Districts of Nepal
          </h1>
          <p className="mt-4 max-w-sm text-base leading-7 text-white/80">
            Discover hidden gems, local foods, cultural experiences, sacred places, and mountain stories in one polished mobile experience.
          </p>
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-[24px] bg-primary px-5 py-5 text-lg font-semibold text-white shadow-[0_18px_34px_rgba(22,163,74,0.32)] transition hover:bg-primary-strong"
          >
            Start Exploring
            <ChevronRightIcon className="size-5" />
          </button>
          <p className="mt-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-white/60">
            Community-driven tourism platform
          </p>
        </div>
      </div>
    </div>
  );
}
