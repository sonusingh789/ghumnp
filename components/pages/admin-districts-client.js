"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/layout/admin-shell";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=75";

const PROVINCE_COLORS = {
  "Koshi":          { color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
  "Madhesh":        { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  "Bagmati":        { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  "Gandaki":        { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  "Lumbini":        { color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
  "Karnali":        { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  "Sudurpashchim":  { color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
};

function provinceStyle(name) {
  return PROVINCE_COLORS[name] || { color: "#475569", bg: "#f1f5f9", border: "#e2e8f0" };
}

const PROVINCE_FILTERS = ["All", ...Object.keys(PROVINCE_COLORS)];

export default function AdminDistrictsClient({ initialDistricts }) {
  const [districts, setDistricts] = useState(
    initialDistricts.map((d) => ({ ...d, is_featured: Boolean(d.is_featured) }))
  );
  const [toggling, setToggling] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState({});
  const [search, setSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("All");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [toast, setToast] = useState({ msg: "", ok: true });
  const fileInputRefs = useRef({});

  function showToast(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  }

  async function handleToggle(district) {
    const next = !district.is_featured;
    setToggling((prev) => ({ ...prev, [district.id]: true }));
    setDistricts((prev) =>
      prev.map((d) => (d.id === district.id ? { ...d, is_featured: next } : d))
    );
    try {
      const res = await fetch("/api/admin/districts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ districtId: district.id, isFeatured: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDistricts((prev) =>
          prev.map((d) => (d.id === district.id ? { ...d, is_featured: !next } : d))
        );
        showToast(data.error || "Failed to update.", false);
      } else {
        showToast(next ? `${district.name} featured ✓` : `${district.name} unfeatured`, true);
      }
    } catch {
      setDistricts((prev) =>
        prev.map((d) => (d.id === district.id ? { ...d, is_featured: !next } : d))
      );
      showToast("Network error. Please try again.", false);
    } finally {
      setToggling((prev) => ({ ...prev, [district.id]: false }));
    }
  }

  async function handlePhotoUpload(district, file) {
    if (!file) return;
    setUploadingPhoto((prev) => ({ ...prev, [district.id]: true }));
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsDataURL(file);
      });
      const uploadRes = await fetch("/api/uploads/imagekit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: dataUrl,
          fileName: `district-${district.slug}-${Date.now()}`,
          mimeType: file.type || "image/jpeg",
          folderType: "districts",
        }),
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed.");
      const patchRes = await fetch("/api/admin/districts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ districtId: district.id, imageUrl: uploadData.url }),
      });
      if (!patchRes.ok) throw new Error("Failed to save image URL.");
      setDistricts((prev) =>
        prev.map((d) => (d.id === district.id ? { ...d, image_url: uploadData.url } : d))
      );
      showToast(`${district.name} photo updated`);
    } catch (err) {
      showToast(err.message || "Upload failed.", false);
    } finally {
      setUploadingPhoto((prev) => ({ ...prev, [district.id]: false }));
    }
  }

  async function handlePhotoRemove(district) {
    setUploadingPhoto((prev) => ({ ...prev, [district.id]: true }));
    try {
      const res = await fetch("/api/admin/districts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ districtId: district.id, imageUrl: null }),
      });
      if (!res.ok) throw new Error("Failed to remove photo.");
      setDistricts((prev) =>
        prev.map((d) => (d.id === district.id ? { ...d, image_url: null } : d))
      );
      showToast(`${district.name} photo removed`);
    } catch (err) {
      showToast(err.message || "Remove failed.", false);
    } finally {
      setUploadingPhoto((prev) => ({ ...prev, [district.id]: false }));
    }
  }

  const featuredCount = districts.filter((d) => d.is_featured).length;

  const filtered = districts.filter((d) => {
    if (showFeaturedOnly && !d.is_featured) return false;
    if (provinceFilter !== "All" && d.province_name !== provinceFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.province_name?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AdminShell>

      {/* ── HEADER ────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 6 }}>Districts</p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 6 }}>Manage Districts</h1>
            <p style={{ fontSize: 13, color: "#64748b" }}>
              Feature districts on the home page and edit their travel guide content.
            </p>
          </div>
          {/* Featured count badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ecfdf5", border: "1.5px solid #a7f3d0", borderRadius: 14, padding: "10px 16px", flexShrink: 0 }}>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#059669", lineHeight: 1 }}>{featuredCount}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.1em" }}>Featured</p>
            </div>
            <div style={{ width: 1, height: 32, background: "#a7f3d0" }} />
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#64748b", lineHeight: 1 }}>77</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTERS ───────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search district or province…"
            style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fff" }}
          />
        </div>

        {/* Province filter + featured toggle */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", flex: 1 }}>
            {PROVINCE_FILTERS.map((p) => {
              const active = provinceFilter === p;
              const ps = p !== "All" ? provinceStyle(p) : null;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvinceFilter(p)}
                  style={{ padding: "5px 12px", borderRadius: 999, border: `1.5px solid ${active ? (ps?.border || "#0f172a") : "#e2e8f0"}`, background: active ? (ps?.bg || "#0f172a") : "#fff", color: active ? (ps?.color || "#0f172a") : "#64748b", fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowFeaturedOnly((v) => !v)}
            style={{ padding: "5px 14px", borderRadius: 999, border: `1.5px solid ${showFeaturedOnly ? "#a7f3d0" : "#e2e8f0"}`, background: showFeaturedOnly ? "#ecfdf5" : "#fff", color: showFeaturedOnly ? "#059669" : "#64748b", fontSize: 12, fontWeight: showFeaturedOnly ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}
          >
            ⭐ Featured only
          </button>
        </div>

        {/* Result count */}
        <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
          Showing <strong style={{ color: "#475569" }}>{filtered.length}</strong> of 77 districts
        </p>
      </div>

      {/* ── DISTRICT LIST ─────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0" }}>
            <p style={{ fontSize: 24, marginBottom: 8 }}>🔍</p>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>No districts match</p>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          filtered.map((district) => {
            const pStyle = provinceStyle(district.province_name);
            const busy = uploadingPhoto[district.id];
            const featured = district.is_featured;
            return (
              <div
                key={district.id}
                style={{
                  borderRadius: 16,
                  border: `1.5px solid ${featured ? "#a7f3d0" : "#e2e8f0"}`,
                  background: featured ? "#f0fdf4" : "#fff",
                  overflow: "hidden",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                {/* ── Top row: thumbnail + info + toggle ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                  {/* Thumbnail with camera overlay */}
                  <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                      <img
                        src={district.image_url || FALLBACK_IMAGE}
                        alt={district.name}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => fileInputRefs.current[district.id]?.click()}
                      title="Change cover photo"
                      style={{ position: "absolute", inset: 0, borderRadius: 12, border: "none", background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: 14, cursor: busy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: busy ? 1 : 0, transition: "opacity 0.15s" }}
                      onMouseEnter={(e) => { if (!busy) e.currentTarget.style.opacity = 1; }}
                      onMouseLeave={(e) => { if (!busy) e.currentTarget.style.opacity = 0; }}
                    >
                      {busy ? "⏳" : "📷"}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={(el) => { fileInputRefs.current[district.id] = el; }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) handlePhotoUpload(district, f);
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                        {district.name}
                      </p>
                      {featured && (
                        <span style={{ fontSize: 9, fontWeight: 800, borderRadius: 999, padding: "2px 7px", background: "#dcfce7", color: "#15803d", flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Featured
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 9px", background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}` }}>
                      {district.province_name}
                    </span>
                  </div>

                  {/* Featured toggle — only primary action in top row */}
                  <button
                    type="button"
                    disabled={toggling[district.id]}
                    onClick={() => handleToggle(district)}
                    aria-label={featured ? "Remove from featured" : "Mark as featured"}
                    style={{ width: 44, height: 26, borderRadius: 999, border: "none", cursor: toggling[district.id] ? "not-allowed" : "pointer", background: featured ? "#059669" : "#cbd5e1", position: "relative", flexShrink: 0, transition: "background 0.2s", opacity: toggling[district.id] ? 0.6 : 1 }}
                  >
                    <span style={{ position: "absolute", top: 3, left: featured ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                  </button>
                </div>

                {/* ── Bottom action bar ── */}
                <div style={{ borderTop: `1px solid ${featured ? "#bbf7d0" : "#f1f5f9"}`, padding: "7px 12px", display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileInputRefs.current[district.id]?.click()}
                    style={{ flex: 1, padding: "5px 8px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 11, fontWeight: 600, color: "#64748b", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.5 : 1 }}
                  >
                    {busy ? "Uploading…" : "📷 Photo"}
                  </button>
                  {district.image_url && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handlePhotoRemove(district)}
                      title="Remove photo"
                      style={{ padding: "5px 8px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fef2f2", color: "#dc2626", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: busy ? 0.5 : 1, whiteSpace: "nowrap" }}
                    >
                      🗑
                    </button>
                  )}
                  <Link
                    href={`/admin/districts/${district.slug}`}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3, fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1.5px solid #ddd6fe", borderRadius: 8, padding: "5px 8px", textDecoration: "none" }}
                  >
                    ✏️ Edit
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Toast */}
      {toast.msg ? (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.ok ? "#059669" : "#dc2626", color: "#fff", borderRadius: 999, padding: "10px 22px", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.18)", zIndex: 9999, whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      ) : null}
    </AdminShell>
  );
}
