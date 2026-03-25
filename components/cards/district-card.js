"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HeartIcon, MapPinIcon, StarIcon } from "@/components/ui/icons";
import { useFavorites } from "@/context/favorites-context";
import { cn, formatVisitors } from "@/lib/utils";

export default function DistrictCard({ district, compact = false }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const districtFavoriteId = `district:${district.id}`;
  const saved = isFavorite(districtFavoriteId);
  const href = `/districts/${district.id}`;

  function openDistrict() {
    router.push(href);
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDistrict}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDistrict();
        }
      }}
      className={cn(
        "group block cursor-pointer touch-manipulation overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_18px_40px_rgba(17,24,39,0.08)] transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
        compact ? "w-[300px] shrink-0" : "w-full"
      )}
    >
      <div className={cn("relative overflow-hidden", compact ? "h-48" : "h-44")}>
        <Image
          src={district.image}
          alt={district.name}
          fill
          sizes={compact ? "248px" : "50vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
          priority={compact}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/[0.18] to-transparent" />
        <div className="absolute left-4 top-4 z-10">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleFavorite(districtFavoriteId);
            }}
            className={cn(
              "flex size-10 items-center justify-center rounded-full shadow-lg transition",
              saved ? "bg-rose-50 text-rose-500" : "bg-white/[0.92] text-slate-800"
            )}
            aria-label={saved ? "Remove saved district" : "Save district"}
          >
            <HeartIcon filled={saved} className="size-5" />
          </button>
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-white/[0.92] px-3 py-1 text-xs font-semibold text-slate-800 shadow-lg">
          <span className="inline-flex items-center gap-1">
            <StarIcon className="size-3.5 text-amber-400" />
            {district.rating.toFixed(1)}
          </span>
        </div>
        <Link
          href={href}
          onClick={(event) => event.stopPropagation()}
          className="absolute inset-0"
          aria-label={`Open ${district.name}`}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="text-xl font-semibold tracking-tight">{district.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/[0.84]">{district.tagline}</p>
        </div>
      </div>
      {!compact ? (
        <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500">
          <Link
            href={href}
            onClick={(event) => event.stopPropagation()}
            className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700"
          >
            {district.province}
          </Link>
          <Link
            href={href}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1"
          >
            <MapPinIcon className="size-4" />
            {formatVisitors(district.visitorsCount)}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
