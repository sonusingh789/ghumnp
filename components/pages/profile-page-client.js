"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { useFavorites } from "@/context/favorites-context";
import { buildLoginHref } from "@/utils/navigation";
import { allDistricts } from "@/data/nepal";
import {
  CameraIcon,
  LogOutIcon,
  MailIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from "@/components/ui/icons";

const fallbackAvatar = "";

async function uploadProfileImage(file, folderHint, onProgress) {
  onProgress(10);

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });

  onProgress(50);

  const res = await fetch("/api/uploads/imagekit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      file: dataUrl,
      fileName: file.name || `avatar-${Date.now()}`,
      mimeType: file.type || "image/jpeg",
      folderHint,
      folderType: "users",
    }),
  });

  onProgress(90);

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Profile image upload failed.");

  onProgress(100);
  return data;
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
  const [contribPage, setContribPage] = useState(1);
  const CONTRIB_PER_PAGE = 5;
  const [editingReviewId, setEditingReviewId] = useState("");
  const [contributionForm, setContributionForm] = useState({
    name: "",
    location: "",
    description: "",
    category: "",
    district: "",
  });
  const [contributionImages, setContributionImages] = useState({});
  const [imageUploading, setImageUploading] = useState(false);
  const placeFileInputRef = useRef(null);
  const activeUploadSlug = useRef(null);
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

  async function loadContributionImages(slug) {
    try {
      const res = await fetch(`/api/profile/contributions/${slug}/images`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setContributionImages((prev) => ({ ...prev, [slug]: data.images || [] }));
      }
    } catch {
      // silent — images section will just be empty
    }
  }

  function beginContributionEdit(item) {
    const slug = item.slug || item.id;
    setEditingContributionId(slug);
    setContributionForm({
      name: item.name || "",
      location: item.location || "",
      description: item.description || "",
      category: item.category || "attraction",
      district: item.district || "",
    });
    setError("");
    setSuccess("");
    loadContributionImages(slug);
  }

  async function handleContributionImageUpload(slug, file) {
    if (!file) return;
    setImageUploading(true);
    setError("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Could not read image file."));
        reader.readAsDataURL(file);
      });
      const uploadRes = await fetch("/api/uploads/imagekit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          file: dataUrl,
          fileName: file.name || `place-${Date.now()}`,
          mimeType: file.type || "image/jpeg",
          folderHint: contributionForm.name || slug,
          folderType: "places",
        }),
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed.");
      const res = await fetch(`/api/profile/contributions/${slug}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadData.url, fileId: uploadData.fileId || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Image upload failed."); return; }
      await loadContributionImages(slug);
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleContributionImageDelete(slug, imageId) {
    setError("");
    const res = await fetch(`/api/profile/contributions/${slug}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || "Could not remove image."); return; }
    await loadContributionImages(slug);
  }

  async function handleContributionSave(slug) {
    setError("");
    setSuccess("");

    const response = await fetch(`/api/profile/contributions/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: contributionForm.name,
        location: contributionForm.location,
        description: contributionForm.description,
        category: contributionForm.category,
        district: contributionForm.district,
      }),
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

  return (
    <AppShell>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)",
        margin: "-24px -1px 0",
        padding: "28px 20px 72px",
        borderRadius: "0 0 32px 32px",
        position: "relative",
        overflow: "hidden",
      }} className="fade-up">
        <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Account</p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>My <span style={{ color: "#86efac" }}>Profile</span></h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginTop: 4 }}>
            {userId ? (
              <Link
                href={`/contributors/${(userProfile.name || "user").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${userId}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "8px 13px", fontSize: 12, fontWeight: 700, color: "#fff", textDecoration: "none" }}
              >
                <UserIcon style={{ width: 13, height: 13 }} />
                Public
              </Link>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "8px 13px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}
            >
              <LogOutIcon style={{ width: 13, height: 13 }} />
              {loggingOut ? "..." : "Logout"}
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              aria-label="Delete account"
              style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(239,68,68,0.18)", color: "#fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <TrashIcon style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px 40px" }}>
        {/* ── PROFILE CARD (overlaps header) ─────────────────── */}
        <div style={{ margin: "-52px 0 0", background: "#fff", borderRadius: 24, padding: "20px", boxShadow: "0 8px 32px rgba(15,23,42,0.1)", position: "relative", zIndex: 1, border: "1.5px solid #f1f5f9" }} className="fade-up">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "#d1fae5", border: "3px solid #fff", boxShadow: "0 4px 14px rgba(5,150,105,0.25)", position: "relative" }}>
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
                    <CameraIcon style={{ width: 11, height: 11 }} />
                  </button>
                </>
              ) : null}
            </div>

            {/* Name / email / bio */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 2 }}>{userProfile.name}</h2>
              <p style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <MailIcon style={{ width: 12, height: 12, flexShrink: 0 }} />
                {userProfile.email}
              </p>
              {userProfile.bio && !isEditing ? (
                <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.55, marginTop: 6 }}>{userProfile.bio}</p>
              ) : null}
            </div>

            {/* Edit toggle */}
            <button
              type="button"
              onClick={() => {
                setError(""); setSuccess("");
                if (isEditing) { setForm({ name: userProfile.name || "", email: userProfile.email || "", bio: userProfile.bio || "", avatar: userProfile.avatar || fallbackAvatar }); }
                setIsEditing((c) => !c);
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#f8fafc", padding: "8px 13px", fontSize: 12, fontWeight: 700, color: "#475569", cursor: "pointer", flexShrink: 0 }}
            >
              <PencilIcon style={{ width: 12, height: 12 }} />
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
            {[
              { label: "Contributions", value: userProfile.stats.contributions, color: "#059669", bg: "#ecfdf5" },
              { label: "Saved",         value: favoritePlaces.length || favorites.length, color: "#1d4ed8", bg: "#eff6ff" },
              { label: "Reviews",       value: userProfile.stats.reviews, color: "#d97706", bg: "#fffbeb" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: 14, padding: "12px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7280", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Upload progress */}
          {uploadingAvatar ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                <span>Uploading photo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, background: "#059669", width: `${uploadProgress}%`, transition: "width 0.3s" }} />
              </div>
            </div>
          ) : null}
        </div>

        {/* ── EDIT FORM ──────────────────────────────────────── */}
        {isEditing ? (
          <div style={{ marginTop: 12, background: "#fff", borderRadius: 20, padding: "20px", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.05)" }} className="fade-up-1">
            <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Edit Profile</p>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <ProfileField label="Full Name">
                  <input value={form.name} onChange={(e) => handleFieldChange("name", e.target.value)} style={inputStyle} placeholder="Your full name" />
                </ProfileField>
                <ProfileField label="Email">
                  <input type="email" value={form.email} onChange={(e) => handleFieldChange("email", e.target.value)} style={inputStyle} placeholder="you@example.com" />
                </ProfileField>
              </div>
              <ProfileField label="Bio">
                <textarea value={form.bio} onChange={(e) => handleFieldChange("bio", e.target.value)} rows={3} style={{ ...inputStyle, resize: "none" }} placeholder="Tell travelers about yourself..." />
              </ProfileField>
              <button
                type="submit"
                disabled={saving || uploadingAvatar}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, background: "#059669", color: "#fff", padding: "11px 22px", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", opacity: (saving || uploadingAvatar) ? 0.6 : 1, alignSelf: "flex-start", boxShadow: "0 4px 14px rgba(5,150,105,0.3)" }}
              >
                <PencilIcon style={{ width: 14, height: 14 }} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        ) : null}

        {/* ── MESSAGES ───────────────────────────────────────── */}
        {error ? (
          <div style={{ marginTop: 12, borderRadius: 14, background: "#fef2f2", border: "1.5px solid #fecaca", padding: "12px 16px", fontSize: 13, color: "#dc2626" }}>{error}</div>
        ) : null}
        {success ? (
          <div style={{ marginTop: 12, borderRadius: 14, background: "#ecfdf5", border: "1.5px solid #bbf7d0", padding: "12px 16px", fontSize: 13, color: "#059669" }}>{success}</div>
        ) : null}

        {/* ── SAVED PLACES ───────────────────────────────────── */}
        {favoritePlaces.length ? (
          <div style={{ marginTop: 16, background: "#fff", borderRadius: 20, padding: "18px", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.05)" }} className="fade-up-1">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #ffe4e6, #fecdd3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>❤️</div>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Saved Places</p>
              </div>
              <Link href="/favorites" style={{ fontSize: 12, fontWeight: 700, color: "#059669", textDecoration: "none" }}>See all →</Link>
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

        {/* ── CONTRIBUTIONS ──────────────────────────────────── */}
        <div style={{ marginTop: 16, background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 16px rgba(15,23,42,0.05)" }} className="fade-up-2">
          <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📝</div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#059669", marginBottom: 1 }}>Activity</p>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>My Contributions</h2>
            </div>
          </div>
          <div>
            {contributionItems.length ? (
              <>
                {contributionItems.slice((contribPage - 1) * CONTRIB_PER_PAGE, contribPage * CONTRIB_PER_PAGE).map((item, index, arr) => (
                  <div
                    key={item.id}
                    style={{ padding: "14px 18px", borderBottom: index < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", wordBreak: "break-word" }}>{item.name}</p>
                        <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{item.location} · {item.dateLabel}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "3px 10px",
                          background: item.status === "Published" ? "#ecfdf5" : "#fffbeb",
                          color: item.status === "Published" ? "#059669" : "#d97706",
                        }}>
                          {item.status}
                        </span>
                        <ActionBtn label="Edit" onClick={() => beginContributionEdit(item)} icon={PencilIcon} />
                        <ActionBtn label="Delete" onClick={() => handleContributionDelete(item.slug || item.id)} icon={TrashIcon} danger />
                      </div>
                    </div>

                    {editingContributionId === (item.slug || item.id) ? (
                      <div style={{ marginTop: 12, borderRadius: 16, background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "14px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                          <input value={contributionForm.name} onChange={(e) => setContributionForm((c) => ({ ...c, name: e.target.value }))} style={inputStyle} placeholder="Place name" />
                          <input value={contributionForm.location} onChange={(e) => setContributionForm((c) => ({ ...c, location: e.target.value }))} style={inputStyle} placeholder="Location" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                          <select value={contributionForm.category} onChange={(e) => setContributionForm((c) => ({ ...c, category: e.target.value }))} style={inputStyle}>
                            <option value="attraction">Attraction</option>
                            <option value="food">Food</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="hotel">Hotel</option>
                            <option value="stay">Stay</option>
                          </select>
                          <select value={contributionForm.district} onChange={(e) => setContributionForm((c) => ({ ...c, district: e.target.value }))} style={inputStyle}>
                            <option value="">District</option>
                            {allDistricts.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <textarea rows={3} value={contributionForm.description} onChange={(e) => setContributionForm((c) => ({ ...c, description: e.target.value }))} style={{ ...inputStyle, resize: "none", marginBottom: 10 }} placeholder="Description" />

                        {/* ── PHOTOS ── */}
                        <div style={{ marginBottom: 10 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Photos</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                            {(contributionImages[item.slug || item.id] || []).map((img) => (
                              <div key={img.id} style={{ position: "relative", width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: "1.5px solid #e2e8f0", flexShrink: 0, background: "#f1f5f9" }}>
                                {img.image_url ? (
                                  <img
                                    src={img.image_url}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                  />
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => handleContributionImageDelete(item.slug || item.id, img.id)}
                                  style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(239,68,68,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, lineHeight: 1 }}
                                  aria-label="Remove photo"
                                >✕</button>
                              </div>
                            ))}
                            <button
                              type="button"
                              disabled={imageUploading}
                              onClick={() => {
                                activeUploadSlug.current = item.slug || item.id;
                                placeFileInputRef.current?.click();
                              }}
                              style={{ width: 72, height: 72, borderRadius: 10, border: "1.5px dashed #cbd5e1", background: "#fff", cursor: imageUploading ? "not-allowed" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "#6b7280", fontSize: 11, fontWeight: 600, flexShrink: 0, opacity: imageUploading ? 0.6 : 1 }}
                            >
                              <CameraIcon style={{ width: 16, height: 16 }} />
                              {imageUploading ? "..." : "Add"}
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="button" onClick={() => handleContributionSave(item.slug || item.id)} style={saveBtn}>Save</button>
                          <button type="button" onClick={() => setEditingContributionId("")} style={cancelBtn}>Cancel</button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}

                {/* Single shared file input — activeUploadSlug.current tracks which place */}
                <input
                  ref={placeFileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    const slug = activeUploadSlug.current;
                    if (f && slug) handleContributionImageUpload(slug, f);
                  }}
                />

                {/* Pagination */}
                {Math.ceil(contributionItems.length / CONTRIB_PER_PAGE) > 1 && (
                  <div style={{ overflowX: "auto", borderTop: "1px solid #f1f5f9", padding: "12px 18px" }}>
                    <div style={{ display: "flex", gap: 6, width: "max-content" }}>
                      {Array.from({ length: Math.ceil(contributionItems.length / CONTRIB_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setContribPage(page)}
                          style={{
                            width: 30, height: 30, borderRadius: "50%", border: "1.5px solid",
                            borderColor: contribPage === page ? "#059669" : "#e2e8f0",
                            background: contribPage === page ? "#059669" : "#fff",
                            color: contribPage === page ? "#fff" : "#64748b",
                            fontSize: 12, fontWeight: 700, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: "32px 18px", textAlign: "center", fontSize: 13, color: "#6b7280" }}>No contributions yet. <Link href="/add" style={{ color: "#059669", fontWeight: 700 }}>Add one →</Link></div>
            )}
          </div>
        </div>

        {/* ── REVIEWS ────────────────────────────────────────── */}
        <div style={{ marginTop: 16, background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 16px rgba(15,23,42,0.05)" }} className="fade-up-2">
          <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #fffbeb, #fde68a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⭐</div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#d97706", marginBottom: 1 }}>Community</p>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>Recent Reviews</h2>
            </div>
          </div>
          <div>
            {recentReviews.length ? (
              recentReviews.slice(0, 4).map((review, index) => (
                <div
                  key={review.id}
                  style={{ padding: "14px 18px", borderBottom: index < Math.min(recentReviews.length, 4) - 1 ? "1px solid #f1f5f9" : "none" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{review.placeName}</p>
                      <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{review.author}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: "#fffbeb", color: "#d97706", borderRadius: 999, padding: "3px 10px" }}>★ {review.rating}.0</span>
                      <ActionBtn label="Edit" onClick={() => beginReviewEdit(review)} icon={PencilIcon} />
                      <ActionBtn label="Delete" onClick={() => handleReviewDelete(review.reviewId || review.id)} icon={TrashIcon} danger />
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#475569", marginTop: 8, lineHeight: 1.6 }}>{review.comment}</p>

                  {editingReviewId === (review.reviewId || review.id) ? (
                    <div style={{ marginTop: 12, borderRadius: 16, background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "14px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, marginBottom: 10 }}>
                        <select value={reviewForm.rating} onChange={(e) => setReviewForm((c) => ({ ...c, rating: Number(e.target.value) }))} style={inputStyle}>
                          {[5, 4, 3, 2, 1].map((v) => <option key={v} value={v}>{v} Star{v > 1 ? "s" : ""}</option>)}
                        </select>
                        <textarea rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm((c) => ({ ...c, comment: e.target.value }))} style={{ ...inputStyle, resize: "none" }} placeholder="Update your review" />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" onClick={() => handleReviewSave(review.reviewId || review.id)} style={saveBtn}>Save</button>
                        <button type="button" onClick={() => setEditingReviewId("")} style={cancelBtn}>Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div style={{ padding: "32px 18px", textAlign: "center", fontSize: 13, color: "#6b7280" }}>No reviews yet.</div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ProfileField({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

function ActionBtn({ label, onClick, icon: Icon, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        background: danger ? "#fee2e2" : "#f1f5f9",
        color: danger ? "#ef4444" : "#64748b",
      }}
    >
      <Icon style={{ width: 13, height: 13 }} />
    </button>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 12,
  border: "1.5px solid #e2e8f0",
  background: "#fff",
  fontSize: 13,
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const saveBtn = {
  padding: "8px 18px", borderRadius: 999, background: "#059669", border: "none",
  color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
};

const cancelBtn = {
  padding: "8px 18px", borderRadius: 999, background: "#fff", border: "1.5px solid #e2e8f0",
  color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
