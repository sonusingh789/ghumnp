"use client";

import Image from "next/image";
import AppShell from "@/components/layout/app-shell";
import { useFavorites } from "@/context/favorites-context";
import { contributionItems, places, userProfile } from "@/data/nepal";
import { CameraIcon, HeartIcon, MapPinIcon, SettingsIcon, StarIcon } from "@/components/ui/icons";

export default function ProfilePage() {
  const { favorites } = useFavorites();
  const savedPlaces = places.filter((place) => favorites.includes(place.id)).slice(0, 4);
  const recentReviews = places.flatMap((place) =>
    (place.reviews || []).map((review) => ({ ...review, placeName: place.name }))
  );

  return (
    <AppShell contentClassName="px-0 pt-0">
      <section className="bg-[linear-gradient(135deg,#16a34a,#0f7a39)] px-5 pb-24 pt-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
              Traveler Profile
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Profile</h1>
          </div>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full bg-white/[0.16] backdrop-blur"
            aria-label="Open settings"
          >
            <SettingsIcon className="size-5" />
          </button>
        </div>
      </section>

      <section className="-mt-16 px-5 pb-8">
        <div className="rounded-[34px] bg-white p-5 shadow-[0_24px_54px_rgba(17,24,39,0.12)]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="relative size-[5.5rem] overflow-hidden rounded-full">
                <Image
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  fill
                  sizes="88px"
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-lg"
                aria-label="Change avatar"
              >
                <CameraIcon className="size-5" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                {userProfile.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{userProfile.bio}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatCard label="Contributions" value={userProfile.stats.contributions} />
            <StatCard label="Saved" value={favorites.length} />
            <StatCard label="Reviews" value={userProfile.stats.reviews} />
          </div>
        </div>

        <div className="mt-6 rounded-[32px] bg-white p-5 shadow-[0_18px_42px_rgba(17,24,39,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">My Contributions</h3>
            <span className="text-sm font-semibold text-primary">View All</span>
          </div>
          <div className="space-y-3">
            {contributionItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-[24px] bg-slate-50 px-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-primary">
                    <MapPinIcon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      {item.location} • {item.dateLabel}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === "Published"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[32px] bg-white p-5 shadow-[0_18px_42px_rgba(17,24,39,0.08)]">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Saved Places</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {savedPlaces.map((place) => (
              <div key={place.id} className="overflow-hidden rounded-[24px] bg-slate-50">
                <div className="relative h-28">
                  <Image src={place.image} alt={place.name} fill sizes="180px" className="object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="line-clamp-2 text-sm font-semibold text-slate-900">{place.name}</h4>
                    <HeartIcon className="size-4 shrink-0 text-rose-500" filled />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[32px] bg-white p-5 shadow-[0_18px_42px_rgba(17,24,39,0.08)]">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Recent Reviews</h3>
          <div className="mt-4 space-y-4">
            {recentReviews.slice(0, 3).map((review) => (
              <div key={review.id} className="rounded-[24px] bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{review.placeName}</p>
                    <p className="text-sm text-slate-500">{review.author}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 text-amber-500">
                    <StarIcon className="size-4" />
                    <span className="text-sm font-semibold text-slate-900">{review.rating}.0</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] bg-slate-50 px-3 py-5 text-center">
      <p className="text-3xl font-semibold tracking-tight text-primary">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </div>
  );
}
