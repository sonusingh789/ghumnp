import Link from "next/link";
import Image from "next/image";
import { MapPinIcon, StarIcon } from "@/components/ui/icons";
import { cn, formatVisitors } from "@/lib/utils";

export default function DistrictCard({ district, compact = false }) {
  return (
    <Link
      href={`/districts/${district.id}`}
      className={cn(
        "group block overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_18px_40px_rgba(17,24,39,0.08)] transition-transform duration-300 hover:-translate-y-1",
        compact ? "w-[248px] shrink-0" : "w-full"
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
        <div className="absolute right-4 top-4 rounded-full bg-white/[0.92] px-3 py-1 text-xs font-semibold text-slate-800 shadow-lg">
          <span className="inline-flex items-center gap-1">
            <StarIcon className="size-3.5 text-amber-400" />
            {district.rating.toFixed(1)}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="text-xl font-semibold tracking-tight">{district.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/[0.84]">{district.tagline}</p>
        </div>
      </div>
      {!compact ? (
        <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500">
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
            {district.province}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPinIcon className="size-4" />
            {formatVisitors(district.visitorsCount)}
          </span>
        </div>
      ) : null}
    </Link>
  );
}
