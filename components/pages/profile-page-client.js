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
  UserIcon,
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

export default function ProfilePageClient({ initialProfile, userId }) {
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
    <div className="mx-auto w-full max-w-2xl pb-6 pt-2">
      {/* Green header */}
      <div style={{ background: "linear-gradient(135deg, #059669 0%, #065f46 100%)", margin: "-24px -1px 0", padding: "20px 20px 64px", borderRadius: "0 0 32px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Account</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>My Profile</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {userId ? (
              <Link
                href={`/contributors/${(userProfile.name || "user").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${userId}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#fff", textDecoration: "none" }}
              >
                <UserIcon className="size-3.5" />
                Public Profile
              </Link>
            ) : null}
            <HeroChip
              icon={LogOutIcon}
              label={loggingOut ? "..." : "Logout"}
              onClick={handleLogout}
              disabled={loggingOut}
            />
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              aria-label="Delete account"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(239,68,68,0.15)", color: "#fff", cursor: "pointer", flexShrink: 0 }}
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile card overlapping header */}
      <div style={{ margin: "-44px 0 0", background: "#fff", borderRadius: 24, padding: "20px", boxShadow: "0 8px 32px rgba(15,23,42,0.1)", position: "relative", zIndex: 1, border: "1.5px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "#d1fae5", border: "3px solid #fff", boxShadow: "0 4px 14px rgba(5,150,105,0.25)" }}>
              {(isEditing ? form.avatar : userProfile.avatar) ? (
                <Image src={(isEditing ? form.avatar : userProfile.avatar) || fallbackAvatar} alt={userProfile.name || "Traveler"} fill sizes="72px" className="object-cover" />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#059669" }}>
                  {(userProfile.name || "T")[0].toUpperCase()}
                </div>
              )}
            </div>
            {isEditing ? (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload photo"
                  style={{ position: "absolute", bottom: -2, right: -4, background: "#059669", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", cursor: "pointer", color: "#fff" }}
                >
                  <CameraIcon className="size-3" />
                </button>
              </>
            ) : null}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 2 }}>{userProfile.name}</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: userProfile.bio && !isEditing ? 6 : 0 }}>{userProfile.email}</p>
            {userProfile.bio && !isEditing ? <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.55 }}>{userProfile.bio}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setError(""); setSuccess("");
              if (isEditing) { setForm({ name: userProfile.name || "", email: userProfile.email || "", bio: userProfile.bio || "", avatar: userProfile.avatar || fallbackAvatar }); }
              setIsEditing((c) => !c);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#f8fafc", padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#475569", cursor: "pointer", flexShrink: 0 }}
          >
            <PencilIcon className="size-3.5" />
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Stats 3-col */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
          {[
            { label: "Contributions", value: userProfile.stats.contributions, color: "#059669", bg: "#ecfdf5" },
            { label: "Saved Places",  value: favoritePlaces.length || favorites.length, color: "#1d4ed8", bg: "#eff6ff" },
            { label: "Reviews",       value: userProfile.stats.reviews, color: "#d97706", bg: "#fffbeb" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 14, padding: "12px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
            </div>
          ))}
        </div>

        {uploadingAvatar ? (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{uploadProgress}% uploaded</p>
            <div style={{ height: 5, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "#059669", width: `${uploadProgress}%`, transition: "width 0.3s" }} />
            </div>
          </div>
        ) : null}
      </div>

      {/* Edit form */}
      {isEditing ? (
        <div style={{ margin: "12px 0 0", background: "#fff", borderRadius: 20, padding: "20px", border: "1.5px solid #f1f5f9" }}>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Full Name">
                <input value={form.name} onChange={(e) => handleFieldChange("name", e.target.value)} className={inputClass} placeholder="Your full name" />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => handleFieldChange("email", e.target.value)} className={inputClass} placeholder="you@example.com" />
              </Field>
            </div>
            <Field label="Bio">
              <textarea value={form.bio} onChange={(e) => handleFieldChange("bio", e.target.value)} rows={3} className={`${inputClass} resize-none py-3`} placeholder="Tell travelers about yourself..." />
            </Field>
            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, background: "#059669", color: "#fff", padding: "11px 24px", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", opacity: (saving || uploadingAvatar) ? 0.7 : 1, alignSelf: "flex-start" }}
            >
              <PencilIcon className="size-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      ) : null}

      {error ? (
        <div style={{ margin: "12px 0 0", borderRadius: 14, background: "#fef2f2", border: "1.5px solid #fecaca", padding: "12px 16px", fontSize: 13, color: "#dc2626" }}>{error}</div>
      ) : null}
      {success ? (
        <div style={{ margin: "12px 0 0", borderRadius: 14, background: "#ecfdf5", border: "1.5px solid #bbf7d0", padding: "12px 16px", fontSize: 13, color: "#059669" }}>{success}</div>
      ) : null}

      {/* Saved Places */}
      {favoritePlaces.length ? (
        <div style={{ margin: "16px 0 0", background: "#fff", borderRadius: 20, padding: "18px", border: "1.5px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Saved Places</h2>
            <Link href="/favorites" style={{ fontSize: 12, fontWeight: 700, color: "#059669", textDecoration: "none" }}>See all</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {favoritePlaces.slice(0, 4).map((place) => (
              <Link key={place.id} href={`/place/${place.id}`} style={{ textDecoration: "none", borderRadius: 14, overflow: "hidden", border: "1.5px solid #f1f5f9", background: "#f8fafc" }}>
                <div style={{ position: "relative", height: 80 }}>
                  <Image src={place.image} alt={place.name} fill sizes="180px" className="object-cover" />
                </div>
                <div style={{ padding: "8px 10px", fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{place.name}</div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

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
