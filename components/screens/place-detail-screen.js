"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import ReviewCard from "@/components/cards/review-card";
import ReviewForm from "@/components/forms/review-form";
import ImageCarousel from "@/components/sections/image-carousel";
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
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textArea);
  return copied;
}

async function tryNativeShare(payloads) {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }

  for (const payload of payloads) {
    try {
      if (typeof navigator.canShare === "function" && !navigator.canShare(payload)) {
        continue;
      }

      await navigator.share(payload);
      return true;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw error;
      }
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

  async function handleSuggestEdit() {
    const changes = Object.fromEntries(
      Object.entries(editFields).filter(([k, v]) => v !== place[k === "location" ? "location" : k])
    );
    if (!Object.keys(changes).length) return;
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
    if (shareTimerRef.current) {
      clearTimeout(shareTimerRef.current);
    }

    setShareFeedback(message);
    shareTimerRef.current = setTimeout(() => {
      setShareFeedback("");
    }, 2000);
  }

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) {
        clearTimeout(shareTimerRef.current);
      }
    };
  }, []);

  function scrollToReviews({ openForm = false } = {}) {
    if (openForm) {
      setShowForm(true);
    }

    window.requestAnimationFrame(() => {
      reviewsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const sharePayloads = [
      {
        title: place.name,
        text: `Check out ${place.name} on visitNepal77`,
        url: shareUrl,
      },
      {
        title: place.name,
        url: shareUrl,
      },
      {
        text: `Check out ${place.name} on visitNepal77`,
        url: shareUrl,
      },
      {
        url: shareUrl,
      },
    ];

    try {
      const openedNativeShare = await tryNativeShare(sharePayloads);
      if (openedNativeShare) {
        setTemporaryShareFeedback("Shared");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setTemporaryShareFeedback("Link copied");
        return;
      }

      const copied = await copyTextFallback(shareUrl);
      setTemporaryShareFeedback(copied ? "Link copied" : "Open browser share");
    } catch (shareError) {
      if (shareError?.name === "AbortError") return;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          setTemporaryShareFeedback("Link copied");
          return;
        }
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

      if (!response.ok) {
        setError(data.error || "Unable to submit review.");
        return false;
      }

      setReviews((current) => [data.review, ...current]);
      setShowForm(false);
      return true;
    } catch {
      setError("Unable to submit review.");
      return false;
    }
  }

  return (
    <AppShell className="bg-[#f5f6f8]" contentClassName="pt-0 sm:pt-5">
      <div className="mx-auto w-full max-w-5xl">
        <section className="relative overflow-hidden rounded-[0px] border border-black/5 bg-white shadow-[0_20px_54px_rgba(15,23,42,0.08)]">
          <div className="relative">
            <ImageCarousel images={place.images?.length ? place.images : [place.image]} alt={place.name} />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex size-11 items-center justify-center rounded-full bg-white/[0.92] text-slate-900 shadow-lg"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="size-5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex size-11 items-center justify-center rounded-full bg-white/[0.92] text-slate-900 shadow-lg"
                  aria-label="Share place"
                >
                  <ShareIcon className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(place.id)}
                  className={`flex size-11 items-center justify-center rounded-full shadow-lg ${
                    favorite ? "bg-rose-50 text-rose-500" : "bg-white/[0.92] text-slate-900"
                  }`}
                  aria-label={favorite ? "Remove favorite" : "Save place"}
                >
                  <HeartIcon className="size-5" filled={favorite} />
                </button>
              </div>
            </div>
            {shareFeedback ? (
              <div className="absolute right-4 top-[4.8rem] rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-lg sm:right-5">
                {shareFeedback}
              </div>
            ) : null}
          </div>

          <div className="relative -mt-8 rounded-t-[28px] bg-white px-4 pb-5 pt-5 sm:-mt-10 sm:px-6 sm:pb-6 sm:pt-6 lg:px-7">
            {/* Visible breadcrumb — crawlable anchor text for SEO */}
            <nav aria-label="Breadcrumb" className="mb-3">
              <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-400">
                <li><Link href="/" className="hover:text-emerald-600 transition">Home</Link></li>
                <li aria-hidden="true" className="select-none">/</li>
                <li><Link href="/districts" className="hover:text-emerald-600 transition">All 77 Districts</Link></li>
                <li aria-hidden="true" className="select-none">/</li>
                <li><Link href={`/districts/${place.districtId}`} className="hover:text-emerald-600 transition">{place.districtId}</Link></li>
                <li aria-hidden="true" className="select-none">/</li>
                <li className="font-medium text-slate-600" aria-current="page">{place.name}</li>
              </ol>
            </nav>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  {place.category}
                </p>
                <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-slate-950 sm:text-[2.3rem]">
                  {place.name}
                </h1>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                  <MapPinIcon className="size-4" />
                  {place.location}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">
                  {place.description}
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-2 font-semibold text-amber-600">
                  <StarIcon className="size-4" />
                  {place.rating.toFixed(1)}
                </div>
                <button
                  type="button"
                  onClick={() => scrollToReviews()}
                  className="inline-flex items-center rounded-full bg-slate-100 px-3.5 py-2 font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  {reviews.length} reviews
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contributor + Help improve card */}
        {place.contributor ? (
          <div className="mt-3 rounded-[28px] border border-black/5 bg-white px-5 py-5 shadow-[0_14px_34px_rgba(17,24,39,0.06)] sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Contributed by</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-slate-100">
                  {place.contributor.avatar ? (
                    <Image src={place.contributor.avatar} alt={place.contributor.name} fill sizes="44px" className="object-cover" />
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{place.contributor.name}</p>
                  <Link
                    href={`/contributors/${place.contributor.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${place.contributor.id}`}
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
              {place.is_verified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-2 text-[13px] font-semibold text-white">
                  <BadgeIcon className="size-4" />
                  Verified
                </span>
              ) : null}
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-800">Help Improve This Place</p>
              <div className="mt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => { setReportDone(false); setReportModal(true); }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                >
                  <FlagIcon className="size-4" />
                  Report Issue
                </button>
                <button
                  type="button"
                  onClick={() => { setEditDone(false); setEditModal(true); }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <PencilIcon className="size-4" />
                  Suggest Edit
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <section className="px-1 pb-8 pt-5 sm:px-2 sm:pt-6">
          <div ref={reviewsSectionRef} className="space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Community
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  Traveler Reviews
                </h2>
              </div>
              <button
                type="button"
                onClick={() => scrollToReviews({ openForm: !showForm })}
                className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary"
              >
                <PlusCircleIcon className="size-4" />
                {showForm ? "Hide Review" : "Add Review"}
              </button>
            </div>
            {error ? (
              <div className="rounded-[20px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {showForm ? <ReviewForm onSubmit={handleReviewSubmit} onCancel={() => setShowForm(false)} /> : null}
            <div className="space-y-3">
              {reviews.length ? (
                reviews.map((review) => <ReviewCard key={review.id} review={review} />)
              ) : (
                <div className="rounded-[28px] bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-[0_14px_34px_rgba(17,24,39,0.06)]">
                  No reviews yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-1 pb-10 sm:px-2" aria-label="Travel guide">
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Travel Guide
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {place.name} — Complete Travel Guide
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Why visit, best season, tips, access info, nearby attractions, and FAQs.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {seo.longDescription ? (
                <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Destination Guide
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    Why Visit {place.name}
                  </h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-[15px]">
                    {seo.longDescription.split(/\n{2,}/).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : null}

              {seo.highlights?.length ? (
                <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Highlights
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    What Makes {place.name} Special
                  </h2>
                  <div className="mt-4 grid gap-3">
                    {seo.highlights.map((item) => (
                      <div
                        key={item}
                        className="rounded-[22px] border border-black/5 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {(seo.practicalTips || seo.bestSeason || seo.entryAccessInfo) ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {seo.practicalTips ? (
                    <InfoSectionCard
                      eyebrow="Travel Tips"
                      title="Practical Tips"
                      content={seo.practicalTips}
                    />
                  ) : null}
                  {seo.bestSeason ? (
                    <InfoSectionCard
                      eyebrow="Season"
                      title="Best Season To Visit"
                      content={seo.bestSeason}
                    />
                  ) : null}
                  {seo.entryAccessInfo ? (
                    <div className="md:col-span-2">
                      <InfoSectionCard
                        eyebrow="Access"
                        title="Entry And Access Info"
                        content={seo.entryAccessInfo}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {seo.nearbyAttractions?.length ? (
                <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Around Here
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    Nearby Attractions to {place.name}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {seo.nearbyAttractions.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Location */}
              <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                      Explore
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                      Location
                    </h2>
                  </div>
                  <Link href="/explore" className="text-sm font-semibold text-primary">
                    Open in explore
                  </Link>
                </div>
                <div className="texture mt-4 flex h-44 items-center justify-center rounded-[28px] border border-black/5">
                  <div className="text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white text-primary shadow-lg">
                      <MapPinIcon className="size-7" />
                    </div>
                    <p className="mt-3 text-base font-semibold text-slate-900">{place.location}</p>
                  </div>
                </div>
              </div>

              {/* Nearby Spots */}
              <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Nearby
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  Nearby Spots
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Helpful stays, food, and local stops around this destination.
                </p>
                <div className="mt-4 space-y-3">
                  {place.nearbySpots?.length ? (
                    place.nearbySpots.map((spot) => (
                      <div key={spot.id} className="flex gap-4 rounded-[24px] border border-black/5 bg-slate-50 p-3">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px] bg-white">
                          <Image
                            src={spot.image || place.image}
                            alt={spot.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">{spot.category}</p>
                          <h3 className="mt-1 text-lg font-semibold text-slate-950">{spot.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{spot.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] bg-slate-50 px-4 py-5 text-sm text-slate-500">
                      No nearby spots added yet for this destination.
                    </div>
                  )}
                </div>
              </div>

              {seo.faqs?.length ? (
                <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    FAQ
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {place.name} — Frequently Asked Questions
                  </h2>
                  <div className="mt-4 space-y-3">
                    {seo.faqs.map((item, index) => {
                      const [question, ...rest] = item.split("::");
                      const answer = rest.join("::").trim();
                      return (
                        <div key={`${question}-${index}`} className="rounded-[22px] border border-black/5 bg-slate-50 px-4 py-4">
                          <p className="text-sm font-semibold text-slate-900">{question}</p>
                          {answer ? (
                            <p className="mt-1.5 text-sm leading-6 text-slate-600">{answer}</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
      </div>

      {/* Report modal */}
      {reportModal ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 400, boxShadow: "0 24px 64px rgba(15,23,42,0.22)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#dc2626", marginBottom: 4 }}>Report Issue</p>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink, #0f172a)" }}>{place.name}</h2>
              </div>
              <button type="button" onClick={() => setReportModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <XIcon className="size-4" />
              </button>
            </div>
            {reportDone ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <CheckCircleIcon className="size-10 mx-auto text-emerald-500 mb-3" />
                <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Report submitted</p>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Thanks for helping keep the map accurate.</p>
                <button type="button" onClick={() => setReportModal(false)} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 999, border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
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
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", resize: "none", outline: "none", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={handleReport}
                    disabled={reportLoading || reportReason.trim().length < 5}
                    style={{ flex: 1, padding: "11px", borderRadius: 999, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: (reportLoading || reportReason.trim().length < 5) ? 0.5 : 1 }}
                  >
                    {reportLoading ? "Submitting..." : "Submit Report"}
                  </button>
                  <button type="button" onClick={() => setReportModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#fff", color: "#0f172a", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* Suggest Edit modal */}
      {editModal ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(15,23,42,0.22)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#059669", marginBottom: 4 }}>Suggest Edit</p>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{place.name}</h2>
              </div>
              <button type="button" onClick={() => setEditModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <XIcon className="size-4" />
              </button>
            </div>
            {editDone ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <CheckCircleIcon className="size-10 mx-auto text-emerald-500 mb-3" />
                <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Suggestion sent!</p>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Our team will review your suggestion. Thank you!</p>
                <button type="button" onClick={() => setEditModal(false)} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 999, border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Edit the fields you want to suggest changes for. Unchanged fields will be ignored.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Name</label>
                    <input
                      type="text"
                      value={editFields.name}
                      onChange={(e) => setEditFields((f) => ({ ...f, name: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Location</label>
                    <input
                      type="text"
                      value={editFields.location}
                      onChange={(e) => setEditFields((f) => ({ ...f, location: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Description</label>
                    <textarea
                      value={editFields.description}
                      onChange={(e) => setEditFields((f) => ({ ...f, description: e.target.value }))}
                      rows={4}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", resize: "none", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={handleSuggestEdit}
                    disabled={editLoading}
                    style={{ flex: 1, padding: "11px", borderRadius: 999, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: editLoading ? 0.6 : 1 }}
                  >
                    {editLoading ? "Sending..." : "Send Suggestion"}
                  </button>
                  <button type="button" onClick={() => setEditModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#fff", color: "#0f172a", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
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

function InfoSectionCard({ eyebrow, title, content }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{content}</p>
    </div>
  );
}
