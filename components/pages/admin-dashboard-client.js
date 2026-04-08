"use client";

import Link from "next/link";
import AdminShell from "@/components/layout/admin-shell";

const QUICK_ACTIONS = [
  { href: "/admin/pending",   icon: "⏳", label: "Review Pending",       desc: "Approve or reject submitted places",       color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { href: "/admin/places",    icon: "🏛️", label: "Browse Places",         desc: "Search and manage all listings",           color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  { href: "/admin/districts", icon: "🗺️", label: "Manage Districts",      desc: "Featured & travel guide content",          color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
  { href: "/admin/users",     icon: "👤", label: "Manage Users",          desc: "View, ban, or promote contributors",       color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  { href: "/admin/reports",   icon: "🚩", label: "Reports & Suggestions", desc: "Review flags and edit proposals",          color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
];

export default function AdminDashboardClient({ stats }) {
  const p = stats.places || {};

  return (
    <AdminShell>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 6 }}>Overview</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>visitNepal77 platform at a glance</p>
      </div>

      {/* ── PLACES STATS ─────────────────────────────────── */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12 }}>Places</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        <Link href="/admin/places" style={{ textDecoration: "none", gridColumn: "1 / -1", background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#94a3b8", marginBottom: 4 }}>All Places</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{p.total ?? "—"}</p>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f8fafc", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏛️</div>
        </Link>

        <Link href="/admin/pending" style={{ textDecoration: "none", background: "#fffbeb", borderRadius: 16, padding: "16px", border: "1.5px solid #fde68a" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#d97706", marginBottom: 6 }}>Pending</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: "#d97706", lineHeight: 1 }}>{p.pending ?? "—"}</p>
          <p style={{ fontSize: 11, color: "#92400e", marginTop: 4, fontWeight: 500 }}>awaiting review</p>
        </Link>

        <Link href="/admin/places?status=approved" style={{ textDecoration: "none", background: "#ecfdf5", borderRadius: 16, padding: "16px", border: "1.5px solid #a7f3d0" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#059669", marginBottom: 6 }}>Approved</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: "#059669", lineHeight: 1 }}>{p.approved ?? "—"}</p>
          <p style={{ fontSize: 11, color: "#065f46", marginTop: 4, fontWeight: 500 }}>live on site</p>
        </Link>
      </div>

      {/* ── COMMUNITY STATS ──────────────────────────────── */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12 }}>Community</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 32 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", border: "1.5px solid #e2e8f0" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6366f1", marginBottom: 6 }}>Users</p>
          <p style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{stats.users ?? "—"}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", border: "1.5px solid #e2e8f0" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#0891b2", marginBottom: 6 }}>Reviews</p>
          <p style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{stats.reviews ?? "—"}</p>
        </div>
        <Link href="/admin/reports" style={{ textDecoration: "none", background: stats.open_reports > 0 ? "#fef2f2" : "#fff", borderRadius: 16, padding: "14px 16px", border: `1.5px solid ${stats.open_reports > 0 ? "#fecaca" : "#e2e8f0"}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#dc2626", marginBottom: 6 }}>Reports</p>
          <p style={{ fontSize: 24, fontWeight: 900, color: stats.open_reports > 0 ? "#dc2626" : "#0f172a", lineHeight: 1 }}>{stats.open_reports ?? "—"}</p>
        </Link>
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────── */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12 }}>Quick Actions</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {QUICK_ACTIONS.map(({ href, icon, label, desc, color, bg, border }) => (
          <Link key={href} href={href} style={{ textDecoration: "none", background: "#fff", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.15s, box-shadow 0.15s" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 1 }}>{label}</p>
              <p style={{ fontSize: 12, color: "#64748b" }}>{desc}</p>
            </div>
            <span style={{ fontSize: 16, color: color, flexShrink: 0 }}>→</span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
