"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BlurImage from "@/components/ui/blur-image";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import PlaceCard, { PlaceCardSkeleton } from "@/components/cards/place-card";
import { useFavorites } from "@/context/favorites-context";
import { buildLoginHref } from "@/utils/navigation";
import {
  ArrowLeftIcon,
  HeartIcon,
  MapPinIcon,
  ShareIcon,
  StarIcon,
  XIcon,
} from "@/components/ui/icons";
import { formatVisitors } from "@/lib/utils";

const tabs = ["All", "Tourist Attraction", "Local Food", "Restaurant", "Hotel", "Local Stay"];

/** Render rich HTML or fall back to plain-text paragraphs */
function RichContent({ text, className = "", style }) {
  if (!text) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(text);
  if (isHtml) {
    return (
      <div
        className={`rich-content ${className}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  // Legacy plain text — split on double newlines
  return (
    <div className={className} style={style}>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} style={{ margin: "0 0 0.6em" }}>{p}</p>
      ))}
    </div>
  );
}

const TAB_LABELS = {
  All: { eyebrow: "All Places", heading: (name) => `All Places in ${name}` },
  "Tourist Attraction": { eyebrow: "Tourist Attractions", heading: (name) => `Top Tourist Attractions in ${name}` },
  "Local Food": { eyebrow: "Local Food", heading: (name) => `Local Food Spots in ${name}` },
  Restaurant: { eyebrow: "Restaurants", heading: (name) => `Restaurants in ${name}` },
  Hotel: { eyebrow: "Hotels", heading: (name) => `Hotels in ${name}` },
  "Local Stay": { eyebrow: "Local Stays", heading: (name) => `Local Stays in ${name}` },
};

const TAB_EMOJIS = {
  All: "🗺️",
  "Tourist Attraction": "🏛️",
  "Local Food": "🍜",
  Restaurant: "🍽️",
  Hotel: "🏨",
  "Local Stay": "🏡",
};

// Maps each category tab to its dedicated SEO page slug.
// "All" has no dedicated page so it stays null.
const TAB_SLUG = {
  All: null,
  "Tourist Attraction": "attraction",
  "Local Food": "food",
  Restaurant: "restaurant",
  Hotel: "hotel",
  "Local Stay": "stay",
};

async function copyTextFallback(text) {
  if (typeof navigator === "undefined") return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function tryNativeShare(payloads) {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  for (const payload of payloads) {
    try {
      if (typeof navigator.canShare === "function" && !navigator.canShare(payload)) continue;
      await navigator.share(payload);
      return true;
    } catch (error) {
      if (error?.name === "AbortError") throw error;
    }
  }
  return false;
}

export default function DistrictDetailScreen({ district, districtPlaces }) {
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingDisplay, setRatingDisplay] = useState(Number(district.rating || 0));
  const [ratingError, setRatingError] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [visitorsCount, setVisitorsCount] = useState(Number(district.visitorsCount || 0));
  const { isFavorite, toggleFavorite, authenticated } = useFavorites();
  const router = useRouter();
  const shareTimerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [district.id]);
  const seo = district.seoContent || {};
  const districtFavoriteId = `district:${district.id}`;
  const isSaved = isFavorite(districtFavoriteId);
  const hasExtendedInfo =
    Boolean(seo.intro) ||
    Boolean(seo.topThingsToDo?.length) ||
    Boolean(seo.bestTimeToVisit) ||
    Boolean(seo.howToReach) ||
    Boolean(seo.localFoodsCulture) ||
    Boolean(seo.faqs?.length);

  const [cardsLoading, setCardsLoading] = useState(false);
  const cardsTimerRef = useRef(null);

  function triggerCardsLoading() {
    setCardsLoading(true);
    clearTimeout(cardsTimerRef.current);
    cardsTimerRef.current = setTimeout(() => setCardsLoading(false), 400);
  }

  useEffect(() => () => clearTimeout(cardsTimerRef.current), []);

  const PLACES_PER_PAGE = 7;

  const filteredPlaces = districtPlaces.filter((place) => {
    if (activeTab === "All") return true;
    const normalizedCategory = String(place.category || "").trim().toLowerCase();
    const normalizedTab = activeTab.trim().toLowerCase();
    const categoryAliases = {
      "tourist attraction": ["tourist attraction", "attraction"],
      "local food": ["local food", "food"],
      restaurant: ["restaurant"],
      hotel: ["hotel"],
      "local stay": ["local stay", "stay"],
    };
    return (categoryAliases[normalizedTab] || [normalizedTab]).includes(normalizedCategory);
  });

  const totalPages = Math.ceil(filteredPlaces.length / PLACES_PER_PAGE);
  const paginatedPlaces = filteredPlaces.slice((currentPage - 1) * PLACES_PER_PAGE, currentPage * PLACES_PER_PAGE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const visitKey = `district-visit:${district.id}`;
    const storedCount = Number(window.sessionStorage.getItem(visitKey) || "");
    if (Number.isFinite(storedCount) && storedCount > 0) {
      const frameId = window.requestAnimationFrame(() => {
        setVisitorsCount((current) => Math.max(current, storedCount));
      });
      return () => { window.cancelAnimationFrame(frameId); };
    }
    if (storedCount > 0) return;
    let cancelled = false;
    async function trackVisit() {
      try {
        const response = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entityType: "district", slug: district.id }),
        });
        const data = await response.json().catch(() => ({}));
        if (!cancelled && response.ok && typeof data.visitorsCount === "number") {
          window.sessionStorage.setItem(visitKey, String(data.visitorsCount));
          setVisitorsCount(data.visitorsCount);
        }
      } catch {}
    }
    trackVisit();
    return () => { cancelled = true; };
  }, [district.id]);

  function setTemporaryShareFeedback(message) {
    if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    setShareFeedback(message);
    shareTimerRef.current = setTimeout(() => setShareFeedback(""), 2000);
  }

  function openRatingDialog() {
    setRatingError("");
    setShowRatingDialog(true);
  }

  async function handleDistrictRatingSubmit() {
    if (!authenticated) {
      router.push(buildLoginHref(`/districts/${district.id}`));
      return;
    }
    setSubmittingRating(true);
    setRatingError("");
    try {
      const response = await fetch(`/api/districts/${district.id}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: ratingValue }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) { router.push(buildLoginHref(`/districts/${district.id}`)); return; }
        setRatingError(data.error || "Unable to submit district rating.");
        return;
      }
      if (typeof data.rating === "number") setRatingDisplay(data.rating);
      setShowRatingDialog(false);
    } catch {
      setRatingError("Unable to submit district rating.");
    } finally {
      setSubmittingRating(false);
    }
  }

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const sharePayloads = [
      { title: district.name, text: `Check out ${district.name} district on visitNepal77`, url: shareUrl },
      { title: district.name, url: shareUrl },
      { text: `Check out ${district.name} district on visitNepal77`, url: shareUrl },
      { url: shareUrl },
    ];
    try {
      const openedNativeShare = await tryNativeShare(sharePayloads);
      if (openedNativeShare) { setTemporaryShareFeedback("Shared"); return; }
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareUrl); setTemporaryShareFeedback("Link copied"); return; }
      const copied = await copyTextFallback(shareUrl);
      setTemporaryShareFeedback(copied ? "Link copied" : "Open browser share");
    } catch (shareError) {
      if (shareError?.name === "AbortError") return;
      try {
        if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareUrl); setTemporaryShareFeedback("Link copied"); return; }
      } catch {}
      const copied = await copyTextFallback(shareUrl);
      setTemporaryShareFeedback(copied ? "Link copied" : "Open browser share");
    }
  }

  return (
    <AppShell contentClassName="pt-0">

      {/* ── HERO IMAGE ─────────────────────────────────────── */}
      <div className="district-hero" style={{ position: "relative", height: 300, margin: "-24px -1px 0", overflow: "hidden", background: "#1a3a2a", transform: "translateZ(0)" }}>
        <BlurImage
          src={district.image}
          alt={`${district.name} district, ${district.province} Province, Nepal`}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* Gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.3) 100%)" }} />

        {/* Top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "env(safe-area-inset-top, 16px) 16px 0", paddingTop: "max(env(safe-area-inset-top), 44px)" }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.18)" }}
            aria-label="Go back"
          >
            <ArrowLeftIcon style={{ width: 18, height: 18, color: "#0f172a" }} />
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleShare}
              style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.18)" }}
              aria-label="Share"
            >
              <ShareIcon style={{ width: 17, height: 17, color: "#0f172a" }} />
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(districtFavoriteId)}
              style={{ width: 38, height: 38, borderRadius: "50%", background: isSaved ? "rgba(255,228,230,0.95)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.18)", color: isSaved ? "#f43f5e" : "#0f172a" }}
              aria-label={isSaved ? "Remove saved" : "Save district"}
            >
              <HeartIcon filled={isSaved} style={{ width: 17, height: 17 }} />
            </button>
          </div>
        </div>

        {/* Share feedback */}
        {shareFeedback ? (
          <div style={{ position: "absolute", top: 62, right: 16, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#0f172a", boxShadow: "0 2px 10px rgba(0,0,0,0.14)" }}>
            {shareFeedback}
          </div>
        ) : null}

        {/* District name + province overlaid at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px 24px", pointerEvents: "none" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(5,150,105,0.35)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderRadius: 999, padding: "3px 8px", marginBottom: 6, border: "1px solid rgba(255,255,255,0.15)" }}>
            <MapPinIcon style={{ width: 9, height: 9, color: "rgba(255,255,255,0.85)" }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{district.province}</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 4 }}>{district.name}</h1>
          {district.tagline ? (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.5 }}>{district.tagline}</p>
          ) : null}
        </div>
      </div>

      {/* ── PULL-UP CONTENT ────────────────────────────────── */}
      <div className="district-content" style={{ background: "rgba(247,250,247,1)", borderRadius: "24px 24px 0 0", marginTop: -20, position: "relative", zIndex: 1, overflow: "hidden" }}>

        {/* Blurred tint — fixed height so it never grows with content */}
        <div style={{ position: "absolute", top: -40, left: 0, right: 0, height: 480, zIndex: -1, pointerEvents: "none", overflow: "hidden" }} aria-hidden="true">
          <Image
            src={district.image}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover", filter: "blur(40px) saturate(2) brightness(0.8)", transform: "scale(1.1)" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 60%, rgba(255,255,255,1) 100%)" }} />
        </div>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ padding: "16px 20px 0" }}>
          <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, listStyle: "none", margin: 0, padding: 0 }}>
            {[["Home", "/"], ["Districts", "/districts"], [district.name, null]].map(([label, href], i) => (
              <li key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {i > 0 && <span aria-hidden="true" style={{ color: "#6b7280", fontSize: 11 }}>/</span>}
                {href ? (
                  <Link href={href} style={{ fontSize: 11, color: "#64748b", textDecoration: "none" }}>{label}</Link>
                ) : (
                  <span style={{ fontSize: 11, color: "#1e293b", fontWeight: 600 }}>{label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Stats chips — .district-meta used by Speakable schema */}
        <div className="district-meta" style={{ display: "flex", gap: 8, padding: "14px 20px 0" }}>
          <button
            type="button"
            onClick={openRatingDialog}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 700, color: "#d97706", cursor: "pointer", whiteSpace: "nowrap" }}
            aria-label="Rate this district"
          >
            <StarIcon style={{ width: 13, height: 13, color: "#f59e0b", flexShrink: 0 }} />
            {ratingDisplay.toFixed(1)} · Rate
          </button>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>
            <MapPinIcon style={{ width: 13, height: 13, flexShrink: 0 }} />
            {formatVisitors(visitorsCount)}
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#ecfdf5", border: "1px solid #d1fae5", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 700, color: "#059669", whiteSpace: "nowrap" }}>
            🏛️ {districtPlaces.length} places
          </div>
        </div>

        {/* ── CATEGORY TABS ──────────────────────────────────────
             Each tab does double duty:
             • Normal click  → filters inline (preventDefault keeps user on page)
             • href present  → Google crawls the dedicated category page
             • Cmd/middle-click → opens dedicated page in new tab naturally
        ─────────────────────────────────────────────────────── */}
        <div role="tablist" className="scrollbar-hide" style={{ display: "flex", gap: 8, padding: "16px 20px 0", overflowX: "auto" }}>
          {tabs.map((tab) => {
            const active = activeTab === tab;
            const slug = TAB_SLUG[tab];
            const tabStyle = {
              display: "flex", alignItems: "center", gap: 5,
              borderRadius: 999, padding: "8px 14px",
              border: active ? "none" : "1.5px solid rgba(226,232,240,0.55)",
              cursor: "pointer", fontSize: 12, fontWeight: 700,
              whiteSpace: "nowrap", flexShrink: 0,
              background: active ? "#059669" : "rgba(255,255,255,0.65)",
              WebkitBackdropFilter: active ? "none" : "blur(10px)",
              color: active ? "#fff" : "#475569",
              boxShadow: active ? "0 4px 14px rgba(5,150,105,0.3)" : "0 1px 4px rgba(15,23,42,0.04)",
              transition: "all 0.15s ease",
              textDecoration: "none",
            };
            const handleClick = (e) => {
              // Let cmd/ctrl/middle-click open the dedicated page naturally
              if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
              e.preventDefault();
              setActiveTab(tab);
              setCurrentPage(1);
              triggerCardsLoading();
            };
            return slug ? (
              <Link
                key={tab}
                href={`/places/${district.id}/${slug}`}
                role="tab"
                aria-selected={active}
                onClick={handleClick}
                style={tabStyle}
              >
                <span aria-hidden="true">{TAB_EMOJIS[tab]}</span>
                {tab}
              </Link>
            ) : (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); triggerCardsLoading(); }}
                style={tabStyle}
              >
                <span aria-hidden="true">{TAB_EMOJIS[tab]}</span>
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── PLACES LIST ────────────────────────────────────── */}
        <div style={{ padding: "20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#047857", marginBottom: 2 }}>
                {TAB_LABELS[activeTab].eyebrow}
              </p>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                {TAB_LABELS[activeTab].heading(district.name)}
              </h2>
            </div>
            {filteredPlaces.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "3px 10px" }}>
                {filteredPlaces.length}
              </span>
            )}
          </div>

          {filteredPlaces.length ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cardsLoading
                  ? Array.from({ length: Math.min(paginatedPlaces.length || 5, 8) }).map((_, i) => (
                      <PlaceCardSkeleton key={i} />
                    ))
                  : paginatedPlaces.map((place) => <PlaceCard key={place.id} place={place} />)
                }
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 }}>
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); triggerCardsLoading(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={currentPage === 1}
                    style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid rgba(226,232,240,0.7)", background: currentPage === 1 ? "rgba(248,250,252,0.5)" : "rgba(255,255,255,0.72)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", cursor: currentPage === 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: currentPage === 1 ? "#cbd5e1" : "#475569", fontSize: 14, fontWeight: 700, transition: "all 0.15s", flexShrink: 0 }}
                    aria-label="Previous page"
                  >‹</button>

                  {/* Page numbers */}
                  <div className="scrollbar-hide" style={{ display: "flex", gap: 6, overflowX: "auto", maxWidth: 260 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => { setCurrentPage(page); triggerCardsLoading(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        style={{ flexShrink: 0, minWidth: 34, height: 34, borderRadius: 999, border: page === currentPage ? "none" : "1.5px solid rgba(226,232,240,0.7)", background: page === currentPage ? "#059669" : "rgba(255,255,255,0.72)", backdropFilter: page === currentPage ? "none" : "blur(10px)", WebkitBackdropFilter: page === currentPage ? "none" : "blur(10px)", color: page === currentPage ? "#fff" : "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: page === currentPage ? "0 4px 12px rgba(5,150,105,0.3)" : "none", transition: "all 0.15s" }}
                        aria-label={`Page ${page}`}
                        aria-current={page === currentPage ? "page" : undefined}
                      >{page}</button>
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); triggerCardsLoading(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={currentPage === totalPages}
                    style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid rgba(226,232,240,0.7)", background: currentPage === totalPages ? "rgba(248,250,252,0.5)" : "rgba(255,255,255,0.72)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", cursor: currentPage === totalPages ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: currentPage === totalPages ? "#cbd5e1" : "#475569", fontSize: 14, fontWeight: 700, transition: "all 0.15s", flexShrink: 0 }}
                    aria-label="Next page"
                  >›</button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8fafc", borderRadius: 20, border: "1.5px dashed rgba(226,232,240,0.7)" }}>
              <p style={{ fontSize: 28, marginBottom: 10 }}>🗺️</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No places yet</p>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Be the first to add a place here!</p>
              <Link
                href="/add"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #059669 0%, #047857 100%)", color: "#fff", borderRadius: 999, padding: "10px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(5,150,105,0.3)" }}
              >
                + Add a Place
              </Link>
            </div>
          )}
        </div>

        {/* ── TRAVEL GUIDE ───────────────────────────────────── */}
        {hasExtendedInfo ? (
          <div style={{ padding: "0 16px 40px" }}>
            {/* Section header */}
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#047857", marginBottom: 2 }}>Travel Guide</p>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                {district.name} — Complete Guide
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

              {/* About — borderless flowing text with icon badge */}
              {seo.intro ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "#ecfdf5", border: "1px solid #d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏔️</div>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#047857" }}>About</p>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>About {district.name}</h3>
                    </div>
                  </div>
                  {/* .district-intro used by Speakable schema */}
                  <div className="district-intro" style={{ borderLeft: "2px solid rgba(5,150,105,0.3)", paddingLeft: 14 }}>
                    <RichContent text={seo.intro} style={{ fontSize: 13, lineHeight: 1.75, color: "#334155" }} />
                  </div>
                </div>
              ) : null}

              {/* Quick info — horizontal scrollable cards */}
              {(seo.bestTimeToVisit || seo.howToReach || seo.localFoodsCulture) ? (
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#64748b", marginBottom: 12 }}>Quick Info</p>
                  <div className="scrollbar-hide" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginLeft: -2, paddingLeft: 2 }}>
                    {seo.bestTimeToVisit ? (
                      <div style={{ flexShrink: 0, width: 185, background: "#fff", borderRadius: 18, padding: "16px", border: "1.5px solid rgba(226,232,240,0.6)" }}>
                        <div style={{ fontSize: 22, marginBottom: 8 }}>🌤️</div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#059669", marginBottom: 3 }}>Best Time</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>When to Visit</p>
                        <RichContent text={seo.bestTimeToVisit} style={{ fontSize: 12, color: "#64748b", lineHeight: 1.65 }} />
                      </div>
                    ) : null}
                    {seo.howToReach ? (
                      <div style={{ flexShrink: 0, width: 185, background: "#fff", borderRadius: 18, padding: "16px", border: "1.5px solid rgba(226,232,240,0.6)" }}>
                        <div style={{ fontSize: 22, marginBottom: 8 }}>🚌</div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#059669", marginBottom: 3 }}>Getting There</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>How to Reach</p>
                        <RichContent text={seo.howToReach} style={{ fontSize: 12, color: "#64748b", lineHeight: 1.65 }} />
                      </div>
                    ) : null}
                    {seo.localFoodsCulture ? (
                      <div style={{ flexShrink: 0, width: 185, background: "#fff", borderRadius: 18, padding: "16px", border: "1.5px solid rgba(226,232,240,0.6)" }}>
                        <div style={{ fontSize: 22, marginBottom: 8 }}>🍜</div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#059669", marginBottom: 3 }}>Culture</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Food & Culture</p>
                        <RichContent text={seo.localFoodsCulture} style={{ fontSize: 12, color: "#64748b", lineHeight: 1.65 }} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Top things to do — horizontal scrollable numbered tiles */}
              {seo.topThingsToDo?.length ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⭐</div>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#d97706" }}>Activities</p>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Top Things To Do</h3>
                    </div>
                  </div>
                  <div className="scrollbar-hide" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginLeft: -2, paddingLeft: 2 }}>
                    {seo.topThingsToDo.map((item, i) => (
                      <div key={item} style={{ flexShrink: 0, width: 148, background: "#fff", borderRadius: 18, padding: "14px", border: "1.5px solid rgba(226,232,240,0.6)", display: "flex", flexDirection: "column", gap: 10 }}>
                        <span style={{ width: 28, height: 28, borderRadius: 999, background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                        <p style={{ fontSize: 12, color: "#334155", lineHeight: 1.55, fontWeight: 600 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* FAQs — single glass panel, divider-separated rows */}
              {seo.faqs?.length ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>❓</div>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#d97706" }}>FAQ</p>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Before You Go</h3>
                    </div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(226,232,240,0.55)", overflow: "hidden" }}>
                    {seo.faqs.map((item, index) => {
                      const [question, ...rest] = item.split("::");
                      const answer = rest.join("::").trim();
                      return (
                        <div key={`${question}-${index}`} style={{ padding: "14px 16px", borderBottom: index < seo.faqs.length - 1 ? "1px solid rgba(226,232,240,0.45)" : "none" }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: answer ? 6 : 0, display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ color: "#059669", fontWeight: 900, flexShrink: 0 }}>Q.</span>
                            {question?.trim()}
                          </p>
                          {answer ? <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, paddingLeft: 20 }}>{answer}</p> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

            </div>
          </div>
        ) : null}
      </div>

      {/* ── RATING DIALOG ──────────────────────────────────── */}
      {showRatingDialog ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 340, background: "#fff", borderRadius: 24, padding: "22px", boxShadow: "0 24px 64px rgba(15,23,42,0.22)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 4 }}>Rate District</p>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>{district.name}</h2>
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Tap a star to rate</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRatingDialog(false)}
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#64748b" }}
                aria-label="Close"
              >
                <XIcon style={{ width: 15, height: 15 }} />
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRatingValue(value)}
                  style={{ width: 48, height: 48, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: value <= ratingValue ? "#fffbeb" : "#f8fafc", transition: "all 0.15s ease" }}
                  aria-label={`Rate ${value} stars`}
                >
                  <StarIcon style={{ width: 22, height: 22, color: value <= ratingValue ? "#f59e0b" : "#cbd5e1" }} filled={value <= ratingValue} />
                </button>
              ))}
            </div>

            <p style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
              {ratingValue} / 5 stars
            </p>

            {ratingError ? (
              <div style={{ borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 14 }}>
                {ratingError}
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleDistrictRatingSubmit}
                disabled={submittingRating}
                style={{ flex: 1, padding: "13px", borderRadius: 14, background: "linear-gradient(135deg, #059669 0%, #047857 100%)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: submittingRating ? "not-allowed" : "pointer", opacity: submittingRating ? 0.7 : 1, boxShadow: "0 4px 14px rgba(5,150,105,0.3)" }}
              >
                {submittingRating ? "Saving..." : authenticated ? "Submit Rating" : "Login to Rate"}
              </button>
              <button
                type="button"
                onClick={() => setShowRatingDialog(false)}
                style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#fff", border: "1.5px solid #e2e8f0", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
