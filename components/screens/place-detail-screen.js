"use client";

import { useRef, useState } from "react";
import Link from "next/link";
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

export default function PlaceDetailScreen({ place }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState(place.reviews || []);
  const [error, setError] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const shareTimerRef = useRef(null);
  const router = useRouter();
  const favorite = isFavorite(place.id);

  function setTemporaryShareFeedback(message) {
    if (shareTimerRef.current) {
      clearTimeout(shareTimerRef.current);
    }

    setShareFeedback(message);
    shareTimerRef.current = setTimeout(() => {
      setShareFeedback("");
    }, 2000);
  }

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: place.name,
      text: `Check out ${place.name} on visitNepal77`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setTemporaryShareFeedback("Shared");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setTemporaryShareFeedback("Link copied");
    } catch (shareError) {
      if (shareError?.name === "AbortError") return;
      setTemporaryShareFeedback("Unable to share");
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
                <div className="inline-flex items-center rounded-full bg-slate-100 px-3.5 py-2 font-medium text-slate-600">
                  {reviews.length} reviews
                </div>
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
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[18px] bg-white">
                        <img
                          src={spot.image || place.image}
                          alt={spot.name}
                          className="h-full w-full object-cover"
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

          <div className="space-y-4">
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
                onClick={() => setShowForm((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary"
              >
                <PlusCircleIcon className="size-4" />
                Add Review
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
      </div>
    </AppShell>
  );
}
