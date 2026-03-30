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
  HeartIcon,
  MapPinIcon,
  PlusCircleIcon,
  ShareIcon,
  StarIcon,
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
  const shareTimerRef = useRef(null);
  const reviewsSectionRef = useRef(null);
  const router = useRouter();
  const favorite = isFavorite(place.id);
  const seo = place.seoContent || {};
  const hasExtendedInfo =
    Boolean(seo.longDescription) ||
    Boolean(seo.highlights?.length) ||
    Boolean(seo.practicalTips) ||
    Boolean(seo.bestSeason) ||
    Boolean(seo.entryAccessInfo) ||
    Boolean(seo.nearbyAttractions?.length) ||
    Boolean(seo.faqs?.length);

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

        <section className="grid gap-6 px-1 pb-8 pt-5 sm:px-2 sm:pt-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
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
              <div className="texture mt-4 flex h-56 items-center justify-center rounded-[28px] border border-black/5">
                <div className="text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white text-primary shadow-lg">
                    <MapPinIcon className="size-7" />
                  </div>
                  <p className="mt-3 text-base font-semibold text-slate-900">{place.location}</p>
                  {/* <p className="mt-1 text-sm text-slate-500">Map preview placeholder for backend integration</p> */}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Nearby
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  Nearby Spots
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Helpful stays, food, and local stops around this destination.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {place.nearbySpots?.length ? (
                  place.nearbySpots.map((spot) => (
                    <div
                      key={spot.id}
                      className="flex gap-4 rounded-[24px] border border-black/5 bg-slate-50 p-3"
                    >
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
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                          {spot.category}
                        </p>
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

          </div>

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

        {hasExtendedInfo ? (
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
        ) : null}
      </div>
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
