"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { useFavorites } from "@/context/favorites-context";
import { buildLoginHref } from "@/utils/navigation";

const fallbackAvatar = "";

function uploadProfileImage(file, folderHint, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const payload = new FormData();
    payload.append("file", file);
    payload.append("folderHint", folderHint);
    payload.append("folderType", "users");

    xhr.open("POST", "/api/uploads/imagekit");
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      const data = xhr.response || {};
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }
      reject(new Error(data.error || "Profile image upload failed."));
    };

    xhr.onerror = () => reject(new Error("Profile image upload failed."));
    xhr.send(payload);
  });
}

export default function ProfilePageClient({ initialProfile }) {
  const router = useRouter();
  const { favorites } = useFavorites();
  const fileInputRef = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [editingContributionId, setEditingContributionId] = useState("");
  const [editingReviewId, setEditingReviewId] = useState("");
  const [contributionForm, setContributionForm] = useState({
    name: "",
    location: "",
    description: "",
    category: "",
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState(initialProfile);
  const [form, setForm] = useState({
    name: initialProfile.userProfile?.name || "",
    email: initialProfile.userProfile?.email || "",
    bio: initialProfile.userProfile?.bio || "",
    avatar: initialProfile.userProfile?.avatar || fallbackAvatar,
  });

  useEffect(() => {
    setProfile(initialProfile);
    setForm({
      name: initialProfile.userProfile?.name || "",
      email: initialProfile.userProfile?.email || "",
      bio: initialProfile.userProfile?.bio || "",
      avatar: initialProfile.userProfile?.avatar || fallbackAvatar,
    });
  }, [initialProfile]);

  useEffect(() => {
    let cancelled = false;

    async function refreshProfile() {
      const response = await fetch("/api/profile", { cache: "no-store" });
      const data = await response.json().catch(() => null);

      if (cancelled || !data) return;

      if (response.status === 401 || data.authenticated === false) {
        router.replace(buildLoginHref("/profile"));
        return;
      }

      setProfile(data);
      if (!isEditing) {
        setForm({
          name: data.userProfile?.name || "",
          email: data.userProfile?.email || "",
          bio: data.userProfile?.bio || "",
          avatar: data.userProfile?.avatar || fallbackAvatar,
        });
      }
    }

    refreshProfile();

    return () => {
      cancelled = true;
    };
  }, [favorites.length, isEditing, router]);

  function handleFieldChange(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setSuccess("");
    setUploadingAvatar(true);
    setUploadProgress(0);

    try {
      const uploaded = await uploadProfileImage(file, form.name || "traveler", setUploadProgress);
      setForm((current) => ({
        ...current,
        avatar: uploaded.url,
      }));
      setSuccess("Profile photo uploaded. Save profile to keep changes.");
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload profile image.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          bio: form.bio,
          avatarUrl: form.avatar,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Unable to save profile.");
        return;
      }

      setProfile(data);
      setForm({
        name: data.userProfile?.name || "",
        email: data.userProfile?.email || "",
        bio: data.userProfile?.bio || "",
        avatar: data.userProfile?.avatar || fallbackAvatar,
      });
      setIsEditing(false);
      setSuccess(data.message || "Profile updated successfully.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete your account permanently? This will remove your profile, contributions, and reviews."
    );
    if (!confirmed) return;

    setDeletingAccount(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile/account", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Unable to delete account.");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setDeletingAccount(false);
    }
  }

  function beginContributionEdit(item) {
    setEditingContributionId(item.slug || item.id);
    setContributionForm({
      name: item.name || "",
      location: item.location || "",
      description: item.description || "",
      category: item.category || "attraction",
    });
    setError("");
    setSuccess("");
  }

  async function handleContributionSave(slug) {
    setError("");
    setSuccess("");

    const response = await fetch(`/api/profile/contributions/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contributionForm),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Unable to update contribution.");
      return;
    }

    const refreshed = await fetch("/api/profile", { cache: "no-store" }).then((res) => res.json());
    setProfile(refreshed);
    setEditingContributionId("");
    setSuccess("Contribution updated successfully.");
    router.refresh();
  }

  async function handleContributionDelete(slug) {
    const confirmed = window.confirm("Delete this contribution?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    const response = await fetch(`/api/profile/contributions/${slug}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Unable to delete contribution.");
      return;
    }

    const refreshed = await fetch("/api/profile", { cache: "no-store" }).then((res) => res.json());
    setProfile(refreshed);
    setEditingContributionId("");
    setSuccess("Contribution deleted.");
    router.refresh();
  }

  function beginReviewEdit(review) {
    setEditingReviewId(review.reviewId || review.id);
    setReviewForm({
      rating: Number(review.rating || 5),
      comment: review.comment || "",
    });
    setError("");
    setSuccess("");
  }

  async function handleReviewSave(reviewId) {
    setError("");
    setSuccess("");

    const response = await fetch(`/api/profile/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewForm),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Unable to update review.");
      return;
    }

    const refreshed = await fetch("/api/profile", { cache: "no-store" }).then((res) => res.json());
    setProfile(refreshed);
    setEditingReviewId("");
    setSuccess("Review updated successfully.");
    router.refresh();
  }

  async function handleReviewDelete(reviewId) {
    const confirmed = window.confirm("Delete this review?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    const response = await fetch(`/api/profile/reviews/${reviewId}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Unable to delete review.");
      return;
    }

    const refreshed = await fetch("/api/profile", { cache: "no-store" }).then((res) => res.json());
    setProfile(refreshed);
    setEditingReviewId("");
    setSuccess("Review deleted.");
    router.refresh();
  }

  const { userProfile, contributionItems, recentReviews, favoritePlaces } = profile;

  return (
    <AppShell className="bg-[#f5f6f8]">
      <div className="mx-auto w-full max-w-6xl pb-8 pt-3">
        <section className="relative overflow-hidden rounded-[34px] border border-black/5 bg-[linear-gradient(135deg,#0f9f58_0%,#0d6e42_55%,#103f2d_100%)] px-5 pb-20 pt-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:px-7">
          <div className="absolute -right-10 top-0 size-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-40 rounded-tr-[120px] bg-white/6" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                Account Settings
              </p>
              <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-white sm:text-[2.4rem]">
                My Profile
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                Update your traveler details, refresh your profile photo, and keep your public identity polished.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur disabled:opacity-70"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-70"
            >
              {deletingAccount ? "Deleting account..." : "Delete Account"}
            </button>
          </div>
        </section>

        <div className="relative z-10 -mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_380px]">
          <section className="rounded-[30px] border border-black/5 bg-white p-5 shadow-[0_20px_44px_rgba(15,23,42,0.07)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">
                  Profile
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  Personal Information
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  if (isEditing) {
                    setForm({
                      name: userProfile.name || "",
                      email: userProfile.email || "",
                      bio: userProfile.bio || "",
                      avatar: userProfile.avatar || fallbackAvatar,
                    });
                  }
                  setIsEditing((current) => !current);
                }}
                className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex flex-col gap-5 rounded-[28px] bg-[linear-gradient(145deg,#f7fbf8,#eff6ff)] p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
                  {(isEditing ? form.avatar : userProfile.avatar) ? (
                    <Image
                      src={(isEditing ? form.avatar : userProfile.avatar) || fallbackAvatar}
                      alt={(isEditing ? form.name : userProfile.name) || "Traveler"}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#dff5e7,#e7eefc)] text-3xl font-semibold text-emerald-700">
                      {((isEditing ? form.name : userProfile.name) || "T").trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {isEditing ? "Profile Photo" : userProfile.name}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {isEditing
                      ? "Upload a square portrait for the cleanest look across the app."
                      : userProfile.bio}
                  </p>
                  {isEditing ? (
                    <>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleAvatarChange}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-full bg-[#0f9f58] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,159,88,0.22)]"
                        >
                          {uploadingAvatar ? "Uploading..." : "Upload New Photo"}
                        </button>
                        <span className="text-sm font-medium text-slate-500">
                          {uploadingAvatar ? `${uploadProgress}% uploaded` : "PNG, JPG, WEBP"}
                        </span>
                      </div>
                      {uploadingAvatar ? (
                        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-[#0f9f58] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoTile label="Email" value={userProfile.email || "Not added"} />
                      <InfoTile label="Bio" value={userProfile.bio || "No bio added yet"} />
                    </div>
                  )}
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full Name">
                      <input
                        value={form.name}
                        onChange={(event) => handleFieldChange("name", event.target.value)}
                        className={inputClass}
                        placeholder="Enter your full name"
                      />
                    </Field>

                    <Field label="Email Address">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => handleFieldChange("email", event.target.value)}
                        className={inputClass}
                        placeholder="you@example.com"
                      />
                    </Field>
                  </div>

                  <Field label="Bio">
                    <textarea
                      value={form.bio}
                      onChange={(event) => handleFieldChange("bio", event.target.value)}
                      rows={5}
                      className={`${inputClass} resize-none py-4`}
                      placeholder="Tell travelers a little about yourself..."
                    />
                  </Field>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving || uploadingAvatar}
                      className="rounded-full bg-[#0f9f58] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(15,159,88,0.22)] disabled:opacity-70"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <span className="text-sm text-slate-500">
                      Changes update your profile and avatar everywhere this account appears.
                    </span>
                  </div>
                </form>
              ) : null}

              {error ? (
                <div className="rounded-[20px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">
                Snapshot
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Profile Overview
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Contributions", value: userProfile.stats.contributions, tone: "bg-emerald-50 text-emerald-700" },
                  { label: "Saved Places", value: favoritePlaces.length || favorites.length, tone: "bg-rose-50 text-rose-600" },
                  { label: "Reviews", value: userProfile.stats.reviews, tone: "bg-amber-50 text-amber-600" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-4"
                  >
                    <span className="text-sm font-medium text-slate-600">{stat.label}</span>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${stat.tone}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {!!favoritePlaces.length && (
              <section className="rounded-[30px] border border-black/5 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">
                      Saved
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                      Favorite Places
                    </h2>
                  </div>
                  <Link href="/favorites" className="text-sm font-semibold text-emerald-600">
                    See all
                  </Link>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {favoritePlaces.slice(0, 4).map((place) => (
                    <Link
                      key={place.id}
                      href={`/place/${place.id}`}
                      className="overflow-hidden rounded-[22px] border border-black/5 bg-slate-50"
                    >
                      <div className="relative h-24">
                        <Image src={place.image} alt={place.name} fill sizes="180px" className="object-cover" />
                      </div>
                      <div className="px-3 py-3">
                        <div className="line-clamp-2 text-sm font-semibold text-slate-900">
                          {place.name}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[30px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <div className="border-b border-black/5 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">
                Activity
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                My Contributions
              </h2>
            </div>
            <div>
              {contributionItems.length ? (
                contributionItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 px-5 py-4 ${index < contributionItems.length - 1 ? "border-b border-black/5" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-950">{item.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{item.location} · {item.dateLabel}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => beginContributionEdit(item)}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleContributionDelete(item.slug || item.id)}
                            className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {editingContributionId === (item.slug || item.id) ? (
                        <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              value={contributionForm.name}
                              onChange={(event) => setContributionForm((current) => ({ ...current, name: event.target.value }))}
                              className={inputClass}
                              placeholder="Place name"
                            />
                            <input
                              value={contributionForm.location}
                              onChange={(event) => setContributionForm((current) => ({ ...current, location: event.target.value }))}
                              className={inputClass}
                              placeholder="Location"
                            />
                          </div>
                          <div className="mt-3">
                            <select
                              value={contributionForm.category}
                              onChange={(event) => setContributionForm((current) => ({ ...current, category: event.target.value }))}
                              className={inputClass}
                            >
                              <option value="attraction">Attraction</option>
                              <option value="food">Food</option>
                              <option value="restaurant">Restaurant</option>
                              <option value="hotel">Hotel</option>
                              <option value="stay">Stay</option>
                            </select>
                          </div>
                          <div className="mt-3">
                            <textarea
                              rows={4}
                              value={contributionForm.description}
                              onChange={(event) => setContributionForm((current) => ({ ...current, description: event.target.value }))}
                              className={`${inputClass} resize-none py-4`}
                              placeholder="Description"
                            />
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleContributionSave(item.slug || item.id)}
                              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingContributionId("")}
                              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-sm text-slate-500">No contributions yet.</div>
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <div className="border-b border-black/5 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">
                Community
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Recent Reviews
              </h2>
            </div>
            <div>
              {recentReviews.length ? (
                recentReviews.slice(0, 4).map((review, index) => (
                  <div
                    key={review.id}
                    className={`px-5 py-4 ${index < Math.min(recentReviews.length, 4) - 1 ? "border-b border-black/5" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{review.placeName}</div>
                        <div className="mt-1 text-xs text-slate-500">{review.author}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          ★ {review.rating}.0
                        </div>
                        <button
                          type="button"
                          onClick={() => beginReviewEdit(review)}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewDelete(review.reviewId || review.id)}
                          className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
                    {editingReviewId === (review.reviewId || review.id) ? (
                      <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
                        <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                          <select
                            value={reviewForm.rating}
                            onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}
                            className={inputClass}
                          >
                            {[5, 4, 3, 2, 1].map((value) => (
                              <option key={value} value={value}>
                                {value} Star{value > 1 ? "s" : ""}
                              </option>
                            ))}
                          </select>
                          <textarea
                            rows={4}
                            value={reviewForm.comment}
                            onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                            className={`${inputClass} resize-none py-4`}
                            placeholder="Update your review"
                          />
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReviewSave(review.reviewId || review.id)}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReviewId("")}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-sm text-slate-500">No reviews yet.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-950">{label}</span>
      {children}
    </label>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-[22px] bg-white/80 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-700">{value}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-[20px] border border-black/6 bg-white px-4 py-3.5 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-200";
