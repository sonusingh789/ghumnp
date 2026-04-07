"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import ReviewCard from "@/components/cards/review-card";
import ReviewForm from "@/components/forms/review-form";
import { useFavorites } from "@/context/favorites-context";
import {
  ArrowLeftIcon,
  BadgeIcon,
  CheckCircleIcon,
  FlagIcon,
  HeartIcon,
  MapPinIcon,
  PencilIcon,
  PlusCircleIcon,
  ShareIcon,
  StarIcon,
  XIcon,
} from "@/components/ui/icons";

const CATEGORY_LABELS = {
  attraction: "Tourist Attraction",
  food: "Local Food",
  restaurant: "Restaurant",
  hotel: "Hotel",
  stay: "Local Stay",
};

async function copyTextFallback(text) {
  if (typeof document === "undefined") return false;
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  textArea.style.pointerEvents = "none";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, text.length);
  let copied = false;
  try { copied = document.execCommand("copy"); } catch { copied = false; }
  document.body.removeChild(textArea);
  return copied;
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

export default function PlaceDetailScreen({ place }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState(place.reviews || []);
  const [error, setError] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editFields, setEditFields] = useState({ name: place.name, description: place.description, location: place.location });
  const [editLoading, setEditLoading] = useState(false);
  const [editDone, setEditDone] = useState(false);
  const [suggestImages, setSuggestImages] = useState([]); // [{ previewUrl, file, uploading, url, error }]
  const suggestFileRef = useRef(null);
  const shareTimerRef = useRef(null);
  const reviewsSectionRef = useRef(null);
  const router = useRouter();
  const favorite = isFavorite(place.id);
  const seo = place.seoContent || {};

  async function handleReport() {
    if (!reportReason.trim() || reportReason.trim().length < 5) return;
    setReportLoading(true);
    try {
      await fetch(`/api/places/${place.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      setReportDone(true);
    } finally {
      setReportLoading(false);
    }
  }

  async function handleSuggestImageAdd(files) {
    const newItems = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      previewUrl: URL.createObjectURL(file),
      file,
      uploading: false,
      url: null,
      error: null,
    }));
    setSuggestImages((prev) => [...prev, ...newItems]);
  }

  async function handleSuggestEdit() {
    const changes = Object.fromEntries(
      Object.entries(editFields).filter(([k, v]) => v !== place[k === "location" ? "location" : k])
    );

    // Upload any pending images
    let uploadedUrls = [];
    if (suggestImages.length > 0) {
      setEditLoading(true);
      const results = await Promise.all(
        suggestImages.map(async (item) => {
          if (item.url) return item.url; // already uploaded
          try {
            const dataUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.onerror = () => reject(new Error("Read failed"));
              reader.readAsDataURL(item.file);
            });
            const res = await fetch("/api/uploads/imagekit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                file: dataUrl,
                fileName: item.file.name || `suggest-${Date.now()}`,
                mimeType: item.file.type || "image/jpeg",
                folderType: "places",
              }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Upload failed");
            return data.url;
          } catch {
            return null;
          }
        })
      );
      uploadedUrls = results.filter(Boolean);
      if (uploadedUrls.length) changes.suggested_images = uploadedUrls;
    }

    if (!Object.keys(changes).length) { setEditLoading(false); return; }
    setEditLoading(true);
    try {
      await fetch(`/api/places/${place.id}/suggest-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggested_changes: changes }),
      });
      setEditDone(true);
    } finally {
      setEditLoading(false);
    }
  }

  function setTemporaryShareFeedback(message) {
    if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    setShareFeedback(message);
    shareTimerRef.current = setTimeout(() => setShareFeedback(""), 2000);
  }

  useEffect(() => {
    return () => { if (shareTimerRef.current) clearTimeout(shareTimerRef.current); };
  }, []);

  function scrollToReviews({ openForm = false } = {}) {
    if (openForm) setShowForm(true);
    window.requestAnimationFrame(() => {
      reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const sharePayloads = [
      { title: place.name, text: `Check out ${place.name} on visitNepal77`, url: shareUrl },
      { title: place.name, url: shareUrl },
      { text: `Check out ${place.name} on visitNepal77`, url: shareUrl },
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

  async function handleReviewSubmit(review) {
    setError("");
    try {
      const response = await fetch(`/api/places/${place.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error || "Unable to submit review."); return false; }
      setReviews((current) => [data.review, ...current]);
      setShowForm(false);
      return true;
    } catch {
      setError("Unable to submit review.");
      return false;
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    fontSize: 13,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    background: "#f8fafc",
  };

  return (
    <AppShell>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{ position: "relative", height: 420, margin: "-24px -1px 0", overflow: "hidden" }}>
        {/* Swipeable image carousel */}
        <HeroCarousel images={place.images?.length ? place.images : [place.image]} alt={place.name} />

        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />

        {/* Top action bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
          paddingTop: "max(env(safe-area-inset-top), 44px)",
        }}>
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
              aria-label="Share place"
            >
              <ShareIcon style={{ width: 17, height: 17, color: "#0f172a" }} />
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(place.id)}
              style={{ width: 38, height: 38, borderRadius: "50%", background: favorite ? "rgba(255,228,230,0.95)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.18)", color: favorite ? "#f43f5e" : "#0f172a" }}
              aria-label={favorite ? "Remove favorite" : "Save place"}
            >
              <HeartIcon filled={favorite} style={{ width: 17, height: 17 }} />
            </button>
          </div>
        </div>

        {/* Share feedback toast */}
        {shareFeedback ? (
          <div style={{ position: "absolute", top: 62, right: 16, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#0f172a", boxShadow: "0 2px 10px rgba(0,0,0,0.14)" }}>
            {shareFeedback}
          </div>
        ) : null}

        {/* Name + category over image */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 28px", pointerEvents: "none" }}>
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#86efac", marginBottom: 6 }}>
            {CATEGORY_LABELS[place.category] || place.category}
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 6 }}>
            {place.name}
          </h1>
          <p style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500, lineHeight: 1.5 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <MapPinIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
              {place.location}
            </span>
            {place.districtId ? <span style={{ color: "rgba(255,255,255,0.5)" }}>· {place.districtId.charAt(0).toUpperCase() + place.districtId.slice(1)}</span> : null}
          </p>
        </div>
      </div>

      {/* ── PULL-UP WHITE CONTENT ───────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", marginTop: -20, position: "relative", zIndex: 1, padding: "20px 20px 0" }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 14 }}>
          <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 6px", fontSize: 11, color: "#94a3b8", listStyle: "none", padding: 0, margin: 0 }}>
            <li><Link href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/districts" style={{ color: "#94a3b8", textDecoration: "none" }}>Districts</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/districts/${place.districtId}`} style={{ color: "#94a3b8", textDecoration: "none" }}>{place.districtId.charAt(0).toUpperCase() + place.districtId.slice(1)}</Link></li>
            <li aria-hidden="true">/</li>
            <li style={{ fontWeight: 600, color: "#475569" }} aria-current="page">{place.name}</li>
          </ol>
        </nav>

        {/* Stats chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700, color: "#b45309" }}>
            <StarIcon style={{ width: 14, height: 14, color: "#f59e0b" }} />
            {place.rating.toFixed(1)}
          </span>
          <button
            type="button"
            onClick={() => scrollToReviews()}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700, color: "#475569", cursor: "pointer" }}
          >
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </button>
          {place.isVerified ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
              <BadgeIcon style={{ width: 14, height: 14 }} />
              Verified
            </span>
          ) : null}
          <Link
            href={`/districts/${place.districtId}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#ecfdf5", border: "1px solid #d1fae5", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700, color: "#059669", textDecoration: "none" }}
          >
            {place.districtId} →
          </Link>
        </div>

        {/* Description */}
        {place.description ? (
          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, marginBottom: 20 }}>
            {place.description}
          </p>
        ) : null}

      </div>

      {/* ── CONTRIBUTOR CARD ─────────────────────────────────── */}
      {place.contributor ? (
        <div style={{ margin: "0 0 0", padding: "0 20px 0" }}>
          <div style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 20, padding: "16px", boxShadow: "0 4px 16px rgba(15,23,42,0.05)", marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#94a3b8", marginBottom: 12 }}>
              Contributed by
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative", width: 42, height: 42, borderRadius: "50%", overflow: "hidden", background: "#f1f5f9", flexShrink: 0 }}>
                  {place.contributor.avatar ? (
                    <Image src={place.contributor.avatar} alt={place.contributor.name} fill sizes="42px" className="object-cover" />
                  ) : null}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{place.contributor.name}</p>
                  <Link
                    href={`/contributors/${place.contributor.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${place.contributor.id}`}
                    style={{ fontSize: 12, fontWeight: 600, color: "#059669", textDecoration: "none" }}
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 14, paddingTop: 14, display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => { setReportDone(false); setReportModal(true); }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 999, border: "1.5px solid #fecaca", background: "#fff5f5", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                <FlagIcon style={{ width: 14, height: 14 }} />
                Report
              </button>
              <button
                type="button"
                onClick={() => { setEditDone(false); setEditModal(true); }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                <PencilIcon style={{ width: 14, height: 14 }} />
                Suggest Edit
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── TRAVEL GUIDE ─────────────────────────────────────── */}
      <div style={{ padding: "8px 20px 0" }}>

        {/* About */}
        {seo.longDescription ? (
          <InfoCard eyebrow="About" title={`Why Visit ${place.name}`}>
            {seo.longDescription.split(/\n{2,}/).map((p) => (
              <p key={p} style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 8 }}>{p}</p>
            ))}
          </InfoCard>
        ) : null}

        {/* Highlights */}
        {seo.highlights?.length ? (
          <InfoCard eyebrow="Highlights" title={`What Makes ${place.name} Special`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {seo.highlights.map((item, i) => (
                <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 8, background: "#ecfdf5", color: "#059669", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.55, fontWeight: 500 }}>{item}</p>
                </div>
              ))}
            </div>
          </InfoCard>
        ) : null}

        {/* Tips + Season 2-col */}
        {(seo.practicalTips || seo.bestSeason) ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {seo.practicalTips ? (
              <SmallInfoCard eyebrow="Tips" title="Practical Tips" content={seo.practicalTips} />
            ) : null}
            {seo.bestSeason ? (
              <SmallInfoCard eyebrow="Season" title="Best Time" content={seo.bestSeason} />
            ) : null}
          </div>
        ) : null}

        {/* Access */}
        {seo.entryAccessInfo ? (
          <InfoCard eyebrow="Access" title="Entry &amp; Access Info">
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>{seo.entryAccessInfo}</p>
          </InfoCard>
        ) : null}

        {/* Nearby attractions */}
        {seo.nearbyAttractions?.length ? (
          <InfoCard eyebrow="Around Here" title={`Nearby Attractions`}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {seo.nearbyAttractions.map((item) => (
                <span key={item} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#374151" }}>
                  {item}
                </span>
              ))}
            </div>
          </InfoCard>
        ) : null}

        {/* Nearby spots */}
        <InfoCard eyebrow="Nearby" title="Nearby Spots">
          {place.nearbySpots?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {place.nearbySpots.map((spot) => (
                <div key={spot.id} style={{ display: "flex", gap: 12, background: "#f8fafc", borderRadius: 16, padding: 12, border: "1px solid #f1f5f9" }}>
                  <div style={{ position: "relative", width: 72, height: 72, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                    <Image src={spot.image || place.image} alt={spot.name} fill sizes="72px" className="object-cover" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#059669", marginBottom: 3 }}>{spot.category}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.2, marginBottom: 4 }}>{spot.name}</p>
                    <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{spot.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#94a3b8" }}>No nearby spots added yet.</p>
          )}
        </InfoCard>

        {/* Location */}
        <InfoCard eyebrow="Explore" title="Location">
          <div style={{ height: 120, background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", borderRadius: 16, border: "1.5px dashed #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", boxShadow: "0 4px 16px rgba(5,150,105,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPinIcon style={{ width: 22, height: 22, color: "#059669" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{place.location}</p>
          </div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
            <Link href="/explore" style={{ fontSize: 12, fontWeight: 700, color: "#059669", textDecoration: "none" }}>
              Open in explore →
            </Link>
          </div>
        </InfoCard>

        {/* FAQs */}
        {seo.faqs?.length ? (
          <InfoCard eyebrow="FAQ" title={`${place.name} — FAQs`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {seo.faqs.map((item, index) => {
                const [question, ...rest] = item.split("::");
                const answer = rest.join("::").trim();
                return (
                  <div key={`${question}-${index}`} style={{ background: "#f8fafc", borderRadius: 14, border: "1px solid #f1f5f9", padding: "12px 14px" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.4, marginBottom: answer ? 6 : 0 }}>{question}</p>
                    {answer ? <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{answer}</p> : null}
                  </div>
                );
              })}
            </div>
          </InfoCard>
        ) : null}
      </div>

      {/* ── REVIEWS ──────────────────────────────────────────── */}
      <div style={{ padding: "8px 20px 32px" }} ref={reviewsSectionRef}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#059669", marginBottom: 4 }}>Community</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>Traveler Reviews</h2>
          </div>
          <button
            type="button"
            onClick={() => scrollToReviews({ openForm: !showForm })}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 999, background: "#ecfdf5", border: "1.5px solid #d1fae5", color: "#059669", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            <PlusCircleIcon style={{ width: 15, height: 15 }} />
            {showForm ? "Hide" : "Add Review"}
          </button>
        </div>

        {error ? (
          <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 14, padding: "12px 16px", fontSize: 13, color: "#dc2626", marginBottom: 12 }}>
            {error}
          </div>
        ) : null}

        {showForm ? <ReviewForm onSubmit={handleReviewSubmit} onCancel={() => setShowForm(false)} /> : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reviews.length ? (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          ) : (
            <div style={{ background: "#fff", border: "1.5px dashed #e2e8f0", borderRadius: 20, padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>✍️</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No reviews yet</p>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Be the first to share your experience</p>
            </div>
          )}
        </div>
      </div>

      {/* ── REPORT MODAL ─────────────────────────────────────── */}
      {reportModal ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 0" }}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 -8px 40px rgba(15,23,42,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#dc2626", marginBottom: 4 }}>Report Issue</p>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{place.name}</h2>
              </div>
              <button type="button" onClick={() => setReportModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <XIcon style={{ width: 16, height: 16, color: "#64748b" }} />
              </button>
            </div>
            {reportDone ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <CheckCircleIcon style={{ width: 28, height: 28, color: "#059669" }} />
                </div>
                <p style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 4 }}>Report submitted</p>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Thanks for helping keep the map accurate.</p>
                <button type="button" onClick={() => setReportModal(false)} style={{ padding: "11px 28px", borderRadius: 999, border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>
                  What's the issue? <span style={{ color: "#94a3b8", fontWeight: 400 }}>(min 5 chars)</span>
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g. Wrong location, place is closed, inappropriate content..."
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={handleReport}
                    disabled={reportLoading || reportReason.trim().length < 5}
                    style={{ flex: 1, padding: "12px", borderRadius: 999, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: (reportLoading || reportReason.trim().length < 5) ? 0.5 : 1 }}
                  >
                    {reportLoading ? "Submitting..." : "Submit Report"}
                  </button>
                  <button type="button" onClick={() => setReportModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#fff", color: "#0f172a", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* ── SUGGEST EDIT MODAL ───────────────────────────────── */}
      {editModal ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 -8px 40px rgba(15,23,42,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#059669", marginBottom: 4 }}>Suggest Edit</p>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{place.name}</h2>
              </div>
              <button type="button" onClick={() => setEditModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <XIcon style={{ width: 16, height: 16, color: "#64748b" }} />
              </button>
            </div>
            {editDone ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <CheckCircleIcon style={{ width: 28, height: 28, color: "#059669" }} />
                </div>
                <p style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 4 }}>Suggestion sent!</p>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Our team will review your suggestion. Thank you!</p>
                <button type="button" onClick={() => setEditModal(false)} style={{ padding: "11px 28px", borderRadius: 999, border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Edit the fields you'd like to suggest changes for. Unchanged fields will be ignored.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 5 }}>Name</label>
                    <input type="text" value={editFields.name} onChange={(e) => setEditFields((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 5 }}>Location</label>
                    <input type="text" value={editFields.location} onChange={(e) => setEditFields((f) => ({ ...f, location: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 5 }}>Description</label>
                    <textarea value={editFields.description} onChange={(e) => setEditFields((f) => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inputStyle, resize: "none" }} />
                  </div>

                  {/* ── PHOTO SUGGESTIONS ── */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Suggest Photos <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span></label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {suggestImages.map((img, i) => (
                        <div key={img.id} style={{ position: "relative", width: 72, height: 72, borderRadius: 10, overflow: "hidden", background: "#e2e8f0", flexShrink: 0 }}>
                          <img src={img.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            type="button"
                            onClick={() => setSuggestImages((prev) => prev.filter((_, idx) => idx !== i))}
                            style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(239,68,68,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, lineHeight: 1 }}
                          >✕</button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => suggestFileRef.current?.click()}
                        style={{ width: 72, height: 72, borderRadius: 10, border: "1.5px dashed #cbd5e1", background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 600, flexShrink: 0 }}
                      >
                        <PlusCircleIcon style={{ width: 18, height: 18 }} />
                        Add
                      </button>
                      <input
                        ref={suggestFileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e) => {
                          if (e.target.files?.length) handleSuggestImageAdd(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={handleSuggestEdit}
                    disabled={editLoading}
                    style={{ flex: 1, padding: "12px", borderRadius: 999, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: editLoading ? 0.6 : 1 }}
                  >
                    {editLoading ? "Sending..." : "Send Suggestion"}
                  </button>
                  <button type="button" onClick={() => setEditModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#fff", color: "#0f172a", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function InfoCard({ eyebrow, title, children }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 20, padding: "16px 18px", boxShadow: "0 4px 16px rgba(15,23,42,0.05)", marginBottom: 12 }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#059669", marginBottom: 4 }}>
        {eyebrow}
      </p>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em", marginBottom: 12 }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function SmallInfoCard({ eyebrow, title, content }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 20, padding: "14px 16px", boxShadow: "0 4px 16px rgba(15,23,42,0.05)" }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#059669", marginBottom: 3 }}>{eyebrow}</p>
      <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{content}</p>
    </div>
  );
}

function HeroCarousel({ images, alt }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const dragging = useRef(false);

  function showNext() { setIndex((i) => (i + 1) % images.length); }
  function showPrev() { setIndex((i) => (i - 1 + images.length) % images.length); }

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    dragging.current = false;
  }
  function onTouchMove(e) {
    if (touchStartX.current === null) return;
    if (Math.abs(e.touches[0].clientX - touchStartX.current) > 5) dragging.current = true;
  }
  function onTouchEnd(e) {
    if (!touchStartX.current || images.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dragging.current && Math.abs(dx) > 40) dx < 0 ? showNext() : showPrev();
    touchStartX.current = null;
    dragging.current = false;
  }

  return (
    <div
      style={{ position: "absolute", inset: 0 }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div style={{ display: "flex", width: "100%", height: "100%", transform: `translateX(-${index * 100}%)`, transition: "transform 0.4s ease" }}>
        {images.map((src, i) => (
          <div key={`${src}-${i}`} style={{ position: "relative", minWidth: "100%", height: "100%" }}>
            <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" priority={i === 0} />
          </div>
        ))}
      </div>

      {/* Dot indicators — right-aligned, between category label and place name */}
      {images.length > 1 ? (
        <div style={{ position: "absolute", bottom: 94, right: 20, display: "flex", gap: 5, zIndex: 5 }}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              style={{
                height: 4, width: i === index ? 20 : 6,
                borderRadius: 999,
                background: i === index ? "#fff" : "rgba(255,255,255,0.45)",
                border: "none", padding: 0, cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
