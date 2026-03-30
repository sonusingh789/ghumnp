"use client";

import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/context/favorites-context";
import { CheckCircleIcon, HeartIcon, MapPinIcon, StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export default function PlaceCard({
  place,
  layout = "horizontal",
  showFavorite = true,
  imagePriority = false,
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(place.id);

  if (layout === "grid") {
    return (
      <Link
        href={`/place/${place.id}`}
        className="group overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-[0_14px_30px_rgba(17,24,39,0.08)]"
      >
        <div className="relative h-44 overflow-hidden">
          <Image
            src={place.image}
            alt={place.name}
            fill
            sizes="50vw"
            priority={imagePriority}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute right-3 top-3 rounded-full bg-white/[0.92] px-2.5 py-1 text-xs font-semibold text-slate-800">
            <span className="inline-flex items-center gap-1">
              <StarIcon className="size-3 text-amber-400" />
              {place.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="space-y-2 p-4">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">{place.name}</h3>
          <p className="inline-flex items-center gap-1 text-sm text-slate-500">
            <MapPinIcon className="size-4" />
            {place.location}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-3 shadow-[0_16px_34px_rgba(17,24,39,0.08)]">
      <div className="flex gap-4">
        <Link href={`/place/${place.id}`} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[22px]">
          <Image
            src={place.image}
            alt={place.name}
            fill
            sizes="112px"
            priority={imagePriority}
            className="object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-start gap-2">
            <Link href={`/place/${place.id}`} className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-[1.35rem] font-semibold tracking-tight text-slate-950">
                {place.name}
              </h3>
            </Link>
            {showFavorite ? (
              <button
                type="button"
                onClick={() => toggleFavorite(place.id)}
                className={cn(
                  "mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full transition",
                  favorite ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400"
                )}
                aria-label={favorite ? "Remove favorite" : "Add favorite"}
              >
                <HeartIcon filled={favorite} className="size-5" />
              </button>
            ) : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{place.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
              <StarIcon className="size-3.5 text-amber-400" />
              {place.rating.toFixed(1)}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-4" />
              {place.location}
            </span>
            {place.isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircleIcon className="size-3" />
                Verified
              </span>
            ) : null}
          </div>
          {place.contributorName ? (
            <p className="mt-2 text-[11px] text-slate-400">
              Added by{" "}
              <Link
                href={`/contributors/${place.contributorId}`}
                className="font-semibold text-emerald-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                @{place.contributorName}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
