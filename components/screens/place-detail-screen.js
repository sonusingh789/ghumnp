"use client";

import { useState } from "react";
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
  StarIcon,
} from "@/components/ui/icons";

export default function PlaceDetailScreen({ place }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState(place.reviews || []);
  const router = useRouter();
  const favorite = isFavorite(place.id);

  function handleReviewSubmit(review) {
    setReviews((current) => [review, ...current]);
    setShowForm(false);
  }

  return (
    <AppShell className="bg-[#f6f8f4]" contentClassName="px-0 pt-0">
      <div className="relative">
        <ImageCarousel images={place.images?.length ? place.images : [place.image]} alt={place.name} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-11 items-center justify-center rounded-full bg-white/[0.92] text-slate-900 shadow-lg"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="size-5" />
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

      <section className="-mt-8 rounded-t-[34px] bg-[#f6f8f4] px-5 pb-8 pt-6">
        <div className="rounded-[30px] bg-white p-5 shadow-[0_22px_48px_rgba(17,24,39,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600">
                {place.category}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {place.name}
              </h1>
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-slate-500">
                <MapPinIcon className="size-4" />
                {place.location}
              </p>
            </div>
            <div className="rounded-[22px] bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-600">
              <span className="inline-flex items-center gap-1">
                <StarIcon className="size-4" />
                {place.rating.toFixed(1)}
              </span>
              <p className="mt-1 text-xs text-amber-500">{reviews.length} reviews</p>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-slate-950">Description</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{place.description}</p>
          </section>

          <section className="mt-7">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">Location</h2>
              <Link href="/explore" className="text-sm font-semibold text-primary">
                Open in explore
              </Link>
            </div>
            <div className="texture mt-3 flex h-48 items-center justify-center rounded-[28px] border border-black/5">
              <div className="text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white text-primary shadow-lg">
                  <MapPinIcon className="size-7" />
                </div>
                <p className="mt-3 text-base font-semibold text-slate-900">{place.location}</p>
                <p className="mt-1 text-sm text-slate-500">Map preview placeholder for backend integration</p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Traveler Reviews</h2>
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary"
            >
              <PlusCircleIcon className="size-4" />
              Add Review
            </button>
          </div>
          {showForm ? <ReviewForm onSubmit={handleReviewSubmit} onCancel={() => setShowForm(false)} /> : null}
          <div className="space-y-3">
            {reviews.length ? (
              reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div className="rounded-[28px] bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-[0_14px_34px_rgba(17,24,39,0.06)]">
                No reviews yet. This UI is ready for live feedback once your backend is connected.
              </div>
            )}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
