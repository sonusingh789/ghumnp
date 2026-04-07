"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon, MapPinIcon, StarIcon } from "@/components/ui/icons";
import { useFavorites } from "@/context/favorites-context";
import { cn, formatVisitors } from "@/lib/utils";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=75";

export default function DistrictCard({ district, compact = false, imagePriority = false }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const pointerStartRef = useRef(null);
  const isDraggingRef = useRef(false);
  const districtFavoriteId = `district:${district.id}`;
  const saved = isFavorite(districtFavoriteId);
  const href = `/districts/${district.id}`;

  function openDistrict() {
    if (isDraggingRef.current) return;
    router.push(href);
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onPointerDown={(e) => {
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
        isDraggingRef.current = false;
      }}
      onPointerMove={(e) => {
        if (!pointerStartRef.current) return;
        if (Math.abs(e.clientX - pointerStartRef.current.x) > 8 || Math.abs(e.clientY - pointerStartRef.current.y) > 8) {
          isDraggingRef.current = true;
        }
      }}
      onPointerUp={() => { pointerStartRef.current = null; }}
      onPointerCancel={() => { pointerStartRef.current = null; isDraggingRef.current = false; }}
      onClick={openDistrict}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDistrict(); } }}
      style={{
        cursor: "pointer",
        borderRadius: 20,
        overflow: "hidden",
        background: "#fff",
        border: "1.5px solid #f1f5f9",
        boxShadow: "0 4px 18px rgba(15,23,42,0.07)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        touchAction: "auto",
        outline: "none",
        flexShrink: compact ? 0 : undefined,
        width: compact ? 280 : "100%",
      }}
      className={cn(
        "group focus-visible:ring-2 focus-visible:ring-emerald-400",
        "hover:-translate-y-0.5"
      )}
    >
      {/* ── IMAGE ──────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", height: compact ? 168 : 148 }}>
        <Image
          src={district.image || FALLBACK_IMAGE}
          alt={district.name}
          fill
          sizes={compact ? "280px" : "50vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
          priority={imagePriority}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
        />
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)" }} />

        {/* Heart button — top left */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(districtFavoriteId); }}
          style={{
            position: "absolute", top: 10, left: 10, zIndex: 10,
            width: 34, height: 34, borderRadius: "50%", border: "none",
            background: saved ? "rgba(255,228,230,0.95)" : "rgba(255,255,255,0.92)",
            color: saved ? "#f43f5e" : "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
            backdropFilter: "blur(6px)",
            transition: "all 0.15s ease",
          }}
          aria-label={saved ? "Remove saved district" : "Save district"}
        >
          <HeartIcon filled={saved} style={{ width: 15, height: 15 }} />
        </button>

        {/* Rating — top right */}
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 10,
          display: "inline-flex", alignItems: "center", gap: 3,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)",
          borderRadius: 999, padding: "4px 9px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>
          <StarIcon style={{ width: 12, height: 12, color: "#f59e0b" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{district.rating.toFixed(1)}</span>
        </div>

        {/* Name + tagline over image */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "12px 14px", pointerEvents: "none" }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.01em" }}>{district.name}</h3>
          {district.tagline ? (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", marginTop: 3, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {district.tagline}
            </p>
          ) : null}
        </div>
      </div>

      {/* ── FOOTER (non-compact only) ───────────────────────── */}
      {!compact ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: 11, fontWeight: 700, color: "#059669",
              background: "#ecfdf5", borderRadius: 999, padding: "4px 10px",
              textDecoration: "none", border: "1px solid #d1fae5",
            }}
          >
            {district.province}
          </Link>
          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}
          >
            <MapPinIcon style={{ width: 13, height: 13 }} />
            {formatVisitors(district.visitorsCount)}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
