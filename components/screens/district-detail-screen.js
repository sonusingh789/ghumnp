"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import PlaceCard from "@/components/cards/place-card";
import { useFavorites } from "@/context/favorites-context";
import { buildLoginHref } from "@/utils/navigation";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MapPinIcon,
  ShareIcon,
  StarIcon,
  XIcon,
} from "@/components/ui/icons";
import { cn, formatVisitors } from "@/lib/utils";

const tabs = ["All", "Attractions", "Food", "Stays"];

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

export default function DistrictDetailScreen({ district, districtPlaces }) {
  const [activeTab, setActiveTab] = useState("All");
  const [showKnowMore, setShowKnowMore] = useState(false);
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
  const seo = district.seoContent || {};
  const districtFavoriteId = `district:${district.id}`;
  const isSaved = isFavorite(districtFavoriteId);
  const topPlaceLinks = districtPlaces.slice(0, 6);
  const hasExtendedInfo =
    Boolean(seo.intro) ||
    Boolean(seo.topThingsToDo?.length) ||
    Boolean(seo.bestTimeToVisit) ||
    Boolean(seo.howToReach) ||
    Boolean(seo.localFoodsCulture) ||
    Boolean(seo.faqs?.length) ||
    Boolean(topPlaceLinks.length);

  const filteredPlaces = districtPlaces.filter((place) => {
    if (activeTab === "All") return true;
    if (activeTab === "Attractions") return place.category === "attraction";
    if (activeTab === "Food") return place.category === "food" || place.category === "restaurant";
    if (activeTab === "Stays") return place.category === "hotel" || place.category === "stay";
    return true;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const visitKey = `district-visit:${district.id}`;
    const storedCount = Number(window.sessionStorage.getItem(visitKey) || "");
    if (Number.isFinite(storedCount) && storedCount > 0) {
      const frameId = window.requestAnimationFrame(() => {
        setVisitorsCount((current) => Math.max(current, storedCount));
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    if (storedCount > 0) {
      return;
    }

    let cancelled = false;

    async function trackVisit() {
      try {
        const response = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "district",
            slug: district.id,
          }),
        });
        const data = await response.json().catch(() => ({}));

        if (!cancelled && response.ok && typeof data.visitorsCount === "number") {
          window.sessionStorage.setItem(visitKey, String(data.visitorsCount));
          setVisitorsCount(data.visitorsCount);
        }
      } catch {
        // Ignore visitor tracking errors so the page UX stays unaffected.
      }
    }

    trackVisit();

    return () => {
      cancelled = true;
    };
  }, [district.id]);

  function setTemporaryShareFeedback(message) {
    if (shareTimerRef.current) {
      clearTimeout(shareTimerRef.current);
    }

    setShareFeedback(message);
    shareTimerRef.current = setTimeout(() => {
      setShareFeedback("");
    }, 2000);
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
        if (response.status === 401) {
          router.push(buildLoginHref(`/districts/${district.id}`));
          return;
        }

        setRatingError(data.error || "Unable to submit district rating.");
        return;
      }

      if (typeof data.rating === "number") {
        setRatingDisplay(data.rating);
      }
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
      {
        title: district.name,
        text: `Check out ${district.name} district on visitNepal77`,
        url: shareUrl,
      },
      {
        title: district.name,
        url: shareUrl,
      },
      {
        text: `Check out ${district.name} district on visitNepal77`,
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

  return (
    <AppShell className="bg-[#f5f6f8]" contentClassName="pt-0">
      <div className="mx-auto w-full max-w-5xl">
        <section className="relative overflow-hidden  border border-black/5 bg-white shadow-[0_20px_54px_rgba(15,23,42,0.08)]">
          <div className="relative h-[300px] sm:h-[360px] lg:h-[430px]">
            <Image
              src={district.image}
              alt={district.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1100px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex size-11 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="size-5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex size-11 items-center justify-center rounded-full bg-white/92 text-slate-800 shadow-lg"
                  aria-label="Share district"
                >
                  <ShareIcon className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(districtFavoriteId)}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full shadow-lg transition",
                    isSaved ? "bg-rose-50 text-rose-500" : "bg-white/92 text-slate-800"
                  )}
                  aria-label={isSaved ? "Remove saved district" : "Save district"}
                >
                  <HeartIcon filled={isSaved} className="size-5" />
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-[2rem] font-semibold tracking-tight text-slate-950 sm:text-[2.3rem]">
                  {district.name}
                </h1>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                  <MapPinIcon className="size-4" />
                  {district.province} Province
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">
                  {district.tagline}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-2 font-semibold text-amber-600">
                  <button
                    type="button"
                    onClick={openRatingDialog}
                    className="inline-flex items-center gap-1.5"
                    aria-label="Rate this district"
                  >
                    <StarIcon className="size-4" />
                    {ratingDisplay.toFixed(1)}
                  </button>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 font-medium text-slate-600">
                  <MapPinIcon className="size-4" />
                  {formatVisitors(visitorsCount)}
                </div>
                <div className="inline-flex items-center rounded-full bg-emerald-50 px-3.5 py-2 font-semibold text-emerald-700">
                  {districtPlaces.length} places
                </div>
              </div>
            </div>

            {hasExtendedInfo ? (
              <div className="mt-5 border-t border-slate-100 pt-5 sm:mt-6 sm:pt-6">
                <button
                  type="button"
                  onClick={() => setShowKnowMore((current) => !current)}
                  className="flex w-full items-center justify-between gap-4 px-0 py-0 text-left"
                  aria-expanded={showKnowMore}
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                      Know More
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                      Travel Guide For {district.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Best time, how to reach, local culture, FAQs, and more.
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition",
                      showKnowMore ? "rotate-90" : ""
                    )}
                  >
                    <ChevronRightIcon className="size-5" />
                  </span>
                </button>

                {showKnowMore ? (
                  <div className="mt-5 space-y-4">
                    {seo.intro ? (
                      <div className="rounded-[28px] border border-black/5 bg-slate-50 p-5 sm:p-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                          District Guide
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                          Discover {district.name}
                        </h2>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-[15px]">
                          {seo.intro.split(/\n{2,}/).map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-4 lg:grid-cols-3">
                      {seo.bestTimeToVisit ? (
                        <InfoSectionCard
                          eyebrow="Plan"
                          title="Best Time To Visit"
                          content={seo.bestTimeToVisit}
                        />
                      ) : null}
                      {seo.howToReach ? (
                        <InfoSectionCard
                          eyebrow="Travel"
                          title="How To Reach"
                          content={seo.howToReach}
                        />
                      ) : null}
                      {seo.localFoodsCulture ? (
                        <InfoSectionCard
                          eyebrow="Culture"
                          title="Local Foods And Culture"
                          content={seo.localFoodsCulture}
                        />
                      ) : null}
                    </div>

                    {seo.topThingsToDo?.length ? (
                      <div className="rounded-[28px] border border-black/5 bg-slate-50 p-5 sm:p-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                          Highlights
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                          Top Things To Do
                        </h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {seo.topThingsToDo.map((item) => (
                            <div
                              key={item}
                              className="rounded-[22px] border border-black/5 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-700"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {topPlaceLinks.length ? (
                      <div className="rounded-[28px] border border-black/5 bg-slate-50 p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                              Explore More
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                              Top Places In {district.name}
                            </h2>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          {topPlaceLinks.map((place) => (
                            <Link
                              key={place.id}
                              href={`/place/${place.id}`}
                              className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              {place.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {seo.faqs?.length ? (
                      <div className="rounded-[28px] border border-black/5 bg-slate-50 p-5 sm:p-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                          FAQ
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                          Before You Go
                        </h2>
                        <div className="mt-4 space-y-3">
                          {seo.faqs.map((item, index) => {
                            const [question, ...rest] = item.split("::");
                            const answer = rest.join("::").trim();
                            return (
                              <div key={`${question}-${index}`} className="rounded-[22px] border border-black/5 bg-white px-4 py-4">
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
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="px-1 pb-8 pt-5 sm:px-2 sm:pt-6">
        <div className="scrollbar-hide mobile-h-scroll flex gap-2 rounded-full bg-slate-100 p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "min-w-[92px] rounded-full px-4 py-2.5 text-sm font-semibold transition",
                activeTab === tab
                  ? "bg-white text-slate-950 shadow-[0_8px_20px_rgba(15,23,42,0.16)]"
                  : "bg-transparent text-slate-500"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Explore
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Must Visit
              </h2>
            </div>
          </div>

        <div className="space-y-4">
          {filteredPlaces.length ? (
            filteredPlaces.map((place) => <PlaceCard key={place.id} place={place} />)
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
              <p className="text-lg font-semibold text-slate-900">No places in this section yet</p>
              <p className="mt-2 text-sm text-slate-500"> You can contribute by adding new places!</p>
              <Link
                href="/add"
                className="mt-5 inline-flex rounded-full bg-primary px-4 py-2.5 font-semibold text-white"
              >
                Add a contribution
              </Link>
            </div>
          )}
        </div>
        </div>
        </section>
      </div>

      {showRatingDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,0.22)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Rate District
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  {district.name}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Tap a star to rate this district.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRatingDialog(false)}
                className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                aria-label="Close rating dialog"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRatingValue(value)}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full transition",
                    value <= ratingValue ? "bg-amber-50 text-amber-500" : "bg-slate-100 text-slate-400"
                  )}
                  aria-label={`Rate ${value} stars`}
                >
                  <StarIcon className="size-5" filled={value <= ratingValue} />
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-sm font-medium text-slate-600">
              Selected rating: {ratingValue} / 5
            </p>

            {ratingError ? (
              <div className="mt-4 rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {ratingError}
              </div>
            ) : null}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleDistrictRatingSubmit}
                disabled={submittingRating}
                className="flex-1 rounded-full bg-[#08af3b] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(8,175,59,0.22)] disabled:opacity-70"
              >
                {submittingRating ? "Saving..." : authenticated ? "Submit Rating" : "Login To Rate"}
              </button>
              <button
                type="button"
                onClick={() => setShowRatingDialog(false)}
                className="flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
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
