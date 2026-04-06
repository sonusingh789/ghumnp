"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminShell from "@/components/layout/admin-shell";

const PROVINCE_COLORS = {
  "Koshi":          { color: "#0891b2", bg: "#ecfeff" },
  "Madhesh":        { color: "#d97706", bg: "#fffbeb" },
  "Bagmati":        { color: "#059669", bg: "#ecfdf5" },
  "Gandaki":        { color: "#7c3aed", bg: "#f5f3ff" },
  "Lumbini":        { color: "#db2777", bg: "#fdf2f8" },
  "Karnali":        { color: "#dc2626", bg: "#fef2f2" },
  "Sudurpashchim":  { color: "#ea580c", bg: "#fff7ed" },
};

function provinceStyle(name) {
  return PROVINCE_COLORS[name] || { color: "#475569", bg: "#f1f5f9" };
}

export default function AdminDistrictsClient({ initialDistricts }) {
  const [districts, setDistricts] = useState(
    initialDistricts.map((d) => ({ ...d, is_featured: Boolean(d.is_featured) }))
  );
  const [toggling, setToggling] = useState({});
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ msg: "", ok: true });

  function showToast(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  }

  async function handleToggle(district) {
    const next = !district.is_featured;
    setToggling((prev) => ({ ...prev, [district.id]: true }));
    // Optimistic update
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
        // Revert on error
        setDistricts((prev) =>
          prev.map((d) => (d.id === district.id ? { ...d, is_featured: !next } : d))
        );
        showToast(data.error || "Failed to update.", false);
      } else {
        showToast(
          next ? `${district.name} marked as featured` : `${district.name} removed from featured`,
          true
        );
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

  const filtered = search.trim()
    ? districts.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.province_name?.toLowerCase().includes(search.toLowerCase())
      )
    : districts;

  const featuredCount = districts.filter((d) => d.is_featured).length;

  return (
    <AdminShell>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/admin"
          style={{ fontSize: 12, color: "#64748b", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 10 }}
        >
          ← Dashboard
        </Link>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 4 }}>Admin</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 4 }}>Featured Districts</h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>
          Tick districts to feature them on the home page.{" "}
          <span style={{ fontWeight: 700, color: "#059669" }}>{featuredCount}</span> of 77 currently featured.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search district or province..."
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1.5px solid #e2e8f0",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
            background: "#f8fafc",
          }}
        />
      </div>

      {/* Districts list */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "32px 18px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
            No districts match your search.
          </div>
        ) : (
          filtered.map((district, index) => {
            const pStyle = provinceStyle(district.province_name);
            const isLast = index === filtered.length - 1;
            return (
              <div
                key={district.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: isLast ? "none" : "1px solid #f1f5f9",
                  background: district.is_featured ? "#f0fdf4" : "#fff",
                  transition: "background 0.2s",
                }}
              >
                {/* Thumbnail */}
                <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f1f5f9" }}>
                  {district.image_url ? (
                    <Image
                      src={district.image_url}
                      alt={district.name}
                      width={44}
                      height={44}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏔️</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {district.name}
                  </p>
                  <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 8px", background: pStyle.bg, color: pStyle.color }}>
                    {district.province_name}
                  </span>
                </div>

                {/* Featured badge */}
                {district.is_featured && (
                  <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "3px 9px", background: "#dcfce7", color: "#15803d", flexShrink: 0 }}>
                    Featured
                  </span>
                )}

                {/* Toggle */}
                <button
                  type="button"
                  disabled={toggling[district.id]}
                  onClick={() => handleToggle(district)}
                  aria-label={district.is_featured ? "Remove from featured" : "Mark as featured"}
                  style={{
                    width: 44,
                    height: 26,
                    borderRadius: 999,
                    border: "none",
                    cursor: toggling[district.id] ? "not-allowed" : "pointer",
                    background: district.is_featured ? "#059669" : "#e2e8f0",
                    position: "relative",
                    flexShrink: 0,
                    transition: "background 0.2s",
                    opacity: toggling[district.id] ? 0.6 : 1,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: district.is_featured ? 21 : 3,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Toast */}
      {toast.msg ? (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.ok ? "#059669" : "#dc2626",
            color: "#fff",
            borderRadius: 999,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            zIndex: 9999,
            whiteSpace: "nowrap",
          }}
        >
          {toast.msg}
        </div>
      ) : null}
    </AdminShell>
  );
}
