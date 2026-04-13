"use client";

import Link from "next/link";
import BlurImage from "@/components/ui/blur-image";
import { useFavorites } from "@/context/favorites-context";

/* ── Skeleton card — standard wave shimmer ── */
export function PlaceCardSkeleton() {
  return (
    <div style={{
      borderRadius: 20,
      border: "1.5px solid #f1f5f9",
      background: "#fff",
      padding: 12,
      boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div className="img-skeleton" style={{ width: 96, height: 96, borderRadius: 14, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="img-skeleton" style={{ height: 14, borderRadius: 6, width: "60%" }} />
          <div className="img-skeleton" style={{ height: 11, borderRadius: 6, width: "90%" }} />
          <div className="img-skeleton" style={{ height: 11, borderRadius: 6, width: "75%" }} />
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <div className="img-skeleton" style={{ height: 20, width: 56, borderRadius: 999 }} />
            <div className="img-skeleton" style={{ height: 20, width: 72, borderRadius: 999 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
import { CheckCircleIcon, HeartIcon, MapPinIcon, StarIcon } from "@/components/ui/icons";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop";

export default function PlaceCard({
  place,
  layout = "horizontal",
  showFavorite = true,
  imagePriority = false,
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(place.id);

  /* ── GRID LAYOUT ─────────────────────────────────────────── */
  if (layout === "grid") {
    return (
      <Link
        href={`/place/${place.id}`}
        style={{
          display: "block",
          borderRadius: 20,
          overflow: "hidden",
          background: "#fff",
          border: "1.5px solid #f1f5f9",
          boxShadow: "0 4px 18px rgba(15,23,42,0.07)",
          textDecoration: "none",
        }}
        className="group"
      >
        <div style={{ position: "relative", height: 160, overflow: "hidden", background: "#e8edf2", transform: "translateZ(0)" }}>
          <BlurImage
            src={place.image || FALLBACK_IMAGE}
            alt={place.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            priority={imagePriority}
            loading={imagePriority ? "eager" : undefined}
            className="object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
          <div style={{
            position: "absolute", top: 10, right: 10,
            display: "inline-flex", alignItems: "center", gap: 3,
            background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)",
            borderRadius: 999, padding: "4px 9px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}>
            <StarIcon style={{ width: 11, height: 11, color: "#f59e0b" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{place.rating.toFixed(1)}</span>
          </div>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, marginBottom: 5 }}>{place.name}</h3>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280" }}>
            <MapPinIcon style={{ width: 13, height: 13 }} />
            {place.location}
          </p>
        </div>
      </Link>
    );
  }

  /* ── HORIZONTAL LAYOUT (default) ─────────────────────────── */
  return (
    <div style={{
      borderRadius: 20,
      border: "1.5px solid #f1f5f9",
      background: "#fff",
      padding: "12px",
      boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
    }}>
      <div style={{ display: "flex", gap: 12 }}>
        {/* Thumbnail */}
        <Link
          href={`/place/${place.id}`}
          style={{ position: "relative", width: 96, height: 96, flexShrink: 0, borderRadius: 14, overflow: "hidden", display: "block", background: "#e8edf2", transform: "translateZ(0)" }}
        >
          <BlurImage
            src={place.image || FALLBACK_IMAGE}
            alt={place.name}
            fill
            sizes="96px"
            priority={imagePriority}
            className="object-cover"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          />
        </Link>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Link href={`/place/${place.id}`} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.25, letterSpacing: "-0.01em", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {place.name}
              </h3>
            </Link>
            {showFavorite ? (
              <button
                type="button"
                onClick={() => toggleFavorite(place.id)}
                style={{
                  width: 32, height: 32, flexShrink: 0, borderRadius: "50%", border: "none",
                  background: favorite ? "rgba(255,228,230,0.9)" : "#f8fafc",
                  color: favorite ? "#f43f5e" : "#6b7280",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s ease",
                }}
                aria-label={favorite ? "Remove favorite" : "Add favorite"}
              >
                <HeartIcon filled={favorite} style={{ width: 14, height: 14 }} />
              </button>
            ) : null}
          </div>

          {/* Description */}
          <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {place.description}
          </p>

          {/* Meta row */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
              <StarIcon style={{ width: 12, height: 12, color: "#f59e0b" }} />
              {place.rating.toFixed(1)}
            </span>
            <span aria-hidden="true" style={{ color: "#e2e8f0", fontSize: 12 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: "#6b7280", minWidth: 0, overflow: "hidden" }}>
              <MapPinIcon style={{ width: 12, height: 12, flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{place.location}</span>
            </span>
            {place.isVerified ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "2px 8px" }}>
                <CheckCircleIcon style={{ width: 10, height: 10 }} />
                Verified
              </span>
            ) : null}
          </div>

          {/* Contributor */}
          {place.contributorName ? (
            <p style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
              By{" "}
              <Link
                href={`/contributors/${place.contributorId}`}
                style={{ fontWeight: 700, color: "#059669", textDecoration: "none" }}
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
