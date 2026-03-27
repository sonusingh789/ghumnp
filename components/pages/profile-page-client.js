"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { useFavorites } from "@/context/favorites-context";
import { buildLoginHref } from "@/utils/navigation";
import {
  BookmarkIcon,
  CameraIcon,
  FileTextIcon,
  LogOutIcon,
  MailIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
} from "@/components/ui/icons";

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
  const hasHydratedRef = useRef(false);
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

  async function fetchLatestProfile() {
    const response = await fetch("/api/profile", { cache: "no-store" });
    const data = await response.json().catch(() => null);

    if (!data) return null;

    if (response.status === 401 || data.authenticated === false) {
      router.replace(buildLoginHref("/profile"));
      return null;
    }

    return data;
  }

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    let cancelled = false;

    async function refreshProfile() {
      const data = await fetchLatestProfile();
      if (cancelled || !data) {
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
  }, [favorites.length, router]);

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

    const refreshed = await fetchLatestProfile();
    if (!refreshed) return;
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

    const refreshed = await fetchLatestProfile();
    if (!refreshed) return;
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

    const refreshed = await fetchLatestProfile();
    if (!refreshed) return;
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

    const refreshed = await fetchLatestProfile();
    if (!refreshed) return;
    setProfile(refreshed);
    setEditingReviewId("");
    setSuccess("Review deleted.");
    router.refresh();
  }

  const { userProfile, contributionItems, recentReviews, favoritePlaces } = profile;
  const profileStats = [
    {
      label: "Contributions",
      value: userProfile.stats.contributions,
      tone: "bg-emerald-50 text-emerald-700",
      icon: FileTextIcon,
    },
    {
      label: "Saved Places",
      value: favoritePlaces.length || favorites.length,
      tone: "bg-rose-50 text-rose-600",
      icon: BookmarkIcon,
    },
    {
      label: "Reviews",
      value: userProfile.stats.reviews,
      tone: "bg-amber-50 text-amber-600",
      icon: StarIcon,
    },
  ];

  return (
  <AppShell className="bg-[#f5f6f8]">
    <div className="mx-auto w-full max-w-6xl pb-6 pt-2 md:pb-8 md:pt-3">
      <section className="relative overflow-hidden rounded-2xl md:rounded-[34px] border border-black/5 bg-[linear-gradient(135deg,#0f9f58_0%,#0d6e42_55%,#103f2d_100%)] px-4 pb-7 pt-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)] md:px-7 md:pb-10 md:pt-6">
        <div className="absolute -right-10 top-0 size-32 md:size-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-20 w-32 md:h-28 md:w-40 rounded-tr-[80px] md:rounded-tr-[120px] bg-white/6" />
        <div className="absolute right-5 top-5 flex items-center gap-3">
          <HeroChip
            icon={LogOutIcon}
            label={loggingOut ? "Logging out..." : "Logout"}
            onClick={handleLogout}
            disabled={loggingOut}
          />
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            aria-label={deletingAccount ? "Deleting account" : "Delete account"}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/14 bg-red-500/15 text-white backdrop-blur transition hover:bg-red-500/25 disabled:opacity-60"
          >
            <TrashIcon className="size-5" />
          </button>
        </div>
        
        <div className="flex flex-col gap-5">
          <div className="pr-28 text-left md:pr-40">
            <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] md:tracking-[0.24em] text-white/60">
              Account Settings
            </p>
            <h1 className="mt-2 text-[1.75rem] md:text-[2.4rem] font-semibold tracking-tight text-white">
              My Profile
            </h1>
          </div>

        </div>
      </section>

      {/* Main Content - Stacked on mobile, grid on desktop */}
      <div className="relative z-10 -mt-8 md:-mt-14 grid gap-5 md:gap-6 lg:grid-cols-[minmax(0,1.15fr)_380px]">
        {/* Profile Section */}
        <section className="rounded-2xl md:rounded-[30px] border border-black/5 bg-white p-4 md:p-6 shadow-[0_20px_44px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] md:tracking-[0.22em] text-emerald-600">
                Profile
              </p>
              <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-slate-950">
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2.5 md:py-2 text-sm font-semibold text-emerald-700 md:w-auto"
            >
              <PencilIcon className="size-4" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="mt-5 md:mt-6 space-y-4 md:space-y-5">
            {/* Profile Photo Card - Mobile optimized */}
            <div className="flex flex-col gap-4 rounded-2xl md:rounded-[28px] bg-[linear-gradient(145deg,#f7fbf8,#eff6ff)] p-4 md:p-5 md:flex-row md:items-center">
              <div className="relative size-20 md:size-24 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] mx-auto md:mx-0">
                {(isEditing ? form.avatar : userProfile.avatar) ? (
                  <Image
                    src={(isEditing ? form.avatar : userProfile.avatar) || fallbackAvatar}
                    alt={(isEditing ? form.name : userProfile.name) || "Traveler"}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#dff5e7,#e7eefc)] text-2xl md:text-3xl font-semibold text-emerald-700">
                    {((isEditing ? form.name : userProfile.name) || "T").trim().charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="min-w-0 flex-1 text-center md:text-left">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-950">
                      {isEditing ? "Profile Photo" : userProfile.name}
                    </h3>
                    {!isEditing ? (
                      <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                        <MailIcon className="size-4" />
                        {userProfile.email || "No email"}
                      </div>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-xs md:text-sm leading-5 md:leading-6 text-slate-500">
                  {isEditing
                    ? "Upload a square portrait for the cleanest look across the app."
                    : userProfile.bio}
                </p>
                
                {isEditing ? (
                  <>
                    <div className="mt-3 md:mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
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
                        className="inline-flex items-center gap-2 rounded-full bg-[#0f9f58] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,159,88,0.22)]"
                      >
                        <CameraIcon className="size-4" />
                        {uploadingAvatar ? "Uploading..." : "Upload New Photo"}
                      </button>
                      <span className="text-xs md:text-sm font-medium text-slate-500">
                        {uploadingAvatar ? `${uploadProgress}% uploaded` : "PNG, JPG, WEBP"}
                      </span>
                    </div>
                    {uploadingAvatar && (
                      <div className="mt-3 md:mt-4 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-[#0f9f58] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-3 md:mt-4 grid gap-2 md:gap-3 sm:grid-cols-2">
                    <InfoTile label="Email" value={userProfile.email || "Not added"} icon={MailIcon} />
                    <InfoTile label="Bio" value={userProfile.bio || "No bio added yet"} icon={PencilIcon} />
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <form onSubmit={handleSave} className="space-y-4 md:space-y-5">
                <div className="grid gap-4 md:gap-4 sm:grid-cols-2">
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
                    rows={4}
                    className={`${inputClass} resize-none py-3 md:py-4`}
                    placeholder="Tell travelers a little about yourself..."
                  />
                </Field>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
                  <button
                    type="submit"
                    disabled={saving || uploadingAvatar}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f9f58] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(15,159,88,0.22)] disabled:opacity-70 md:w-auto"
                  >
                    <PencilIcon className="size-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <span className="text-xs md:text-sm text-slate-500 text-center md:text-left">
                    Changes update your profile and avatar everywhere this account appears.
                  </span>
                </div>
              </form>
            )}

            {error && (
              <div className="rounded-xl md:rounded-[20px] border border-red-100 bg-red-50 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl md:rounded-[20px] border border-emerald-100 bg-emerald-50 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-emerald-700">
                {success}
              </div>
            )}
          </div>
        </section>

        {/* Sidebar - Profile Overview and Favorite Places */}
        <aside className="space-y-5 md:space-y-6">
          <section className="rounded-2xl md:rounded-[30px] border border-black/5 bg-white p-4 md:p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] md:tracking-[0.22em] text-emerald-600">
              Snapshot
            </p>
            <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-slate-950">
              Profile Overview
            </h2>
            <div className="mt-4 md:mt-5 space-y-2 md:space-y-3">
              {profileStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </section>

          {!!favoritePlaces.length && (
            <section className="rounded-2xl md:rounded-[30px] border border-black/5 bg-white p-4 md:p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] md:tracking-[0.22em] text-emerald-600">
                    Saved
                  </p>
                  <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-slate-950">
                    Favorite Places
                  </h2>
                </div>
                <Link href="/favorites" className="text-xs md:text-sm font-semibold text-emerald-600">
                  See all
                </Link>
              </div>
              <div className="mt-4 md:mt-5 grid grid-cols-2 gap-2 md:gap-3">
                {favoritePlaces.slice(0, 4).map((place) => (
                  <Link
                    key={place.id}
                    href={`/place/${place.id}`}
                    className="overflow-hidden rounded-xl md:rounded-[22px] border border-black/5 bg-slate-50"
                  >
                    <div className="relative h-20 md:h-24">
                      <Image src={place.image} alt={place.name} fill sizes="180px" className="object-cover" />
                    </div>
                    <div className="px-2 md:px-3 py-2 md:py-3">
                      <div className="line-clamp-2 text-xs md:text-sm font-semibold text-slate-900">
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

      {/* Bottom Sections - Contributions and Reviews */}
      <div className="mt-5 md:mt-6 grid gap-5 md:gap-6 lg:grid-cols-2">
        <section className="rounded-2xl md:rounded-[30px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          <div className="border-b border-black/5 px-4 md:px-5 py-3 md:py-4">
            <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] md:tracking-[0.22em] text-emerald-600">
              Activity
            </p>
            <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-slate-950">
              My Contributions
            </h2>
          </div>
          <div>
            {contributionItems.length ? (
              contributionItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`px-4 md:px-5 py-3 md:py-4 ${index < contributionItems.length - 1 ? "border-b border-black/5" : ""}`}
                >
                  <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm md:text-base font-semibold text-slate-950 break-words">
                          {item.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{item.location} · {item.dateLabel}</div>
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <span
                          className={`rounded-full px-2.5 py-1.5 md:py-1 text-xs font-semibold ${
                            item.status === "Published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {item.status}
                        </span>
                        <IconActionButton
                          label="Edit contribution"
                          onClick={() => beginContributionEdit(item)}
                          icon={PencilIcon}
                        />
                        <IconActionButton
                          label="Delete contribution"
                          onClick={() => handleContributionDelete(item.slug || item.id)}
                          icon={TrashIcon}
                          tone="danger"
                        />
                      </div>
                    </div>
                    
                    {editingContributionId === (item.slug || item.id) && (
                      <div className="mt-2 md:mt-4 rounded-xl md:rounded-[22px] bg-slate-50 p-3 md:p-4">
                        <div className="grid gap-2 md:gap-3 sm:grid-cols-2">
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
                        <div className="mt-2 md:mt-3">
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
                        <div className="mt-2 md:mt-3">
                          <textarea
                            rows={3}
                            value={contributionForm.description}
                            onChange={(event) => setContributionForm((current) => ({ ...current, description: event.target.value }))}
                            className={`${inputClass} resize-none py-2 md:py-4`}
                            placeholder="Description"
                          />
                        </div>
                        <div className="mt-2 md:mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleContributionSave(item.slug || item.id)}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-white"
                          >
                            <PencilIcon className="size-4" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingContributionId("")}
                            className="rounded-full bg-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 md:px-5 py-6 md:py-8 text-xs md:text-sm text-slate-500 text-center">
                No contributions yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl md:rounded-[30px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          <div className="border-b border-black/5 px-4 md:px-5 py-3 md:py-4">
            <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] md:tracking-[0.22em] text-emerald-600">
              Community
            </p>
            <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-slate-950">
              Recent Reviews
            </h2>
          </div>
          <div>
            {recentReviews.length ? (
              recentReviews.slice(0, 4).map((review, index) => (
                <div
                  key={review.id}
                  className={`px-4 md:px-5 py-3 md:py-4 ${index < Math.min(recentReviews.length, 4) - 1 ? "border-b border-black/5" : ""}`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-sm md:text-base font-semibold text-slate-950">{review.placeName}</div>
                        <div className="mt-1 text-xs text-slate-500">{review.author}</div>
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <div className="rounded-full bg-amber-50 px-2.5 py-1.5 md:py-1 text-xs font-semibold text-amber-700">
                          ★ {review.rating}.0
                        </div>
                        <IconActionButton
                          label="Edit review"
                          onClick={() => beginReviewEdit(review)}
                          icon={PencilIcon}
                        />
                        <IconActionButton
                          label="Delete review"
                          onClick={() => handleReviewDelete(review.reviewId || review.id)}
                          icon={TrashIcon}
                          tone="danger"
                        />
                      </div>
                    </div>
                    <p className="text-xs md:text-sm leading-5 md:leading-6 text-slate-600">{review.comment}</p>
                    
                    {editingReviewId === (review.reviewId || review.id) && (
                      <div className="mt-2 md:mt-4 rounded-xl md:rounded-[22px] bg-slate-50 p-3 md:p-4">
                        <div className="grid gap-2 md:gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
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
                            rows={3}
                            value={reviewForm.comment}
                            onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                            className={`${inputClass} resize-none py-2 md:py-4`}
                            placeholder="Update your review"
                          />
                        </div>
                        <div className="mt-2 md:mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReviewSave(review.reviewId || review.id)}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-white"
                          >
                            <PencilIcon className="size-4" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReviewId("")}
                            className="rounded-full bg-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 md:px-5 py-6 md:py-8 text-xs md:text-sm text-slate-500 text-center">
                No reviews yet.
              </div>
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

function HeroChip({ icon: IconComponent, label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur disabled:opacity-70"
    >
      <IconComponent className="size-4" />
      {label}
    </button>
  );
}

function StatCard({ label, value, tone, icon: IconComponent }) {
  return (
    <div className="flex items-center justify-between rounded-xl md:rounded-[22px] bg-slate-50 px-3 md:px-4 py-3 md:py-4">
      <div className="inline-flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
          <IconComponent className="size-4" />
        </span>
        <span className="text-xs md:text-sm font-medium text-slate-600">{label}</span>
      </div>
      <span className={`rounded-full px-2.5 md:px-3 py-1 text-xs md:text-sm font-semibold ${tone}`}>
        {value}
      </span>
    </div>
  );
}

function IconActionButton({ label, onClick, icon: IconComponent, tone = "neutral" }) {
  const toneClass =
    tone === "danger"
      ? "bg-red-50 text-red-600 hover:bg-red-100"
      : "bg-slate-100 text-slate-700 hover:bg-slate-200";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex size-9 items-center justify-center rounded-full transition ${toneClass}`}
    >
      <IconComponent className="size-4" />
    </button>
  );
}

function InfoTile({ label, value, icon: IconComponent }) {
  return (
    <div className="rounded-[22px] bg-white/80 px-4 py-3">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {IconComponent ? <IconComponent className="size-4" /> : null}
        {label}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-700">{value}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-[20px] border border-black/6 bg-white px-4 py-3.5 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-200";
